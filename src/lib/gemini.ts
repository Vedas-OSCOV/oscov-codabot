import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzePRDiff(diff: string, title?: string, description?: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are an expert senior software engineer and code reviewer.
    Your task is to review the following Pull Request diff for a coding challenge.
    
    Context:
    PR Title: ${title || 'N/A'}
    PR Description: ${description || 'N/A'}

    Diff:
    ${diff.substring(0, 30000)} // Truncate to avoid token limits if massive

    Instructions:
    1. Analyze the code for correctness, code quality, and potential bugs.
    2. Check if it seems to address the problem described by the title/context.
    3. Provide a concise summary of changes.
    4. Give a "Quality Score" from 1-100.
    5. List any "Critical Issues" if found, otherwise say "None".

    Format your response purely as JSON:
    {
       "summary": "...",
       "qualityScore": 85,
       "criticalIssues": ["..."],
       "feedback": "..."
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return {
            summary: "AI Analysis failed to generate structured output.",
            qualityScore: 0,
            criticalIssues: ["AI Error"],
            feedback: "Could not analyze this PR."
        };
    }
}
