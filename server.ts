import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Google GenAI if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Endpoint to generate the report
app.post("/api/generate-report", async (req, res) => {
  try {
    const { title, role, description, responses, isForcedIncomplete } = req.body;

    if (!title || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: "Invalid data. Assessment title and answers are required." });
    }

    // Check completeness
    const emptyAnswers = responses.filter(r => !r.answer || r.answer.trim() === "");
    const totalQuestions = responses.length;
    const answeredCount = totalQuestions - emptyAnswers.length;
    
    // We treat as incomplete if less than 60% of answers are provided or specifically tagged
    const forceIncomplete = isForcedIncomplete || answeredCount < totalQuestions * 0.6;
    const isApparentIncomplete = answeredCount < totalQuestions;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is required to generate AI reports. Please configure it in the Secrets panel." 
      });
    }

    // Construct the prompt
    const prompt = `
    You are an expert talent evaluator and organizational development specialist.
    Your task is to analyze candidate/employee responses to an assessment and generate a highly detailed, professional, objective Assessment Summary Report.
    
    --- ASSESSMENT INFO ---
    Assessment Title: ${title}
    Target Role: ${role || "N/A"}
    Assessment Description: ${description || "General Assessment"}
    
    --- CANDIDATE RESPONSES ---
    ${responses.map((r, idx) => `
    Question ${idx + 1}: ${r.question}
    Category: ${r.category}
    Competency Assessed: ${r.competency || r.category}
    Weight: ${r.weight || 1}
    Candidate's Answer: ${r.answer && r.answer.trim() !== "" ? r.answer : "[SKIPPED / SKIPPED ANSWER / UNANSWERED]"}
    `).join("\n")}
    
    --- EVALUATION PROTOCOL ---
    1. Score each response meticulously based on content depth, correctness, logic, and professional value.
    2. Identify core performance competencies and score each out of 100.
    3. Calculate an aggregate 'overall_score' (0-100).
    4. Provide a 'recommendation'. It MUST be one of: "Proceed", "Needs Training", "Re-evaluate", "Reject".
    5. Formulate a cohesive, text-dense 'performance_summary' paragraph summarizing their overall skillset, level, and suitability.
    6. List 3 key 'strengths' (as specific concrete points) and 2-3 key 'improvements' (areas they can improve).
    7. Provide 3-4 highly action-oriented 'recommendations' for subsequent progression.
    8. Mark 'is_incomplete' as ${forceIncomplete || isApparentIncomplete ? "true" : "false"}. If incomplete (due to skipped answers), adjust recommendations to outline how they can address the missing items. The overall score should reflect only the completed evaluation portions, with a recommendation matching the incomplete nature (e.g. "Re-evaluate" or "Needs Training").

    Return the final report strictly in JSON format matching the schema instructions. Ensure scores are integers and recommendations are realistic.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overall_score", "recommendation", "performance_summary", "scores", "recommendations", "strengths", "improvements", "is_incomplete"],
          properties: {
            overall_score: { 
              type: Type.INTEGER, 
              description: "The aggregate percentage score (0 to 100)." 
            },
            recommendation: { 
              type: Type.STRING, 
              description: "The explicit evaluation recommendation badge. MUST be one of: 'Proceed', 'Needs Training', 'Re-evaluate', 'Reject'." 
            },
            performance_summary: { 
              type: Type.STRING, 
              description: "A comprehensive executive-level performance summary paragraph." 
            },
            scores: {
              type: Type.OBJECT,
              description: "Object mapping competency/category names to scores (0 to 100). Minimum 3 competency types.",
              properties: {} // Open Object schema
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 to 5 actionable next-step recommendations for the candidate or manager."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 primary candidate strengths highlighted in their responses."
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2 to 3 candidate growth/learning improvement areas."
            },
            is_incomplete: {
              type: Type.BOOLEAN,
              description: "Whether the assessment was deemed incomplete based on answers skipped or missing."
            }
          }
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("Empty response received from Gemini API");
    }

    const reportJson = JSON.parse(reportText.trim());
    return res.json(reportJson);

  } catch (error: any) {
    console.error("Error generating report:", error);
    return res.status(500).json({ 
      error: "Failed to generate report using AI. Reason: " + (error.message || error)
    });
  }
});

// Configure Vite / Static asset routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

initServer();
