import express from 'express';
import { createTransport } from 'nodemailer';
import cors from 'cors';

const app = express();
const port = 3006;

app.use(cors({
  origin: 'http://localhost:5173', // frontend's origin
  methods: ['POST']
}));

app.use(express.json());

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'marianehistoria88@gmail.com',
    pass: 'wsxibnhevdqrbcrb'
  }
});

app.post('/send-email', async (req, res) => {
  const { email, subject, text } = req.body;

  // Define the HTML content with inline CSS
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://drive.google.com/uc?export=view&id=1QfNPz3OYXCy2mw6CLuYOFj1Mnrfx6nGa" alt="G-Guide Logo" style="max-width: 100px; height: auto;">
            </div>
            <div style="margin-bottom: 20px;">
                <h2 style="color: black;">Hello,</h2>
            </div>
            <h1 style="color: black; text-align: center;">${text}</h1>
            <h3 style="color: black;">Best regards,<br><strong>G! Guide Team</strong></h3>
            <hr style="border: 4; border-top: 1px solid #dddddd; margin: 20px 0;">
            <p style="color: #999999; font-size: 14px; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
    </body>
    </html>

  `;

  const mailOptions = {
    from: 'marianehistoria88@gmail.com',
    to: email,
    subject: subject,
    html: htmlContent  // Use the html property instead of text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
