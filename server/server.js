// server.js
import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Setup Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Gemini API call for new draft
async function generateMailBody({
  personName,
  company,
  role,
  jobId,
  resume,
  yourName,
  college,
  phone,
}) {
  const greeting = personName ? `Dear ${personName},` : "Dear Hiring Team,";

const prompt = `
Compose a professional job application email using only the information provided below, approximately 150 words. 
Do not request any additional information and do not include placeholders or instructions. 
Exclude the subject line; write the email as if I am sending it myself, ready to submit. 
Include the Job ID only if it is provided; otherwise, omit it without comment. 
Maintain a formal, concise, and polite tone. 
Explicitly convey that I am enthusiastic about the role and highlight my relevant skills. 
The resume link below must be included in the email exactly as provided.

Greetings: ${greeting}
Company: ${company}
Role: ${role}
${jobId ? `Job ID: ${jobId}` : ""}

Resume Link: ${resume}

End the email exactly with:

Your Sincerely

${yourName}
${college}
${phone}
`;


  const result = await model.generateContent(prompt);
  const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "Generated email text unavailable.";
}

// ✅ Generate draft only
app.post("/generateMail", async (req, res) => {
  try {
    const {
      personName,
      company,
      role,
      jobId,
      resume,
      yourName,
      college,
      phone,
    } = req.body;

    // Merge all data into payload for generateMailBody
    const mailBody = await generateMailBody({
      personName,
      company,
      role,
      jobId,
      resume,
      yourName,
      college,
      phone,
    });

    res.json({ success: true, mailBody });
  } catch (err) {
    console.error("❌ Error generating mail:", err);
    res.status(500).json({ success: false, message: "Error generating mail." });
  }
});

// ✅ Regenerate draft (takes current draft and improves it)
// app.post("/regenerateMail", async (req, res) => {
//   try {

//     const currentDraft = req.body;
//      console.log(currentDraft)
//     const regenPrompt = `
// You are writing on my behalf so give a final mail as if i am writing regenerate this mail
// ${currentDraft}
// The regenerated version should be professional, clear, and ready to send directly.
// `;

//     const result = await model.generateContent(regenPrompt);
//     const newDraft =
//       result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "Could not regenerate mail.";

//     res.json({ success: true, newDraft });console.log(newDraft)
//   } catch (err) {
//     console.error("❌ Error regenerating mail:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Error regenerating mail." });
//   }
// });

//Regenerate draft (takes current draft and improves it)
app.post("/regenerateMail", async (req, res) => {
  try {
    const { currentDraft } = req.body; // ✅ extract the string directly
    console.log("🔹 Current Draft Received:", currentDraft);

    const regenPrompt = `
You are writing on my behalf. Rewrite the following email into a professional, polished, and clear version that is ready to send directly. 
Use different wording and sentence structure where possible to improve readability and style, but keep all the information intact. 
Do NOT ask for missing information or include placeholders. Do NOT change the meaning of the email. 
Do NOT include the subject line.

Original Email:
${currentDraft}
`;

    const result = await model.generateContent(regenPrompt);

    const newDraft =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not regenerate mail.";

    console.log("✅ Regenerated Draft:", newDraft);

    res.json({ success: true, newDraft });
  } catch (err) {
    console.error("❌ Error regenerating mail:", err);
    res
      .status(500)
      .json({ success: false, message: "Error regenerating mail." });
  }
});

// ✅ Send final mail
app.post("/sendMail", async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    console.log(email, subject, body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: `<p>${body.replace(/\n/g, "<br />")}</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Mail sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending mail:", err);
    res.status(500).json({ success: false, message: "Error sending mail." });
  }
});

app.listen(5051, () =>
  console.log("✅ Server running on http://localhost:5051")
);
