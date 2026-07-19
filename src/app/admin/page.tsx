import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [totalUsers, premiumUsers, payments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.payment.findMany({ 
      take: 10, 
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }),
  ]);

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0) / 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</h3>
          <p className="text-4xl font-bold mt-2">{totalUsers}</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Premium Users</h3>
          <p className="text-4xl font-bold text-primary mt-2">{premiumUsers}</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-xl">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Revenue</h3>
          <p className="text-4xl font-bold text-accent mt-2">₹{totalRevenue}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recent Payments</h3>
        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xl">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{payment.user.name}</div>
                      <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{payment.amount / 100}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'PAID' ? 'bg-primary/10 text-primary' :
                        payment.status === 'FAILED' ? 'bg-destructive/10 text-destructive' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
