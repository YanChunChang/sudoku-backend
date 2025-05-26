const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ messageKey: 'REGISTER.EMAIL_EXISTS' });

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

    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP-Verbindung fehlgeschlagen:', error);
      } else {
        console.log('SMTP bereit zum Senden von E-Mails');
      }
    });

    await transporter.sendMail({
      from: '"Sudoku App" <noreply@sudoku.com>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`
    });

    res.status(201).json({ messageKey: "REGISTER.SUCCESS" });
  } catch (err) {
    console.error('Register-Fehler:', err);
    res.status(500).json({ messageKey: "REGISTER.ERROR" });
  }
};

exports.verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Kein Token angegeben.');
  }

  try {
    //Token entschlüsseln
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Benutzer mit dieser E-Mail finden
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).send('Benutzer nicht gefunden.');
    }

    //Nutzer als verifiziert markieren
    user.verified = true;
    await user.save();

    res.status(200).send('E-Mail erfolgreich verifiziert!');
  } catch (err) {
    console.error(err);
    res.status(400).send('Ungültiger oder abgelaufener Token.');
  }
};