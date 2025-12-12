// server/routes/messages.js
import express from "express";
import crypto from "crypto";

const router = express.Router();

const bytesToHex = (b) => Buffer.from(b).toString("hex");
const hexToBuffer = (hex) => Buffer.from(hex, "hex");

const generateKey = (algorithm) => {
  switch (algorithm) {
    case "AES":
      return bytesToHex(crypto.randomBytes(32)); // 256-bit AES key
    case "DES": // we use 3DES (des-ede3-cbc)
      return bytesToHex(crypto.randomBytes(24)); // 192-bit (3 x 64)
    default:
      return null;
  }
};

const encryptAES = (plainText, keyHex) => {
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  return { ciphertext: encrypted.toString("base64"), iv: iv.toString("base64") };
};

const decryptAES = (cipherBase64, keyHex, ivBase64) => {
  const key = hexToBuffer(keyHex);
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherBase64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
};

const encrypt3DES = (plainText, keyHex) => {
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(8);
  const cipher = crypto.createCipheriv("des-ede3-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  return { ciphertext: encrypted.toString("base64"), iv: iv.toString("base64") };
};

const decrypt3DES = (cipherBase64, keyHex, ivBase64) => {
  const key = hexToBuffer(keyHex);
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("des-ede3-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(cipherBase64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
};

const encryptMessage = (text, secretKeyHex, algorithm) => {
  switch (algorithm) {
    case "AES":
      return encryptAES(text, secretKeyHex);
    case "DES":
      return encrypt3DES(text, secretKeyHex);
    default:
      throw new Error("Unsupported algorithm for symmetric encrypt");
  }
};

const decryptMessage = (ciphertextBase64, secretKeyHex, ivBase64, algorithm) => {
  switch (algorithm) {
    case "AES":
      return decryptAES(ciphertextBase64, secretKeyHex, ivBase64);
    case "DES":
      return decrypt3DES(ciphertextBase64, secretKeyHex, ivBase64);
    default:
      throw new Error("Unsupported algorithm for symmetric decrypt");
  }
};

router.post("/encrypt", (req, res) => {
  const { plainText, algorithm } = req.body;
  try {
    if (!plainText || !algorithm) return res.status(400).json({ error: "plainText and algorithm required" });
    if (!["AES", "DES"].includes(algorithm)) return res.status(400).json({ error: "Unsupported algorithm" });

    const secretKey = generateKey(algorithm);
    if (!secretKey) return res.status(500).json({ error: "Failed to generate key" });

    const { ciphertext, iv } = encryptMessage(plainText, secretKey, algorithm);
    // NOTE: returning secretKey is for demo only. In production do NOT leak raw keys.
    return res.status(200).json({ ciphertext, secretKey, iv, algorithm });
  } catch (err) {
    console.error("Encrypt error:", err);
    return res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

router.post("/decrypt", (req, res) => {
  const { ciphertext, secretKey, iv, algorithm, originalAlgorithm } = req.body;
  try {
    if (!ciphertext || !secretKey || !iv || !algorithm) {
      return res.status(400).json({ error: "ciphertext, secretKey, iv and algorithm required" });
    }
    if (originalAlgorithm && originalAlgorithm !== algorithm) {
      return res.status(400).json({ errorType: "algorithm", error: "Select Correct Algorithm" });
    }
    if (!["AES", "DES"].includes(algorithm)) return res.status(400).json({ error: "Unsupported algorithm" });

    const decryptedText = decryptMessage(ciphertext, secretKey, iv, algorithm);
    return res.status(200).json({ decryptedText });
  } catch (err) {
    console.error("Decrypt error:", err);
    return res.status(400).json({ errorType: "key", error: "Wrong key or ciphertext.", details: err.message });
  }
});

export default router;
