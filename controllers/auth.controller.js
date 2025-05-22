const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'E-Mail bereits registriert' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    res.status(201).json({ message: 'Benutzer erfolgreich registriert' });
  } catch (err) {
    console.error('Register-Fehler:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
};