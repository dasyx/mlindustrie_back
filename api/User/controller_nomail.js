const bcrypt = require("bcrypt");
let User = require("./model");
//const { sendWelcomeEmail } = require("../config/mailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// User registration
exports.signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const addedUser = await user.save();

    if (addedUser) {
      // Réponse en cas de succès sans envoyer d'email
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
  const { email, password } = req.body;

  // Vérification des champs requis
  if (!email || !password) {
    return res.status(422).send({
      message: "Email ou mot de passe manquant.",
    });
  }

  try {
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).send({
        message: "Utilisateur non trouvé.",
      });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        message: "Mot de passe incorrect.",
      });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.SESSION_TOKEN, {
      expiresIn: "24h",
    });

    // Envoyer la réponse avec le nom et l'ID de l'utilisateur
    return res.status(200).send({
      message: "Utilisateur connecté.",
      token,
      id: user._id,
      name: user.name, // Inclure le nom de l'utilisateur dans la réponse
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: "Erreur interne du serveur.",
      error: err.message,
    });
  }
};

// USER DISPLAY
exports.getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide",
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Renvoyer les informations utilisateur
    res.status(200).json({
      success: true,
      message: "Utilisateur récupéré avec succès",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: err.message,
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
