require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const OpenAI = require('openai');

const app = express();

const client = new OpenAI({
  baseURL: process.env.BASEURL,
  apiKey: process.env.OPENAI_APIKEY,
});

const riskCriteria = {
  forceMajeure: "force majeure clause is missing or vague",
  termination: "termination clause is ambiguous",
  pricing: "unusual pricing structures or lack of benchmarks",
  performance: "undefined performance guarantees or penalties",
};

// Evaluate risks using OpenAI
async function evaluateRisk(contractText) {
  const riskResults = {};

  for (const [key, description] of Object.entries(riskCriteria)) {
    const prompt = `Analyze the following contract text for ${description} and determine if it is high risk or low risk: ${contractText}`;

    try {
      const response = await client.chat.completions.create({
        model: "text-davinci-003",
        messages: [
          { role: "system", content: "You are a strategic reasoner." },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
      });

      const output = response.choices[0].message.content.trim().toLowerCase();
      riskResults[key] = output.includes("high risk") ? "high risk" : "low risk";
    } catch (error) {
      console.error(`Error analyzing ${key}:`, error);
      riskResults[key] = "error";
    }
  }

  // Determine overall risk
  const overallRisk = Object.values(riskResults).includes("high risk")
    ? "high risk"
    : "low risk";

  return { risks: riskResults, overallRisk };
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/evaluate', async (req, res) => {
  try {
    const contractText = fs.readFileSync("contract2.txt", "utf-8");
    const analysis = await evaluateRisk(contractText);
    res.json({ data: analysis });
  } catch (error) {
    console.error("Error reading or analyzing contract:", error);
    return null;
  }
});

app.get('/', (req, res) => res.send('It Work'));

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 