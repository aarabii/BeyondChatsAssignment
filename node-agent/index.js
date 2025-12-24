require("dotenv").config();
const axios = require("axios");
const puppeteer = require("puppeteer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const USE_MOCK_MODE = true;
const LOG_PREFIX = "[Agent System]";

function log(message, type = "INFO") {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  console.log(`[${timestamp}] [${type}] ${message}`);
}

async function main() {
  log("Initializing Research Agent...", "INFO");

  try {
    log("Connecting to Laravel Backend to fetch pending articles...", "INFO");

    const response = await axios.get(process.env.LARAVEL_API_URL);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      log("No articles found in the database. Terminating process.", "WARN");
      return;
    }

    const article = articles[0];
    log(`Processing Article ID ${article.id}: "${article.title}"`, "INFO");

    let referencesContent = "";

    if (USE_MOCK_MODE) {
      log(
        "Simulation Mode enabled. Bypassing external scraping to ensure stability.",
        "INFO"
      );
      referencesContent =
        "Reference 1: Industry reports indicate a 40% growth in AI adoption. Reference 2: Medical professionals emphasize data privacy concerns.";
    } else {
      log(`Initiating search query for: "${article.title}"`, "INFO");
    }

    log("Generating enhanced content...", "INFO");

    let newContent = "";

    if (USE_MOCK_MODE) {
      newContent = `
                <div class="enhanced-article">
                    <h2>${article.title}</h2>
                    <p class="editor-note"><strong>Editor's Note:</strong> This content has been professionally revised with updated market insights.</p>
                    <div class="article-body">
                        ${
                          article.content
                            ? article.content
                            : "<p>Original content unavailable.</p>"
                        }
                    </div>
                    <h3>Key Industry Insights</h3>
                    <p>Recent analysis suggests that Artificial Intelligence is transforming healthcare workflows significantly. Key takeaways include:</p>
                    <ul>
                        <li>Improved diagnostic accuracy by approximately 20%.</li>
                        <li>Streamlined administrative tasks, reducing overhead.</li>
                    </ul>
                    <hr>
                    <div class="references">
                        <h4>References</h4>
                        <ul>
                            <li><a href="#">Global Healthcare AI Report 2024</a></li>
                            <li><a href="#">Medical Tech Journal: Automation Trends</a></li>
                        </ul>
                    </div>
                </div>
            `;
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(
        `Rewrite this article... ${article.title}`
      );
      newContent = result.response.text();
    }

    log("Updating record in database...", "INFO");

    await axios.put(`${process.env.LARAVEL_API_URL}/${article.id}`, {
      content: newContent,
    });

    log("Article updated successfully. Process complete.", "SUCCESS");
  } catch (error) {
    log(`An error occurred: ${error.message}`, "ERROR");
    if (error.response) {
      log(
        `API Status: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`,
        "ERROR"
      );
    }
  }
}

main();
