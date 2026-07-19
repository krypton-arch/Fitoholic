import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && !session.user.isPremium) {
      return NextResponse.json({ error: 'Premium required' }, { status: 403 });
    }

    const { type, goals } = await req.json();
    if (!type || !goals || (type !== 'MEAL' && type !== 'WORKOUT')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    let prompt = '';
    
    if (type === 'MEAL') {
      prompt = `
      You are an expert AI Nutritionist. Generate a 7-day meal plan based on these goals: "${goals}".
      Return ONLY valid JSON matching exactly this schema:
      {
        "plan": [
          {
            "day": 1,
            "meals": {
              "breakfast": { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number },
              "lunch": { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number },
              "dinner": { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number }
            },
            "totalCalories": number
          }
        ] // for 7 days
      }`;
    } else {
      prompt = `
      You are an expert AI Fitness Coach. Generate a 7-day workout plan based on these goals: "${goals}".
      Return ONLY valid JSON matching exactly this schema:
      {
        "plan": [
          {
            "day": 1,
            "focus": "string (e.g. Chest & Triceps or Rest)",
            "exercises": [
              { "name": "string", "sets": number, "reps": "string", "notes": "string" }
            ]
          }
        ] // for 7 days
      }`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Attempt to parse just to ensure validity, although Gemini in JSON mode usually returns valid JSON
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Planner API error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
