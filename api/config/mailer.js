require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// Configure SendGrid API Key
sgMail.setApiKey(process.env.API_KEY);

// Créer un e-mail
const sendWelcomeEmail = async (email, name, confirmationUrl) => {
  // Prepare the email data
  const message = {
    to: email,
    from: process.env.SENDGRID_VERIFIED_SENDER, // Use the verified sender in your SendGrid account
    subject: "Création de compte MLindustrie",
    html: `<p>Bienvenue, ${name}! Veuillez confirmer votre email en cliquant sur le lien: ${confirmationUrl}</p>`, // Update this with your HTML template
  };

  // Send the email
  try {
    await sgMail.send(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

// Export the function to use it in other parts of your app
module.exports = { sendWelcomeEmail };
