import { useState } from 'react';
import { Bell, History } from 'lucide-react';
import { clsx } from 'clsx';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { BottomNavigation } from '@/components/common/Navigation';
import { ReminderSettings } from '@/components/Notifications/ReminderSettings';
import { NotificationHistory } from '@/components/Notifications/NotificationHistory';

type TabId = 'reminders' | 'history';

const TABS: Array<{ id: TabId; label: string; icon: typeof Bell }> = [
  { id: 'reminders', label: 'Recordatorios', icon: Bell },
  { id: 'history', label: 'Historial', icon: History },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('reminders');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="page-container pb-20 md:pb-8">
            <h1 className="section-title">Configuración</h1>

            <div className="max-w-2xl">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      activeTab === id
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="card">
                {activeTab === 'reminders' && <ReminderSettings />}
                {activeTab === 'history' && <NotificationHistory />}
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
