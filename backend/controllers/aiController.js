import fetch from "node-fetch";

export const getInsights = async (req, res) => {
  try {
    const { system_instruction, contents } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // Secure backend AI call bypassing fully any frontend leakage
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction,
          contents,
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
