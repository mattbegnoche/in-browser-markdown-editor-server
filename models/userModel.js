const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a vaild email!'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Middleware to hash the password before saving the user document, if the password field was modified.
userSchema.pre('save', async function () {
  // Return function if the password has not changed yet
  if (!this.isModified('password')) return;
  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the passwordConfirm field for security reasons in the DB
  this.passwordConfirm = undefined;
});

// Middleware to update passwordChangedAt field
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  // By subtracting 1 second, the passwordChangedAt timestamp is slightly earlier than the JWT's iat timestamp, ensuring that the token remains valid if issued immediately after the password update.
  this.passwordChangedAt = Date.now() - 1000;
});

// Middleware to remove all inactive users from mongoose's queries (find, findOne, and findById).
userSchema.pre(/^find/, function () {
  // this points to the current query
  this.find({ active: { $ne: false } });
});

// This method is used to authenticate users by verifying their password during login or other secure operations.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// This method is used to invalidate JWTs if the user changes their password after the token was issued. It ensures that users must log in again with a new token after a password change.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// This method generates a password reset token for the user.
// It creates a secure random token, hashes it for secure storage in the database,
// sets an expiration time (10 minutes), and returns the plain-text token to be sent to the user.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set when the password expires
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
