import { useAuthStore } from '@/store/store';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { ClientDashboard } from '@/components/Dashboard/ClientDashboard';
import { ProviderDashboard } from '@/components/Dashboard/ProviderDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container pb-20 md:pb-8">
            {user.role === 'provider' ? (
              <ProviderDashboard user={user} />
            ) : (
              <ClientDashboard user={user} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation />
    </div>
  );
}
