import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { Appointment } from '@/types';
import { useAppointments } from '@/hooks/useAppointments';
import { formatCurrency } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type DateRange = '1m' | '3m' | '6m' | '1y';

const DATE_RANGES: Array<{ value: DateRange; label: string }> = [
  { value: '1m', label: '1 mes' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 año' },
];

export function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>('3m');
  const { appointments, isLoading } = useAppointments({ status: 'all', limit: 200 });

  const monthCount = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[dateRange];

  const monthlyData = buildChartData(appointments, monthCount);

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalAppointments = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalCompleted = monthlyData.reduce((s, m) => s + m.completed, 0);
  const completionRate = totalAppointments > 0
    ? Math.round((totalCompleted / totalAppointments) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Cargando análisis..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {DATE_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDateRange(value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                dateRange === value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total citas"
          value={totalAppointments}
          icon={Calendar}
          color="primary"
        />
        <SummaryCard
          label="Completadas"
          value={totalCompleted}
          icon={CheckCircle}
          color="success"
        />
        <SummaryCard
          label="Tasa de éxito"
          value={`${completionRate}%`}
          icon={TrendingUp}
          color="secondary"
        />
        <SummaryCard
          label="Ingresos totales"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - appointments */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Citas por Mes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={24}>
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
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="completed" fill="#10b981" name="Completadas" radius={[3, 3, 0, 0]} />
              <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart - revenue */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ingresos por Mes</h3>
          <ResponsiveContainer width="100%" height={240}>
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(v: number) => [formatCurrency(v), 'Ingresos']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={{ fill: '#ec4899', r: 3 }}
                activeDot={{ r: 5 }}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'primary' | 'success' | 'secondary' | 'warning';
}) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    warning: 'bg-warning-50 text-warning-600',
  };

  return (
    <div className="card">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3', colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function buildChartData(appointments: Appointment[], months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = d.toLocaleDateString('es', { month: 'short', year: months > 6 ? '2-digit' : undefined });

    const monthApts = appointments.filter((a) => {
      const ad = new Date(a.start_time);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    });

    const completed = monthApts.filter((a) => a.status === 'completed').length;
    const cancelled = monthApts.filter((a) => a.status === 'cancelled').length;
    const revenue = monthApts
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (a.service?.price || 0), 0);

    return { month: label, total: monthApts.length, completed, cancelled, revenue };
  });
}
