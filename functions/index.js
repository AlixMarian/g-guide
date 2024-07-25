const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp();

const {SENDER_EMAIL, SENDER_PASSWORD} = process.env;

// Create a transporter for Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD,
  },
});

exports.sendEmailNotification = functions.firestore
    .document("submissions/{docId}")
    .onCreate(async (snap, ctx) => {
      const data = snap.data();

      const mailOptions = {
        from: SENDER_EMAIL,
        to: data.email,
        subject: "Your submission Info",
        text: `Your church has been successfully approved! ${data.email}`,
        // eslint-disable-next-line max-len
        html: `<p>Thank you for your submission. Here is your info:</p><p>${data.email}</p>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", data.email);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });
