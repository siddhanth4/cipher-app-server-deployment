// // server/routes/messages.js
import express from "express";
import crypto from "crypto";
import Blowfish from "egoroof-blowfish";

const router = express.Router();

const bytesToHex = (b) => Buffer.from(b).toString("hex");
const hexToBuffer = (hex) => Buffer.from(hex, "hex");

/**
 * Key sizes:
 * - AES-256: 32 bytes key, IV 16 bytes
 * - 3DES (des-ede3-cbc): 24 bytes key, IV 8 bytes
 * - Blowfish (CBC): we use 16-byte key, IV 8 bytes
 */
const generateKey = (algorithm) => {
  switch (algorithm) {
    case "AES":
      return bytesToHex(crypto.randomBytes(32));
    case "DES": // we map DES option to 3DES (des-ede3-cbc)
      return bytesToHex(crypto.randomBytes(24));
    case "Blowfish":
      return bytesToHex(crypto.randomBytes(16));
    default:
      return null;
  }
};

/* AES (aes-256-cbc) */
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

/* 3DES (des-ede3-cbc) */
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

/* Blowfish using egoroof-blowfish (CBC, PKCS5) */
const encryptBlowfish = (plainText, keyHex) => {
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(8); // block size = 8
  const bf = new Blowfish(key, Blowfish.MODE.CBC, Blowfish.PADDING.PKCS5);
  bf.setIv(iv);
  const encryptedBytes = bf.encode(String(plainText));
  return { ciphertext: Buffer.from(encryptedBytes).toString("base64"), iv: iv.toString("base64") };
};
const decryptBlowfish = (cipherBase64, keyHex, ivBase64) => {
  const key = hexToBuffer(keyHex);
  const iv = Buffer.from(ivBase64, "base64");
  const bf = new Blowfish(key, Blowfish.MODE.CBC, Blowfish.PADDING.PKCS5);
  bf.setIv(iv);
  const decoded = bf.decode(Buffer.from(cipherBase64, "base64"));
  return Buffer.from(decoded).toString("utf8");
};

/* Dispatcher */
const encryptMessage = (text, secretKeyHex, algorithm) => {
  switch (algorithm) {
    case "AES":
      return encryptAES(text, secretKeyHex);
    case "DES":
      return encrypt3DES(text, secretKeyHex);
    case "Blowfish":
      return encryptBlowfish(text, secretKeyHex);
    default:
      throw new Error("Unsupported algorithm for symmetric encrypt");
  }
};

const decryptMessage = (cipherBase64, secretKeyHex, ivBase64, algorithm) => {
  switch (algorithm) {
    case "AES":
      return decryptAES(cipherBase64, secretKeyHex, ivBase64);
    case "DES":
      return decrypt3DES(cipherBase64, secretKeyHex, ivBase64);
    case "Blowfish":
      return decryptBlowfish(cipherBase64, secretKeyHex, ivBase64);
    default:
      throw new Error("Unsupported algorithm for symmetric decrypt");
  }
};

/* Routes */

/* POST /api/messages/encrypt
   body: { plainText, algorithm }
   response: { ciphertext, secretKey, iv, algorithm } */
router.post("/encrypt", (req, res) => {
  const { plainText, algorithm } = req.body;

  try {
    if (!plainText || !algorithm) {
      return res.status(400).json({ error: "plainText and algorithm required" });
    }
    if (!["AES", "DES", "Blowfish"].includes(algorithm)) {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const secretKey = generateKey(algorithm);
    if (!secretKey) return res.status(500).json({ error: "Key generation failed" });

    const { ciphertext, iv } = encryptMessage(plainText, secretKey, algorithm);

    // Demo: return secretKey and iv so client can decrypt later.
    // PRODUCTION: do NOT return/store raw secret keys.
    return res.status(200).json({ ciphertext, secretKey, iv, algorithm });
  } catch (err) {
    console.error("Encrypt error:", err);
    return res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

/* POST /api/messages/decrypt
   body: { ciphertext, secretKey, iv, algorithm, originalAlgorithm? }
   response: { decryptedText } */
router.post("/decrypt", (req, res) => {
  const { ciphertext, secretKey, iv, algorithm, originalAlgorithm } = req.body;

  try {
    if (!ciphertext || !secretKey || !iv || !algorithm) {
      return res.status(400).json({ error: "ciphertext, secretKey, iv and algorithm required" });
    }
    if (originalAlgorithm && originalAlgorithm !== algorithm) {
      return res.status(400).json({ errorType: "algorithm", error: "Select Correct Algorithm" });
    }
    if (!["AES", "DES", "Blowfish"].includes(algorithm)) {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const decryptedText = decryptMessage(ciphertext, secretKey, iv, algorithm);
    return res.status(200).json({ decryptedText });
  } catch (err) {
    console.error("Decrypt error:", err);
    return res.status(400).json({ errorType: "key", error: "Wrong key or ciphertext.", details: err.message });
  }
});

export default router;
