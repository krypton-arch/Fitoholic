import { ChatInterface } from '@/components/chat/chat-interface';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Fitto AI Coach - Fitoholic',
};

export default async function ChatPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <header className="mb-8 animate-fade-up">
        <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-background mb-2 tracking-tight font-semibold flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-[40px]">smart_toy</span>
          Fitto AI Coach
        </h2>
        <p className="text-on-surface-variant font-body-md max-w-xl">Get personalized, data-driven advice fueled by your recent performance metrics.</p>
      </header>
      
      <div className="flex-1 max-w-5xl mx-auto w-full h-[calc(100vh-250px)]">
        <ChatInterface />
      </div>
    </>
  );
}
