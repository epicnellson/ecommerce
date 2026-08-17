import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'USA' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required unless user signs up with Google/Facebook
        return !this.googleId && !this.facebookId;
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values to be unique
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    addresses: [addressSchema],
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;