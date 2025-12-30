import OpenAI from "openai";

export async function analyzePRDiff(diff: string, title?: string, description?: string) {
    if (!process.env.OPENAI_API_KEY) {
        console.error("OpenAI API Key is missing");
        return {
            summary: "AI Analysis unavailable (Missing API Key).",
            qualityScore: 0,
            criticalIssues: ["Configuration Error"],
            feedback: "Please configure OPENAI_API_KEY."
        };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
    You are an expert senior software engineer and code reviewer.
    Your task is to review the following Pull Request diff for a coding challenge.
    
    Context:
    PR Title: ${title || 'N/A'}
    PR Description: ${description || 'N/A'}

    Diff:
    ${diff.substring(0, 30000)} // Truncate to avoid massive tokens

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
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful code review assistant. Output JSON only." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) throw new Error("No response from AI");

        return JSON.parse(responseText);

    } catch (error) {
        console.error("OpenAI Analysis Failed:", error);
        return {
            summary: "AI Analysis failed.",
            qualityScore: 0,
            criticalIssues: ["AI Error"],
            feedback: "Could not analyze this PR."
        };
    }
}
