const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pharmacyName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, match: /^\+977\d{10}$/ },
  registrationNumber: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'PHARMACY' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
