const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: String,
  code: String,
  expireIn: Number,
});

mongoose.model("OTP", otpSchema);

module.exports = mongoose.model("OTP");
