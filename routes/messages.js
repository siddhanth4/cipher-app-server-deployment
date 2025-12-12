// // // server/routes/messages.js
// // import express from "express";
// // import CryptoJS from "crypto-js";

// // const router = express.Router();

// // // ================== KEY GENERATORS ==================
// // const generateKey = (algorithm) => {
// //   switch (algorithm) {
// //     case "DES":
// //       return CryptoJS.lib.WordArray.random(64 / 8).toString();
// //     case "AES":
// //       return CryptoJS.lib.WordArray.random(128 / 8).toString();
// //     case "Blowfish":
// //       return CryptoJS.lib.WordArray.random(128 / 8).toString();
// //     default:
// //       return null;
// //   }
// // };

// // // ================== ENCRYPT FUNCTIONS ==================
// // const encryptMessage = (text, secretKey, algorithm) => {
// //   switch (algorithm) {
// //     case "DES":
// //       return CryptoJS.DES.encrypt(text, secretKey).toString();
// //     case "AES":
// //       return CryptoJS.AES.encrypt(text, secretKey).toString();
// //     case "Blowfish":
// //       return CryptoJS.Blowfish.encrypt(text, secretKey).toString();
// //     default:
// //       throw new Error("Unsupported algorithm for symmetric encrypt");
// //   }
// // };

// // // ================== DECRYPT FUNCTIONS ==================
// // const decryptMessage = (encryptedText, secretKey, algorithm) => {
// //   switch (algorithm) {
// //     case "DES":
// //       return CryptoJS.DES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
// //     case "AES":
// //       return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
// //     case "Blowfish":
// //       return CryptoJS.Blowfish.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
// //     default:
// //       throw new Error("Unsupported algorithm for symmetric decrypt");
// //   }
// // };

// // // ================== ENCRYPT ROUTE ==================
// // router.post("/encrypt", (req, res) => {
// //   const { plainText, algorithm } = req.body;

// //   try {
// //     const secretKey = generateKey(algorithm);
// //     const encryptedText = encryptMessage(plainText, secretKey, algorithm);

// //     res.status(200).json({
// //       encryptedText,
// //       secretKey,
// //       algorithm,
// //     });
// //   } catch (err) {
// //     console.error("Encrypt error:", err.message);
// //     res.status(400).json({ error: "Encryption failed" });
// //   }
// // });

// // // ================== DECRYPT ROUTE ==================
// // router.post("/decrypt", (req, res) => {
// //   const { encryptedText, secretKey, algorithm, originalAlgorithm } = req.body;

// //   try {
// //     // Check for algorithm mismatch
// //     if (originalAlgorithm && originalAlgorithm !== algorithm) {
// //       return res
// //         .status(400)
// //         .json({ errorType: "algorithm", error: "Select Correct Algorithm" });
// //     }

// //     const decryptedText = decryptMessage(encryptedText, secretKey, algorithm);

// //     if (!decryptedText) {
// //       return res
// //         .status(400)
// //         .json({ errorType: "key", error: "Wrong key or ciphertext." });
// //     }

// //     res.status(200).json({ decryptedText });
// //   } catch (error) {
// //     console.error("Decrypt error:", error.message);
// //     res
// //       .status(400)
// //       .json({ errorType: "key", error: "Wrong key or ciphertext." });
// //   }
// // });

// // export default router;







// // server/routes/messages.js
// import express from "express";
// import CryptoJS from "crypto-js";

// const router = express.Router();

// const generateKey = (algorithm) => {
//   switch (algorithm) {
//     case "DES":
//       return CryptoJS.lib.WordArray.random(64 / 8).toString();
//     case "AES":
//       return CryptoJS.lib.WordArray.random(128 / 8).toString();
//     // Blowfish not available in crypto-js -> return null or error
//     default:
//       return null;
//   }
// };

