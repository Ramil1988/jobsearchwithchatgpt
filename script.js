import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import Configuration from "openai";
import OpenAIApi from "openai";

// Load environment variables
config();

const app = express();
const PORT = 3001; // This can be any free port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // for parsing application/json

// Create OpenAI instance
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
  } = req.body;

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: `
      Generate a cover letter for ${applicantName}, applying for the position of ${jobTitle} at ${companyName}. 
      Skills: ${skills.join(", ")}.
      Experience: ${relevantExperience}.
      Reason for interest in the role: ${interestInRole}.
      Why they are interested in the company: ${interestInCompany}.
      Closing remarks: ${closingRemarks}.
    `,
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
