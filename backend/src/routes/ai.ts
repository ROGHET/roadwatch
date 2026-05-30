import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const prisma = new PrismaClient();

console.log("AI ROUTE API KEY:", !!process.env.GEMINI_API_KEY);

// Initialize Gemini API conditionally
function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
}

router.post('/chat', async (req, res) => {
  let contextData = '';

  try {
    const { userId, prompt, contextRoadName, contextRoadId, contextComplaintId, contextAuthorityId, latitude, longitude } = req.body;
    
    // 1. Fetch comprehensive Context from DB
    
    if (contextComplaintId) {
      console.log('Fetching context for complaint:', contextComplaintId);
      const complaint = await prisma.complaint.findUnique({
        where: { id: contextComplaintId },
        include: { road: { include: { authority: true } }, authority: true }
      });
      if (complaint) {
        contextData = `
        DATABASE CONTEXT [COMPLAINT]:
        Complaint ID: ${complaint.id}
        Type: ${complaint.issueType} (Severity: ${complaint.severity})
        Status: ${complaint.status}
        Description: ${complaint.description}
        Road: ${complaint.road?.name || 'Unknown'}
        Authority: ${complaint.authority?.name || 'Unknown'}
        INSTRUCTIONS: Use this exact database fact to answer.
        `;
      }
    } else if (contextRoadId || contextRoadName) {
      console.log('Fetching context for road:', contextRoadId || contextRoadName);
      const road = await prisma.road.findFirst({
        where: contextRoadId ? { id: contextRoadId } : { name: contextRoadName },
        include: { authority: true, complaints: { take: 10, orderBy: { createdAt: 'desc' } } }
      });
      if (road) {
        contextData = `
        DATABASE CONTEXT [ROAD]:
        Road Name: ${road.name} (${road.type})
        Authority: ${road.authority.name} (${road.authority.type})
        Contractor: ${road.contractor || 'Not assigned'}
        Budget Sanctioned: ₹${road.budgetSanctioned || 0} Cr
        Budget Spent: ₹${road.budgetSpent || 0} Cr
        Recent Complaints: ${road.complaints.length > 0 ? road.complaints.map(c => c.issueType).join(', ') : 'None'}
        Status: ${road.status}
        INSTRUCTIONS: Use these database facts. Never hallucinate budget or authority.
        `;
      }
    } else if (contextAuthorityId) {
      console.log('Fetching context for authority:', contextAuthorityId);
      const auth = await prisma.authority.findUnique({
        where: { id: contextAuthorityId },
        include: { roads: true, complaints: { take: 5 } }
      });
      if (auth) {
        contextData = `
        DATABASE CONTEXT [AUTHORITY]:
        Name: ${auth.name} (${auth.type})
        Contact: ${auth.contactEmail}
        Managed Roads Count: ${auth.roads.length}
        Complaints Logged: ${auth.complaints.length}
        INSTRUCTIONS: Use these database facts.
        `;
      }
    } else if (latitude && longitude) {
      console.log(`Fetching context for location: ${latitude}, ${longitude}`);
      // Find nearby using the same mock bounding box logic as traffic
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const delta = 0.05;
      
      const nearbyComplaints = await prisma.complaint.findMany({
        where: { latitude: { gte: lat - delta, lte: lat + delta }, longitude: { gte: lng - delta, lte: lng + delta } },
        take: 5
      });
      
      contextData = `
        DATABASE CONTEXT [LOCATION ${lat}, ${lng}]:
        Nearby Active Complaints: ${nearbyComplaints.length > 0 ? nearbyComplaints.map(c => c.issueType).join(', ') : 'None'}
        INSTRUCTIONS: Use these database facts for the selected location.
        `;
    }

    if (!contextData) {
      contextData = `
        DATABASE CONTEXT:
        No matching CrashZero database records were found.

        INSTRUCTIONS:
        You may answer general knowledge questions normally.
        Only mention missing data if the question requires CrashZero-specific information.
      `;
    }

    // 2. Query Gemini
    const systemInstruction = `You are CrashZero AI.
You help with:
- road safety
- pothole reporting
- complaint guidance
- RTI drafting
- infrastructure information
- general knowledge questions

Rules:
- Use database context when provided.
- If no database context exists, answer general questions normally.
- Only mention missing data when the question requires CrashZero-specific information.
- Be concise and factual.
${contextData}`;

    const ai = getGeminiClient();
    console.log("Prompt:", prompt);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    console.log("Gemini response received");

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
  } catch (error: any) {
    console.error("AI chat error:");
    console.error(error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return res.status(500).json({
      error: "Gemini request failed"
    });
  }
});

export default router;
