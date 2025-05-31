const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ messageKey: 'REGISTER.EMAIL_EXISTS' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, verified: false });
    await newUser.save();

    //creatin token with email
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationLink = `http://localhost:4200/verify?token=${token}`;

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"Sudoku App" <noreply@sudoku.com>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`
    });

    res.status(201).json({ messageKey: "REGISTER.SUCCESS", email });
  } catch (err) {
    console.error('Register-Fehler:', err);
    res.status(500).json({ messageKey: "REGISTER.ERROR" });
  }
};

exports.verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ messageKey: "VERIFY_EMAIL.NO_TOKEN" });
  }

  try {
    //Decrypt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Find user by email
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ messageKey: 'VERIFY_EMAIL.USER_NOT_FOUND' });
    }

    //Check if user is already verified
    if (user.verified) {
      return res.status(400).json({ messageKey: 'VERIFY_EMAIL.ALREADY_VERIFIED' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ messageKey: "VERIFY_EMAIL.EMAIL_VERIFIED" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ messageKey: "VERIFY_EMAIL.INVALID_TOKEN" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ messageKey: 'VERIFY_EMAIL.RESEND.ERROR_EMAIL_NOT_FOUND' });
    } else if (user.verified) {
      return res.status(400).json({ messageKey: 'VERIFY_EMAIL.RESEND.ERROR_ALREADY_VERIFIED' });
    }
    // Create a new token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationLink = `http://localhost:4200/verify?token=${token}`;

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: '"Sudoku App"  <noreply@sudoku.com>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`
    });
    res.status(200).json({ messageKey: 'VERIFY_EMAIL.RESEND.SUCCESS' });
  }
  catch (err) {
    console.error('Fehler beim Senden der Verifizierungs-E-Mail:', err);
    res.status(500).json({ messageKey: 'VERIFY_EMAIL.RESEND.ERROR_TEXT' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ messageKey: 'LOGIN.EMAIL_NOT_FOUND' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ messageKey: 'LOGIN.INVALID_PASSWORD' });
    }

    if (!user.verified) {
      res.status(403).json({ messageKey: 'LOGIN.NOT_VERIFIED' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      messageKey: 'LOGIN.SUCCESS',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login-Fehler:', err);
    res.status(500).json({ messageKey: 'LOGIN.ERROR' });
  }
};

exports.recoverEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ messageKey: 'FORGOT_PASSWORD.EMAIL_NOT_FOUND' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    const resetLink = `http://localhost:4200/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"Sudoku App" <noreply@sudoku.com>',
      to: email,
      subject: 'Reset your password',
      html: `<p>Please click the link below to reset your password:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>`
    });

    res.status(200).json({ messageKey: 'FORGOT_PASSWORD.SUCCESS' });

  } catch (err) {
    console.error('Recover-Email Fehler:', err);
    res.status(500).json({ messageKey: 'FORGOT_PASSWORD.ERROR' });
  }
};
