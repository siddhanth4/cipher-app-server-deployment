// server/models/message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    plainText: { type: String, required: true },
    encryptedText: { type: String, required: true },
    secretKey: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
