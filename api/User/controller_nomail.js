const bcrypt = require("bcrypt");
let User = require("./model");
const { sendWelcomeEmail } = require("../config/mailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// USER REGISTRATION

// User registration
exports.signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const addedUser = await user.save();

    if (addedUser) {
      // Optionnel : Envoyer un email de bienvenue
      await sendWelcomeEmail(user.email, user.name);
      res.status(201).json({
        message: "Inscription réussie.",
        data: addedUser,
      });
    } else {
      res
        .status(400)
        .json({ message: "Erreur lors de l'ajout de l'utilisateur" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// User login
exports.login = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).send({
      message: "Email manquant.",
    });
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).send({
        message: "Utilisateur non trouvé.",
      });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        message: "Mot de passe incorrect.",
      });
    }

    // Générer un token
    const token = jwt.sign({ userId: user._id }, process.env.SESSION_TOKEN, {
      expiresIn: "24h",
    });

    console.log(token);
    return res.status(200).send({
      message: "Utilisateur connecté",
      token,
      id: user._id,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

// USER DISPLAY
exports.getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USERS DISPLAY
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USER UPDATE
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updatedUserData = req.body;

    // Si un nouveau mot de passe est fourni, le hasher avant de le sauvegarder
    if (updatedUserData.password) {
      updatedUserData.password = await bcrypt.hash(
        updatedUserData.password,
        10
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });

    if (updatedUser) {
      res.status(200).json({
        msg: "Mise à jour réussie",
        data: updatedUser,
      });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USER DELETE
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.status(200).json({
        msg: "Utilisateur supprimé",
      });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};
