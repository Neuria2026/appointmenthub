import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { clsx } from 'clsx';
import type { User, Appointment } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDateDisplay, formatTime, isToday } from '@/utils/dateUtils';
import { formatCurrency, formatStatus } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProviderDashboardProps {
  user: User;
}

export function ProviderDashboard({ user }: ProviderDashboardProps) {
  const { appointments, isLoading } = useAppointments({ status: 'all', limit: 50 });

  const todayApts = appointments.filter(
    (a) => isToday(a.start_time) && a.status !== 'cancelled'
  );

  const thisWeekApts = appointments.filter((a) => {
    const date = new Date(a.start_time);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return date >= weekStart && date < weekEnd && a.status !== 'cancelled';
  });

  const completedThisMonth = appointments.filter((a) => {
    const date = new Date(a.start_time);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      a.status === 'completed'
    );
  });

  const monthlyRevenue = completedThisMonth.reduce(
    (sum, a) => sum + (a.service?.price || 0),
    0
  );

  // Build monthly chart data (last 6 months)
  const monthlyData = buildMonthlyData(appointments);

  // Top clients
  const clientCounts: Record<string, { name: string; count: number }> = {};
  appointments.forEach((a) => {
    if (a.client) {
      const key = a.client.id;
      if (!clientCounts[key]) {
        clientCounts[key] = { name: a.client.full_name, count: 0 };
      }
      clientCounts[key].count++;
    }
  });
  const topClients = Object.values(clientCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = [
    {
      label: "Citas hoy",
      value: todayApts.length,
      icon: Calendar,
      color: 'primary',
      change: null,
    },
    {
      label: "Esta semana",
      value: thisWeekApts.length,
      icon: TrendingUp,
      color: 'secondary',
      change: null,
    },
    {
      label: "Ingresos este mes",
      value: formatCurrency(monthlyRevenue),
      icon: DollarSign,
      color: 'success',
      change: null,
    },
    {
      label: "Completadas (mes)",
      value: completedThisMonth.length,
      icon: Users,
      color: 'warning',
      change: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" label="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {todayApts.length > 0
              ? `Tienes ${todayApts.length} cita${todayApts.length !== 1 ? 's' : ''} hoy`
              : 'Sin citas para hoy'}
          </p>
        </div>
        <Link to="/appointments" className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Citas por Mes</h2>
            <span className="text-xs text-gray-400">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5 }}
                name="Citas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Top Clientes</h2>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          {topClients.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">Sin clientes aún</p>
          ) : (
            <div className="space-y-3">
              {topClients.map(({ name, count }, idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-300">#{idx + 1}</span>
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {count} cita{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's schedule */}
      {todayApts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Agenda de hoy</h2>
            <Link
              to="/calendar"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Ver calendario <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayApts
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map((apt) => (
                <TodayAppointmentCard key={apt.id} appointment={apt} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string | null;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
  };

  return (
    <div className="card">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', colorMap[color] || colorMap.primary)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function TodayAppointmentCard({ appointment }: { appointment: Appointment }) {
  const status = formatStatus(appointment.status);
  const startDate = new Date(appointment.start_time);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className="flex flex-col items-center gap-0.5 w-12 text-center flex-shrink-0">
        <span className="text-base font-bold text-primary-600">{formatTime(startDate)}</span>
      </div>
      <div className="w-px h-full min-h-[36px] bg-primary-200 flex-shrink-0 self-stretch" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {appointment.service?.name || 'Servicio'}
          </p>
          <span className={clsx('badge text-xs flex-shrink-0', status.bgColor, status.textColor)}>
            {status.label}
          </span>
        </div>
        {appointment.client?.full_name && (
          <p className="text-xs text-gray-500 mt-0.5">
            {appointment.client.full_name}
          </p>
        )}
      </div>
    </div>
  );
}

function buildMonthlyData(appointments: Appointment[]) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('es', { month: 'short' });
    const count = appointments.filter((a) => {
      const ad = new Date(a.start_time);
      return (
        ad.getMonth() === d.getMonth() &&
        ad.getFullYear() === d.getFullYear() &&
        a.status !== 'cancelled'
      );
    }).length;

    months.push({ month: label, appointments: count });
  }
  return months;
}
