import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect('/dashboard');

  const features = [
    { title: 'Daily Tracking', desc: 'Monitor your steps, water intake, calories burned, and body weight — all in one clean editorial dashboard.', icon: 'directions_run' },
    { title: 'Meal Logging', desc: 'Log every meal with macros. Build a detailed nutritional archive of your dietary habits over time.', icon: 'restaurant' },
    { title: 'Workout Plans', desc: 'AI-generated 7-day training protocols tailored to your goals. Save, refine, and iterate.', icon: 'fitness_center' },
    { title: 'AI Coach', desc: 'Get personalized, data-driven advice from Fitto — an AI coach that reads your actual performance data.', icon: 'smart_toy' },
    { title: 'Health Sync', desc: 'Automatically import daily activity from Google Fit. Your data flows in, no manual entry needed.', icon: 'sync' },
    { title: 'Progress Reports', desc: 'Visualize your transformation with interactive charts spanning steps, weight, hydration, and more.', icon: 'monitoring' },
  ];

  const stats = [
    { value: '7-Day', label: 'AI Meal & Workout Plans' },
    { value: '6+', label: 'Daily Metrics Tracked' },
    { value: '∞', label: 'Meals & Workouts Logged' },
    { value: '24/7', label: 'AI Coach Available' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds with email or Google. Your editorial fitness journal begins here.' },
    { num: '02', title: 'Log Your First Day', desc: 'Record your weight, steps, water, and meals. Each entry becomes part of your curated archive.' },
    { num: '03', title: 'Generate Your Protocol', desc: 'Let AI craft a personalized 7-day meal or workout plan based on your unique goals.' },
    { num: '04', title: 'Track Your Evolution', desc: 'Watch your progress unfold through beautiful charts and data-driven insights over time.' },
  ];

  return (
    <div className="min-h-screen bg-background relative z-0 flex flex-col">
      <div className="grain-overlay"></div>
      
      {/* ─── Navbar ─── */}
      <header className="px-6 md:px-12 h-24 flex items-center justify-center border-b border-outline-variant relative z-10 sticky top-0 bg-background/90 backdrop-blur-md">
        <div className="w-full max-w-[1400px] flex items-center justify-between">
          <div className="font-headline-md text-2xl font-normal text-on-surface uppercase tracking-tight">
            Fitoholic
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="font-label-caps text-[11px] tracking-widest text-on-surface-variant hover:text-on-surface transition-colors uppercase">
              Login
            </Link>
            <Link href="/signup" className="editorial-button px-6 py-3 font-label-caps text-[11px] uppercase tracking-widest text-on-primary shadow-sm hover:shadow-md transition-all">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">

        {/* ─── Hero Section ─── */}
        <section className="px-6 md:px-12 pt-24 md:pt-32 pb-32 w-full max-w-[1400px] mx-auto">
          <div className="max-w-4xl space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 border-b border-secondary pb-1 text-secondary font-label-caps text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-[14px]">new_releases</span>
              Now with AI-powered coaching
            </div>
            
            <h1 className="text-[48px] md:text-[88px] lg:text-[96px] font-display-lg leading-[1.05] tracking-tight text-on-surface">
              Track Your <br/><span className="italic font-light text-secondary">Fitness Journey</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-body-lg text-on-surface-variant max-w-2xl font-light leading-relaxed">
              The editorial fitness companion designed for people who care about the details. Log meals, track workouts, and let AI curate your regimen.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-6 pt-8">
              <Link href="/signup" className="editorial-button px-10 py-5 font-label-caps text-[12px] uppercase tracking-widest text-on-primary active:scale-[0.99] transition-transform">
                Start Free
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center gap-3 text-[12px] font-label-caps uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors py-5">
                How It Works <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ─── */}
        <section className="border-y border-outline-variant animate-fade-up delay-100">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`px-6 md:px-12 py-10 md:py-14 flex flex-col items-center text-center ${
                  i < stats.length - 1 ? 'border-r border-outline-variant' : ''
                } ${i < 2 ? 'border-b lg:border-b-0 border-outline-variant' : ''}`}
              >
                <p className="font-display-lg text-[36px] md:text-[48px] text-on-surface tracking-tighter leading-none mb-3">{stat.value}</p>
                <p className="font-label-caps text-[9px] md:text-[10px] tracking-widest text-on-surface-variant uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16 md:mb-24 animate-fade-up delay-200">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest text-secondary uppercase mb-4">Capabilities</p>
              <h2 className="font-display-lg text-[36px] md:text-[56px] text-on-surface tracking-tight leading-[1.1]">
                Everything You <br className="hidden md:block" /><span className="italic font-light">Need to Succeed</span>
              </h2>
            </div>
            <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed italic">
              Six integrated modules working together to give you a complete picture of your health and fitness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-outline-variant animate-fade-up delay-300">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`p-8 md:p-12 group hover:bg-surface-container-lowest transition-colors ${
                  i < features.length - (features.length % 3 === 0 ? 3 : features.length % 3) ? 'border-b border-outline-variant' : ''
                } ${(i + 1) % 3 !== 0 ? 'lg:border-r border-outline-variant' : ''} ${
                  i % 2 === 0 && i < features.length - 1 ? 'md:border-r lg:border-r-0' : ''
                } ${i < features.length - 2 ? 'md:border-b lg:border-b-0' : ''}`}
              >
                <div className="flex justify-between items-start mb-10">
                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-secondary transition-colors font-light">
                    {feature.icon}
                  </span>
                  <span className="font-label-caps text-[10px] tracking-widest text-outline uppercase">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-headline-md text-on-surface mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed text-[14px]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="border-y border-outline-variant">
          <div className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1400px] mx-auto">
            <div className="text-center mb-16 md:mb-24 animate-fade-up">
              <p className="font-label-caps text-[10px] tracking-widest text-secondary uppercase mb-4">Process</p>
              <h2 className="font-display-lg text-[36px] md:text-[56px] text-on-surface tracking-tight leading-[1.1]">
                Four Steps to <span className="italic font-light">Your Best Self</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`p-8 md:p-10 relative group ${
                    i < steps.length - 1 ? 'lg:border-r border-outline-variant' : ''
                  } ${i < steps.length - 2 ? 'md:border-b lg:border-b-0 border-outline-variant' : ''} ${
                    i < steps.length - 1 && i % 2 === 0 ? 'md:border-r border-outline-variant' : ''
                  }`}
                >
                  <p className="font-display-lg text-[56px] md:text-[72px] text-outline-variant group-hover:text-secondary/20 transition-colors leading-none tracking-tighter mb-6">{step.num}</p>
                  <h3 className="font-headline-md text-xl text-on-surface tracking-tight mb-3">{step.title}</h3>
                  <p className="font-body-md text-on-surface-variant text-[14px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── AI Coach Highlight ─── */}
        <section className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center animate-fade-up">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest text-secondary uppercase mb-4">Premium Feature</p>
              <h2 className="font-display-lg text-[36px] md:text-[48px] text-on-surface tracking-tight leading-[1.1] mb-6">
                Meet <span className="italic font-light text-secondary">Fitto</span>,<br />Your AI Coach
              </h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed mb-8 max-w-lg">
                Fitto doesn't give generic advice. It reads your actual logged data — steps, weight trends, meals, workouts — and provides genuinely personalized, data-driven recommendations. It's like having a personal trainer who's always watching your metrics.
              </p>
              <div className="space-y-4">
                {[
                  'Analyzes your real performance data',
                  'Adapts recommendations as you progress',
                  'Available 24/7 in your dashboard',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[16px] text-secondary">check</span>
                    <span className="font-body-md text-on-surface text-[14px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="editorial-card p-8 md:p-10 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-outline-variant">
                <span className="material-symbols-outlined text-[24px] text-secondary">smart_toy</span>
                <div>
                  <p className="font-headline-md text-lg text-on-surface">Fitto AI</p>
                  <p className="font-label-caps text-[9px] tracking-widest text-on-surface-variant uppercase">Personal Coach</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 flex items-center justify-center text-[10px] font-label-caps text-secondary border border-outline-variant rounded-sm flex-shrink-0 mt-1">AI</div>
                  <div className="editorial-card px-5 py-4 flex-1">
                    <p className="font-body-md text-on-surface text-[13px] leading-relaxed italic">
                      "Based on your logs, you've averaged 6,200 steps this week — down 15% from last week. I'd recommend adding a 20-minute walk after lunch to get back on track. Your protein intake has been solid though — keep that up."
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="editorial-card px-5 py-4 bg-surface-container max-w-[80%]">
                    <p className="font-body-md text-on-surface text-[13px] leading-relaxed">
                      What should I eat today to hit my macro targets?
                    </p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-[10px] font-label-caps text-primary border border-outline-variant rounded-sm flex-shrink-0 mt-1">You</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="border-t border-outline-variant">
          <div className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1400px] mx-auto text-center animate-fade-up">
            <h2 className="font-display-lg text-[36px] md:text-[64px] text-on-surface tracking-tight leading-[1.1] mb-6">
              Start Your <span className="italic font-light text-secondary">Regimen</span>
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-lg mx-auto mb-12 leading-relaxed italic">
              Join Fitoholic and begin curating your fitness journey with the precision and aesthetic it deserves.
            </p>
            <Link href="/signup" className="editorial-button inline-flex items-center gap-4 px-12 py-5 font-label-caps text-[12px] uppercase tracking-widest text-on-primary active:scale-[0.99] transition-transform">
              Create Free Account <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="px-6 md:px-12 py-8 border-t border-outline-variant relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <span className="font-headline-md text-lg text-on-surface uppercase tracking-tight">Fitoholic</span>
            <span className="font-label-caps text-[9px] tracking-widest text-on-surface-variant uppercase">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/login" className="font-label-caps text-[9px] tracking-widest text-on-surface-variant hover:text-secondary transition-colors uppercase">Login</Link>
            <Link href="/signup" className="font-label-caps text-[9px] tracking-widest text-on-surface-variant hover:text-secondary transition-colors uppercase">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
