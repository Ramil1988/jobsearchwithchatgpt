import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "dotenv";
import Configuration from "openai";
import OpenAIApi from "openai";
global.AbortController = require("abort-controller");

config();

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

app.use(cors());

const allowedOrigins = [
  "http://localhost:3000",
  "http://monctonservices-com.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const openAi = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  })
);

app.post("/ask", async (req, res) => {
  const { userInput, chatHistory } = req.body;

  const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
  }));
  messages.push({ role: "user", content: userInput });

  try {
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const completionText = response.choices[0].message.content;

    res.json({
      response: completionText,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generateCoverLetter", async (req, res) => {
  const {
    applicantName,
    applicantPhoneNumber,
    applicantEmail,
    jobTitle,
    companyName,
    skills,
    relevantExperience,
    language,
    tone,
    length,
    jobDescription,
  } = req.body;

  // Instructions modifier based on tone
  let toneInstruction = "";
  if (tone === "Casual") {
    toneInstruction = "Write the cover letter in a casual style.";
  } else if (tone === "Friendly") {
    toneInstruction = "Write the cover letter in a friendly manner.";
  } else {
    toneInstruction = "Write the cover letter in a professional manner.";
  }

  // Adjusting length
  let lengthInstruction = "";
  if (length === "Short") {
    lengthInstruction = "Keep it concise.";
  } else if (length === "Long") {
    lengthInstruction = "Elaborate more on each point.";
  }

  // Base instruction
  let instruction = `
Generate a cover letter for:
Name: ${applicantName}
Phone: ${applicantPhoneNumber}
Email: ${applicantEmail}

Addressing to:
Company: ${companyName}
Position: ${jobTitle}

Details:
Skills: ${skills.join(", ")}
Experience: ${relevantExperience}
Job description they are applying for: ${jobDescription}. Adjust the cover letter to this description accordingly.

Format: Start with the applicant's name, phone number, and email at the top. Address the letter to the company and position. Include skills, experience, interest in the role, and company. Come with ideas on why are you interested in the ${companyName} and in the  ${jobTitle}.

${toneInstruction} ${lengthInstruction}
`;

  if (language === "French") {
    instruction = `
Générez une lettre de motivation pour :
Nom : ${applicantName}
Téléphone : ${applicantPhoneNumber}
E-mail : ${applicantEmail}

Adresse à :
Entreprise : ${companyName}
Poste : ${jobTitle}

Détails :
Compétences : ${skills.join(", ")}
Expérience : ${relevantExperience}
Description du poste pour lequel ils postulent : ${jobDescription}. Adaptez la lettre de motivation à cette description en conséquence.

Format : Commencez par le nom du candidat, son numéro de téléphone et son e-mail en haut de la page. Adressez la lettre à l'entreprise et au poste en question. Incluez les compétences, l'expérience, l'intérêt pour le poste et pour l'entreprise. Venez avec des idées sur les raisons pour lesquelles vous êtes intéressé par ${companyName} et par ${jobTitle}.

${toneInstruction} ${lengthInstruction}
  `;
  }

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: instruction,
    },
  ];

  try {
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const coverLetter = response.choices[0].message.content.trim();
    res.json({
      coverLetter: coverLetter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
