const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const validateEmail = (email) => {
  if (!email || !email.endsWith('@gmail.com')) {
    return 'Email must be a valid @gmail.com address';
  }
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least 1 lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least 1 special character (!@#$%^&*)';
  return null;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (role && role !== 'student') {
      return res.status(403).json({ message: 'Only student accounts can be created via registration' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      department: department || '',
      isVerified: false,
      verificationToken,
    });

    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('[authController] Verification email sent successfully');
    } catch (emailError) {
      console.error('[authController] Failed to send verification email:', emailError);
    }

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    console.log('[authController] Verification link:', verifyLink);

    res.status(201).json({
      message: 'Confirmation email sent to your Gmail',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email confirmed successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();
    console.log('[authController] Login attempt:', { email, passwordLength: password?.length || 0 });

    const user = await User.findOne({ email });
    console.log('[authController] User found:', user ? `${user.email} (${user.role})` : 'NO USER FOUND');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[authController] Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('[authController] isVerified check:', { role: user.role, isVerified: user.isVerified });

    if (user.role === 'student' && !user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.oauthLogin = async (req, res) => {
  try {
    const { name, email, avatar, provider } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ message: 'Email and provider are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        password: randomPassword,
        avatar: avatar || '',
        role: 'student',
        isVerified: true,
        provider,
      });
    } else {
      user.provider = provider;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Please provide a valid @gmail.com address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('[authController] Password reset email sent successfully');
    } catch (emailError) {
      console.error('[authController] Failed to send password reset email:', emailError);
    }

    res.json({ message: 'Reset link sent to your Gmail' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = null;
    }
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};