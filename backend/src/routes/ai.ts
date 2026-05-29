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
    const { userId, prompt, contextRoadName } = req.body;
    
    // 1. Fetch Context from DB if a road name is specified
    let contextData = '';
    
    if (contextRoadName) {
      console.log('Fetching database context for road:', contextRoadName);
      const road = await prisma.road.findFirst({
        where: { name: contextRoadName },
        include: { authority: true, complaints: { take: 5, orderBy: { createdAt: 'desc' } } }
      });
      
      if (road) {
        console.log(`Matched road: ${road.name}, Authority: ${road.authority.name}, Complaints: ${road.complaints.length}`);
        contextData = `
        DATABASE CONTEXT FOR THIS CONVERSATION:
        Road Name: ${road.name}
        Authority: ${road.authority.name} (${road.authority.type})
        Contractor: ${road.contractor || 'Not assigned'}
        Budget Sanctioned: ₹${road.budgetSanctioned || 0} Cr
        Budget Spent: ₹${road.budgetSpent || 0} Cr
        Recent Complaints: ${road.complaints.length > 0 ? road.complaints.map(c => c.issueType).join(', ') : 'None'}
        Road Status: ${road.status}
        
        INSTRUCTIONS: You MUST use the above database facts to answer the user's question. Do not hallucinate data.
        `;
      } else {
        console.log('No matching road found in database for:', contextRoadName);
        contextData = `
        DATABASE CONTEXT:
        No matching road was found in the database for "${contextRoadName}". 
        INSTRUCTIONS: Please inform the user clearly that no records exist for this road in the CrashZero database.
        `;
      }
    }

    // 2. Query Gemini
    const systemInstruction = `You are the CrashZero AI Assistant. Your goal is to help citizens understand road safety, budgets, file complaints, and draft RTI requests. Be helpful, formal when drafting RTIs, and concise.
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
          context: contextRoadName ? { roadName: contextRoadName } : null
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