// const encryptMessage = (text, secretKey, algorithm) => {
//   switch (algorithm) {
//     case "DES":
//       return CryptoJS.DES.encrypt(text, secretKey).toString();
//     case "AES":
//       return CryptoJS.AES.encrypt(text, secretKey).toString();
//     default:
//       throw new Error("Unsupported algorithm for symmetric encrypt");
//   }
// };

// const decryptMessage = (encryptedText, secretKey, algorithm) => {
//   switch (algorithm) {
//     case "DES":
//       return CryptoJS.DES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
//     case "AES":
//       return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
//     default:
//       throw new Error("Unsupported algorithm for symmetric decrypt");
//   }
// };

// router.post("/encrypt", (req, res) => {
//   const { plainText, algorithm } = req.body;
//   try {
//     if (!["DES", "AES"].includes(algorithm)) {
//       return res.status(400).json({ error: "Unsupported algorithm" });
//     }
//     const secretKey = generateKey(algorithm);
//     const encryptedText = encryptMessage(plainText, secretKey, algorithm);
//     res.status(200).json({ encryptedText, secretKey, algorithm });
//   } catch (err) {
//     console.error("Encrypt error:", err);
//     res.status(400).json({ error: "Encryption failed" });
//   }
// });

// router.post("/decrypt", (req, res) => {
//   const { encryptedText, secretKey, algorithm, originalAlgorithm } = req.body;
//   try {
//     if (originalAlgorithm && originalAlgorithm !== algorithm) {
//       return res.status(400).json({ errorType: "algorithm", error: "Select Correct Algorithm" });
//     }
//     if (!["DES", "AES"].includes(algorithm)) {
//       return res.status(400).json({ error: "Unsupported algorithm" });
//     }
//     const decryptedText = decryptMessage(encryptedText, secretKey, algorithm);
//     if (!decryptedText) {
//       return res.status(400).json({ errorType: "key", error: "Wrong key or ciphertext." });
//     }
//     res.status(200).json({ decryptedText });
//   } catch (error) {
//     console.error("Decrypt error:", error);
//     res.status(400).json({ errorType: "key", error: "Wrong key or ciphertext." });
//   }
// });

// export default router;



















// server/routes/messages.js
import express from "express";
import crypto from "crypto";
// Blowfish library - install with: npm install egoroof-blowfish
// If you don't want Blowfish, remove this import and related code.
import Blowfish from "egoroof-blowfish";

const router = express.Router();

/**
 * Key / IV helpers
 * - AES-256 uses 32 bytes key, 16 bytes IV
 * - 3DES (des-ede3-cbc) uses 24 bytes key, 8 bytes IV
 * - Blowfish: key size variable (we use 16 bytes here), IV 8 bytes (for CBC)
 */

const bytesToHex = (b) => Buffer.from(b).toString("hex");
const hexToBuffer = (hex) => Buffer.from(hex, "hex");

/**
 * Generate a secret key (hex string) appropriate to algorithm
 */
const generateKey = (algorithm) => {
  switch (algorithm) {
    case "AES":
      return bytesToHex(crypto.randomBytes(32)); // 256 bits
    case "DES": // we implement 3DES (des-ede3-cbc) for stronger security
      return bytesToHex(crypto.randomBytes(24)); // 192 bits (3 x 64)
    case "Blowfish":
      return bytesToHex(crypto.randomBytes(16)); // 128-bit key (Blowfish supports up to 448 bits)
    default:
      return null;
  }
};

/**
 * Encrypt helpers
 * Returns object: { ciphertext: <base64>, iv: <base64> }
 */
