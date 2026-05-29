import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const prisma = new PrismaClient();

// Initialize Gemini API conditionally
let ai: GoogleGenAI | null = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

console.log("Gemini configured:", !!process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini API not configured"
    });
  }

  try {
    const { userId, prompt, contextRoadId } = req.body;
    
    // 1. Fetch Context from DB if a road is specified
    let contextData = '';
    if (contextRoadId) {
      const road = await prisma.road.findUnique({
        where: { id: contextRoadId },
        include: { authority: true, complaints: { take: 5, orderBy: { createdAt: 'desc' } } }
      });
      
      if (road) {
        contextData = `
        Context about the road:
        Road Name: ${road.name}
        Status: ${road.status}
        Authority: ${road.authority.name} (${road.authority.type})
        Recent Complaints: ${road.complaints.map(c => c.issueType).join(', ')}
        `;
      }
    }

    // 2. Query Gemini
    const systemInstruction = `You are the CrashZero AI Assistant. Your goal is to help citizens understand road safety, budgets, and file complaints. Be helpful, concise, and refer to the context if provided.
    ${contextData}`;

    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    const aiText = response.text || "I'm sorry, I couldn't process that request.";

    // 3. Save conversation if user provided
    if (userId) {
      await prisma.aIConversation.create({
        data: {
          userId,
          prompt,
          response: aiText,
          context: contextRoadId ? { roadId: contextRoadId } : null
        }
      });
    }

    res.json({ response: aiText });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

export default router;
