import { clsx } from 'clsx';
import type { NotificationChannel, ReminderTime } from '@/types';
import { NOTIFICATION_CHANNELS, REMINDER_TIMES } from '@/utils/constants';

interface PreferenceSelectorProps {
  selectedChannels: NotificationChannel[];
  selectedTimes: ReminderTime[];
  onChannelsChange: (channels: NotificationChannel[]) => void;
  onTimesChange: (times: ReminderTime[]) => void;
  compact?: boolean;
}

export function PreferenceSelector({
  selectedChannels,
  selectedTimes,
  onChannelsChange,
  onTimesChange,
  compact = false,
}: PreferenceSelectorProps) {
  const toggleChannel = (channel: NotificationChannel) => {
    if (selectedChannels.includes(channel)) {
      onChannelsChange(selectedChannels.filter((c) => c !== channel));
    } else {
      onChannelsChange([...selectedChannels, channel]);
    }
  };

  const toggleTime = (time: ReminderTime) => {
    if (selectedTimes.includes(time)) {
      onTimesChange(selectedTimes.filter((t) => t !== time));
    } else {
      onTimesChange([...selectedTimes, time]);
    }
  };

  return (
    <div className={clsx('space-y-4', compact && 'space-y-3')}>
      {/* Channels */}
      <div>
        <p className={clsx('font-medium text-gray-700 mb-2', compact ? 'text-xs' : 'text-sm')}>
          Canales
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(NOTIFICATION_CHANNELS) as NotificationChannel[]).map((channel) => {
            const { label } = NOTIFICATION_CHANNELS[channel];
            const active = selectedChannels.includes(channel);
            return (
              <button
                key={channel}
                type="button"
                onClick={() => toggleChannel(channel)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  active
                    ? 'bg-primary-100 border-primary-400 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder times */}
      <div>
        <p className={clsx('font-medium text-gray-700 mb-2', compact ? 'text-xs' : 'text-sm')}>
          Recordatorios
        </p>
        <div className="flex flex-wrap gap-2">
          {REMINDER_TIMES.map(({ value, label }) => {
            const active = selectedTimes.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleTime(value)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  active
                    ? 'bg-secondary-100 border-secondary-400 text-secondary-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
