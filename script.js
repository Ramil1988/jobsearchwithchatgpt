import { config } from "dotenv";
import Configuration from "openai";
import OpenAIApi from "openai";
import readlineSync from "readline-sync";
import colors from "colors";

// Load environment variables
config();

// Create OpenAI instance
const openAi = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  })
);

async function main() {
  console.log(colors.bold.green("Welcome to the Job assistance program!"));
  console.log(colors.bold.green("You can start chatting with the bot."));

  const chatHistory = []; // Store conversation history

  while (true) {
    const userInput = readlineSync.question(colors.yellow("You: "));

    try {
      // Construct messages by iterating over the history
      const messages = chatHistory.map(([role, content]) => ({
        role,
        content,
      }));

      // Add latest user input
      messages.push({ role: "user", content: userInput });

      // Call the API with user input & history
      const response = await openAi.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      const completionText = response.choices[0].message.content;

      if (
        response &&
        response.choices &&
        response.choices.length > 0 &&
        response.choices[0].message
      ) {
        console.log(response.choices[0].message.content);
      } else {
        console.log("Unexpected response structure:", response);
      }

      if (userInput.toLowerCase() === "exit") {
        console.log(colors.green("Bot: ") + completionText);
        return;
      }

      console.log(colors.green("Bot: ") + completionText);

      // Update history with user input and assistant response
      chatHistory.push(["user", userInput]);
      chatHistory.push(["assistant", completionText]);
    } catch (error) {
      console.error(colors.red(error));
    }
  }
}

main();
