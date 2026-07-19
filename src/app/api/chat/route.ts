import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = session.user.id;

    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'USER',
        content: message
      }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [profile, meals, workouts, history] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.mealEntry.findMany({ 
        where: { userId, loggedAt: { gte: startOfToday } },
        include: { food: true } 
      }),
      prisma.workoutLog.findMany({ 
        where: { userId, performedAt: { gte: startOfToday } },
        include: { exercise: true }
      }),
      prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 30
      })
    ]);

    const mealsContext = meals.length > 0 
      ? meals.map(m => `- ${m.food.name} (${m.quantityG}g): ${((m.food.caloriesPer100g * m.quantityG)/100).toFixed(0)} kcal`).join('\n')
      : 'No meals logged today.';
      
    const workoutsContext = workouts.length > 0
      ? workouts.map(w => `- ${w.exercise.name}: ${w.sets} sets x ${w.reps} reps ${w.weightKg ? `at ${w.weightKg}kg` : ''}`).join('\n')
      : 'No workouts logged today.';

    const systemPrompt = `You are Fitto, an elite fitness AI coach for an app called Fitoholic. 
You are talking to ${profile?.name || 'the user'}.
Be concise, encouraging, and highly analytical.

LIVE CONTEXT FOR TODAY:
Meals Logged:
${mealsContext}

Workouts Logged:
${workoutsContext}

Respond accurately based on this data. Calculate calories if asked. Use markdown formatting.`;

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Remove the latest user message from history, since we pass it to sendMessage
    const historyWithoutLatest = formattedHistory.slice(0, -1);

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt 
    });

    const chat = model.startChat({
      history: historyWithoutLatest,
    });

    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'ASSISTANT',
        content: aiResponse
      }
    });

    return NextResponse.json({ message: aiResponse });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'AI failed to respond' }, { status: 500 });
  }
}
