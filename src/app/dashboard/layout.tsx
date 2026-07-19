import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-surface relative z-0">
      <div className="grain-overlay"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto hide-scroll pb-16 lg:pb-0 relative">
        <Navbar />
        <main className="flex-1 w-full relative px-4 md:px-8 lg:px-12 py-8 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
