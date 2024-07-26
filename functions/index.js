/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

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
      console.log("Document created: ", snap.id);
      const data = snap.data();
      console.log("Document data: ", data);

      const mailOptions = {
        from: SENDER_EMAIL,
        to: data.email,
        subject: "Your submission Info",
        text: `Your church has been successfully approved! ${data.email}`,
        html: `<p>Thank you for your submission. Here is your info:</p><p>${data.email}</p>`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: ", info);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });
