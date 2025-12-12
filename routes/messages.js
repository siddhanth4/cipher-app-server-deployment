// server/routes/messages.js
import express from "express";
import CryptoJS from "crypto-js";

const router = express.Router();

// ================== KEY GENERATORS ==================
const generateKey = (algorithm) => {
  switch (algorithm) {
    case "DES":
      return CryptoJS.lib.WordArray.random(64 / 8).toString();
    case "AES":
      return CryptoJS.lib.WordArray.random(128 / 8).toString();
    case "Blowfish":
      return CryptoJS.lib.WordArray.random(128 / 8).toString();
    default:
      return null;
  }
};

// ================== ENCRYPT FUNCTIONS ==================
const encryptMessage = (text, secretKey, algorithm) => {
  switch (algorithm) {
    case "DES":
      return CryptoJS.DES.encrypt(text, secretKey).toString();
    case "AES":
      return CryptoJS.AES.encrypt(text, secretKey).toString();
    case "Blowfish":
      return CryptoJS.Blowfish.encrypt(text, secretKey).toString();
    default:
      throw new Error("Unsupported algorithm for symmetric encrypt");
  }
};

// ================== DECRYPT FUNCTIONS ==================
const decryptMessage = (encryptedText, secretKey, algorithm) => {
  switch (algorithm) {
    case "DES":
      return CryptoJS.DES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
    case "AES":
      return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
    case "Blowfish":
      return CryptoJS.Blowfish.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
    default:
      throw new Error("Unsupported algorithm for symmetric decrypt");
  }
};

// ================== ENCRYPT ROUTE ==================
router.post("/encrypt", (req, res) => {
  const { plainText, algorithm } = req.body;

  try {
    const secretKey = generateKey(algorithm);
    const encryptedText = encryptMessage(plainText, secretKey, algorithm);

    res.status(200).json({
      encryptedText,
      secretKey,
      algorithm,
    });
  } catch (err) {
    console.error("Encrypt error:", err.message);
    res.status(400).json({ error: "Encryption failed" });
  }
});

// ================== DECRYPT ROUTE ==================
router.post("/decrypt", (req, res) => {
  const { encryptedText, secretKey, algorithm, originalAlgorithm } = req.body;

  try {
    // Check for algorithm mismatch
    if (originalAlgorithm && originalAlgorithm !== algorithm) {
      return res
        .status(400)
        .json({ errorType: "algorithm", error: "Select Correct Algorithm" });
    }

    const decryptedText = decryptMessage(encryptedText, secretKey, algorithm);

    if (!decryptedText) {
      return res
        .status(400)
        .json({ errorType: "key", error: "Wrong key or ciphertext." });
    }

    res.status(200).json({ decryptedText });
  } catch (error) {
    console.error("Decrypt error:", error.message);
    res
      .status(400)
      .json({ errorType: "key", error: "Wrong key or ciphertext." });
  }
});

export default router;
