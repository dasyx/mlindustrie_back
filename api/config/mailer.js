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
    templateId: "id-72fab4d3a3784440bff03e39f2cd73ee", // Add your SendGrid Template ID here
    dynamic_template_data: {
      // These fields should correspond to the placeholders in your template
      user: name,
      confirmationUrl: confirmationUrl,
    },
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