const encryptAES = (plainText, keyHex) => {
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(16); // AES block size 16
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
  // Node crypto uses 'des-ede3-cbc' for 3DES
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(8); // DES block size 8
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

/**
 * Blowfish using egoroof-blowfish
 * - We use CBC mode with PKCS5/PKCS7 padding
 * - The library expects Uint8Array/Buffer
 */
const encryptBlowfish = (plainText, keyHex) => {
  const key = hexToBuffer(keyHex);
  const iv = crypto.randomBytes(8); // Blowfish block size 8
  // create instance - MODE.CBC, PADDING.PKCS5
  const bf = new Blowfish(key, Blowfish.MODE.CBC, Blowfish.PADDING.PKCS5);
  bf.setIv(iv);
  const encryptedBytes = bf.encode(plainText); // returns Uint8Array/Buffer
  return { ciphertext: Buffer.from(encryptedBytes).toString("base64"), iv: iv.toString("base64") };
};

const decryptBlowfish = (cipherBase64, keyHex, ivBase64) => {
  const key = hexToBuffer(keyHex);
  const iv = Buffer.from(ivBase64, "base64");
  const bf = new Blowfish(key, Blowfish.MODE.CBC, Blowfish.PADDING.PKCS5);
  bf.setIv(iv);
  const decrypted = bf.decode(Buffer.from(cipherBase64, "base64")); // returns Buffer/Uint8Array
  // decode returns Buffer/Uint8Array containing the plaintext bytes
  return Buffer.from(decrypted).toString("utf8");
};

/**
 * Main wrappers
 */
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

const decryptMessage = (ciphertextBase64, secretKeyHex, ivBase64, algorithm) => {
  switch (algorithm) {
    case "AES":
      return decryptAES(ciphertextBase64, secretKeyHex, ivBase64);
    case "DES":
      return decrypt3DES(ciphertextBase64, secretKeyHex, ivBase64);
    case "Blowfish":
      return decryptBlowfish(ciphertextBase64, secretKeyHex, ivBase64);
    default:
      throw new Error("Unsupported algorithm for symmetric decrypt");
  }
};

/**
 * Routes
 *
 * Encrypt:
 *  - Request body: { plainText: string, algorithm: "AES"|"DES"|"Blowfish" }
 *  - Response: { ciphertext, secretKey, iv, algorithm }
 *
 * Decrypt:
 *  - Request body: { ciphertext, secretKey, iv, algorithm, originalAlgorithm? }
 *  - Response: { decryptedText }
 */

router.post("/encrypt", (req, res) => {
  const { plainText, algorithm } = req.body;

  try {
    if (!plainText || !algorithm) {
      return res.status(400).json({ error: "plainText and algorithm are required" });
    }
    if (!["AES", "DES", "Blowfish"].includes(algorithm)) {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const secretKey = generateKey(algorithm);
    if (!secretKey) {
      return res.status(500).json({ error: "Failed to generate key" });
    }

    const { ciphertext, iv } = encryptMessage(plainText, secretKey, algorithm);

    // IMPORTANT: For demo we return secretKey and iv so client can decrypt later.
    // In a real app, store keys securely (KMS/HSM) or derive them from user passphrase using PBKDF2/Argon2.
    res.status(200).json({ ciphertext, secretKey, iv, algorithm });
  } catch (err) {
    console.error("Encrypt error:", err);
    res.status(500).json({ error: "Encryption failed", details: err.message });
  }
});

router.post("/decrypt", (req, res) => {
  const { ciphertext, secretKey, iv, algorithm, originalAlgorithm } = req.body;

  try {
    if (!ciphertext || !secretKey || !iv || !algorithm) {
      return res.status(400).json({ error: "ciphertext, secretKey, iv and algorithm are required" });
    }

    if (originalAlgorithm && originalAlgorithm !== algorithm) {
      return res.status(400).json({ errorType: "algorithm", error: "Select Correct Algorithm" });
    }

    const decryptedText = decryptMessage(ciphertext, secretKey, iv, algorithm);

    res.status(200).json({ decryptedText });
  } catch (error) {
    console.error("Decrypt error:", error);
    res.status(400).json({ errorType: "key", error: "Wrong key or ciphertext.", details: error.message });
  }
});

export default router;
