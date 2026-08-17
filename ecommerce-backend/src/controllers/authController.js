import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import { AppError } from '../utils/appError.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';

const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { name, email, password } = req.body;

  user.name = name || user.name;
  user.email = email ? email.toLowerCase() : user.email;

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  const shouldRefreshToken = name !== req.user.name || email || password;
  if (shouldRefreshToken) {
    generateToken(res, updatedUser._id);
  }

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    addresses: updatedUser.addresses,
  });
});

const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
    });
  } else {
    throw new AppError('Invalid user data', 400);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
    });
  } else {
    throw new AppError('Invalid email or password', 401);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push({
    name,
    street,
    city,
    state,
    zipCode,
    country: country || 'USA',
    phone,
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    throw new AppError('Address not found', 404);
  }

  const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses[addressIndex] = {
    ...user.addresses[addressIndex].toObject(),
    name: name || user.addresses[addressIndex].name,
    street: street || user.addresses[addressIndex].street,
    city: city || user.addresses[addressIndex].city,
    state: state || user.addresses[addressIndex].state,
    zipCode: zipCode || user.addresses[addressIndex].zipCode,
    country: country || user.addresses[addressIndex].country,
    phone: phone || user.addresses[addressIndex].phone,
    isDefault: isDefault || (user.addresses.length === 1),
  };

  await user.save();
  res.json({ addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    throw new AppError('Address not found', 404);
  }

  const wasDefault = user.addresses[addressIndex].isDefault;
  user.addresses.splice(addressIndex, 1);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json({ addresses: user.addresses });
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ addresses: user.addresses });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === req.params.addressId;
  });

  await user.save();
  res.json({ addresses: user.addresses });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
    return;
  }

  if (!user.password) {
    throw new AppError('This account uses social login. Please login with Google or Facebook.', 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

  await user.save();

  await sendPasswordResetEmail(user, resetToken);

  res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
});

const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  res.status(200).json({ message: 'Token is valid' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password is required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    addresses: user.addresses,
  });
});

export { registerUser, loginUser, logoutUser, updateUserProfile, addAddress, updateAddress, deleteAddress, getAddresses, setDefaultAddress, forgotPassword, resetPassword, verifyResetToken };
