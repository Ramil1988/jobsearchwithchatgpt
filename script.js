import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import Configuration from "openai";
import OpenAIApi from "openai";

config();

const app = express();
const PORT = 3001; 

app.use(cors()); 
app.use(bodyParser.json()); 

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
    jobTitle,
    companyName,
    skills,
    relevantExperience,
    interestInRole,
    interestInCompany,
    closingRemarks,
    language,
  } = req.body;

  let instruction = `
    Generate a cover letter for ${applicantName}, applying for the position of ${jobTitle} at ${companyName}. 
    Skills: ${skills.join(", ")}.
    Experience: ${relevantExperience}.
    Reason for interest in the role: ${interestInRole}.
    Why they are interested in the company: ${interestInCompany}.
    Closing remarks: ${closingRemarks}.
  `;

  if (language === "French") {
    instruction = `
    Générez une lettre de motivation pour ${applicantName}, postulant au poste de ${jobTitle} chez ${companyName}. 
    Compétences: ${skills.join(", ")}.
    Expérience: ${relevantExperience}.
    Raison de l'intérêt pour le poste: ${interestInRole}.
    Pourquoi ils sont intéressés par l'entreprise: ${interestInCompany}.
    Remarques finales: ${closingRemarks}.
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
