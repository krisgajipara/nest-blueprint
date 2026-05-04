const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const { config } = require("dotenv");
const { config: dotenvConfig } = require("dotenv");
require("ts-node").register();
const { configuration } = require("../config/configuration");

// Load environment variables dynamically based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `${process.cwd()}/config/env/${nodeEnv}.env`;

config({ path: envFile });

// --- Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // Stable 2026 Model

if (!API_KEY) {
    console.error("❌ ERROR: Set GEMINI_API_KEY environment variable.");
    console.info("Get a api kay from your account: https://aistudio.google.com/api-keys ");
    process.exit(1);
}

// Initialize 2026 Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function reviewChanges() {
    try {
        console.log("📂 Gathering staged changes...");

        // Increased maxBuffer to 10MB to handle large diffs
        const diff = execSync("git diff --staged -- . ':(exclude)*-lock.json' ':(exclude)*.lock'", {
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024
        });

        if (!diff.trim()) {
            console.log("✅ No staged changes found.");
            return;
        }

        const getFile = (p) => {
            const fullPath = path.resolve(__dirname, p);
            return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf-8") : "Standards not found.";
        };

        const archRules = getFile(
            "../libs/@oc/documents/dev-guidelines/coding-standards-rule/architecture-validation-rule-v2.md"
        );
        const codeRules = getFile("../libs/@oc/documents/dev-guidelines/coding-standards-rule/coding-standards-v2.md");

        // Keeping your EXACT prompt structure
        const prompt = `
        Review the following code changes for compliance with our coding standards and architecture guidelines. Provide a detailed compliance report indicating if the changes meet the standards, highlight any violations, and suggest improvements.

        Standards and Guidelines:
        Architecture Standards:
        ${archRules}

        Coding Standards:
        ${codeRules}

        Code Changes (git diff --staged):
        ${diff}

        Compliance Report:
        `;

        console.log(`🤖 Analyzing with ${MODEL_NAME}...`);

        // Using the 2026 SDK generateContent call
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.1, // Low temperature for accuracy
                maxOutputTokens: 8192, // FIX: High limit to prevent cut-off
                safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }]
            }
        });

        // Use .text property (standard in 2026 SDK)
        const report = response.text;

        if (!report) {
            console.error("⚠️ AI returned no text. Finish Reason:", response.candidates?.[0]?.finishReason);
            process.exit(1);
        }

        const today = new Date();
        const reportContent = `# Code Review Report\n## Review Date: ${today.toISOString()}\n\n${report}`;

        const fileName = `review/code-review-report-${today.getTime()}.md`;
        fs.writeFileSync(fileName, reportContent);

        console.log("------------------------------------------");
        console.log(`✅ COMPLETE: ${fileName}`);
        console.log("------------------------------------------");
    } catch (error) {
        console.error("❌ FAILED:", error.message);
        process.exit(1);
    }
}

reviewChanges();
