import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { AIAssistant } from '@/components/Chat/AIAssistant';
import { useAppointments } from '@/hooks/useAppointments';

export default function ChatPage() {
  const { appointments } = useAppointments({ status: 'all', limit: 20 });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 page-container pb-20 md:pb-8">
            <h1 className="section-title">Chat con IA</h1>
            <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>
              <AIAssistant
                appointments={appointments}
                className="h-full"
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
