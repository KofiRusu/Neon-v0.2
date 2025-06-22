'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ScheduleEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: ScheduleData) => void;
  emailData?: {
    subject: string;
    content: string;
  };
}

interface ScheduleData {
  scheduleAt: Date;
  recipients: Array<{
    email: string;
    name?: string;
    variables?: Record<string, any>;
  }>;
  timezone: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  description: string;
}

const mockRecipientGroups: RecipientGroup[] = [
  { id: 'all-customers', name: 'All Customers', count: 1247, description: 'Complete customer database' },
  { id: 'newsletter-subscribers', name: 'Newsletter Subscribers', count: 892, description: 'Active newsletter subscribers' },
  { id: 'premium-users', name: 'Premium Users', count: 156, description: 'Premium subscription holders' },
  { id: 'recent-signups', name: 'Recent Signups', count: 67, description: 'Users who joined in the last 30 days' },
];

const timeZones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function ScheduleEmailModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  emailData 
}: ScheduleEmailModalProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    scheduleAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    recipients: [],
    timezone: 'UTC',
  });

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [customRecipients, setCustomRecipients] = useState<string>('');
  const [recipientMode, setRecipientMode] = useState<'groups' | 'custom'>('groups');
  const [schedulingStep, setSchedulingStep] = useState<'datetime' | 'recipients' | 'review'>('datetime');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setScheduleData({
        scheduleAt: new Date(Date.now() + 60 * 60 * 1000),
        recipients: [],
        timezone: 'UTC',
      });
      setSelectedGroups([]);
      setCustomRecipients('');
      setSchedulingStep('datetime');
    }
  }, [isOpen]);

  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    const currentDate = scheduleData.scheduleAt;
    let newDate = new Date(currentDate);

    if (field === 'date') {
      const [year, month, day] = value.split('-').map(Number);
      newDate.setFullYear(year, month - 1, day);
    } else {
      const [hours, minutes] = value.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }

    setScheduleData(prev => ({ ...prev, scheduleAt: newDate }));
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const parseCustomRecipients = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      const email = parts[0];
      const name = parts[1] || undefined;
      return { email, name };
    }).filter(r => r.email.includes('@'));
  };

  const getTotalRecipients = () => {
    if (recipientMode === 'groups') {
      return selectedGroups.reduce((total, groupId) => {
        const group = mockRecipientGroups.find(g => g.id === groupId);
        return total + (group?.count || 0);
      }, 0);
    } else {
      return parseCustomRecipients(customRecipients).length;
    }
  };

  const handleSchedule = () => {
    let recipients: Array<{email: string; name?: string; variables?: Record<string, any>}> = [];

    if (recipientMode === 'groups') {
      // In real app, would fetch actual recipients from selected groups
      recipients = selectedGroups.map(groupId => ({
        email: `group-${groupId}@example.com`,
        name: `Group ${groupId}`,
      }));
    } else {
      recipients = parseCustomRecipients(customRecipients);
    }

    onSchedule({
      ...scheduleData,
      recipients,
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  const getMinDateTime = () => {
    const now = new Date();
    const min = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    return min.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl border border-dark-700/50 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-dark-800/80 px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-6 w-6 text-neon-400" />
            <h2 className="text-xl font-semibold text-white">Schedule Email</h2>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['datetime', 'recipients', 'review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    schedulingStep === step 
                      ? 'bg-neon-400 text-dark-900' 
                      : index < ['datetime', 'recipients', 'review'].indexOf(schedulingStep)
                        ? 'bg-neon-400/20 text-neon-400 border border-neon-400'
                        : 'bg-dark-700 text-dark-400'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-12 h-0.5 mx-2 transition-colors ${
                      index < ['datetime', 'recipients', 'review'].indexOf(schedulingStep)
                        ? 'bg-neon-400'
                        : 'bg-dark-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Step */}
          {schedulingStep === 'datetime' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">When should this email be sent?</h3>
                <p className="text-dark-400">Choose the date and time for your email campaign</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                    <input
                      type="date"
                      value={formatDate(scheduleData.scheduleAt)}
                      min={getMinDateTime()}
                      onChange={(e) => handleDateTimeChange('date', e.target.value)}
                      className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Time</label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                    <input
                      type="time"
                      value={formatTime(scheduleData.scheduleAt)}
                      onChange={(e) => handleDateTimeChange('time', e.target.value)}
                      className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Timezone</label>
                <select
                  value={scheduleData.timezone}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400"
                >
                  {timeZones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="bg-neon-400/10 border border-neon-400/20 rounded-lg p-4">
                <p className="text-neon-400 font-medium">Scheduled for:</p>
                <p className="text-white text-lg">
                  {scheduleData.scheduleAt.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: scheduleData.timezone
                  })}
                </p>
                <p className="text-dark-400 text-sm">({scheduleData.timezone})</p>
              </div>
            </div>
          )}

          {/* Recipients Step */}
          {schedulingStep === 'recipients' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Who should receive this email?</h3>
                <p className="text-dark-400">Select recipient groups or add custom recipients</p>
              </div>

              {/* Recipient Mode Toggle */}
              <div className="flex items-center bg-dark-700/50 rounded-lg p-1">
                <button
                  onClick={() => setRecipientMode('groups')}
                  className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                    recipientMode === 'groups' 
                      ? 'bg-neon-400/20 text-neon-400 font-medium' 
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Recipient Groups
                </button>
                <button
                  onClick={() => setRecipientMode('custom')}
                  className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                    recipientMode === 'custom' 
                      ? 'bg-neon-400/20 text-neon-400 font-medium' 
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Custom List
                </button>
              </div>

              {recipientMode === 'groups' && (
                <div className="space-y-3">
                  <p className="text-dark-300 text-sm">Select one or more recipient groups:</p>
                  {mockRecipientGroups.map(group => (
                    <div
                      key={group.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedGroups.includes(group.id)
                          ? 'border-neon-400/50 bg-neon-400/10'
                          : 'border-dark-600/50 bg-dark-700/30 hover:border-neon-400/30'
                      }`}
                      onClick={() => handleGroupSelection(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{group.name}</h4>
                          <p className="text-dark-400 text-sm">{group.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-neon-400 font-semibold">{group.count.toLocaleString()}</p>
                          <p className="text-dark-400 text-xs">recipients</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recipientMode === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Recipients List
                    </label>
                    <p className="text-dark-400 text-xs mb-2">
                      Enter one email per line. Format: email@domain.com,Name (optional)
                    </p>
                    <textarea
                      value={customRecipients}
                      onChange={(e) => setCustomRecipients(e.target.value)}
                      placeholder="john@example.com,John Doe&#10;jane@example.com,Jane Smith&#10;user@company.com"
                      rows={8}
                      className="w-full bg-dark-600/50 border border-dark-500/50 rounded-lg px-4 py-3 text-white focus:border-neon-400 focus:ring-1 focus:ring-neon-400 placeholder-dark-400 font-mono text-sm"
                    />
                  </div>
                  {customRecipients && (
                    <div className="bg-dark-700/30 rounded-lg p-3">
                      <p className="text-dark-300 text-sm">
                        Valid recipients: <span className="text-neon-400 font-medium">{parseCustomRecipients(customRecipients).length}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {getTotalRecipients() > 0 && (
                <div className="bg-neon-400/10 border border-neon-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-5 w-5 text-neon-400" />
                    <p className="text-neon-400 font-medium">
                      Total Recipients: {getTotalRecipients().toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Step */}
          {schedulingStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Review & Schedule</h3>
                <p className="text-dark-400">Confirm your email campaign details</p>
              </div>

              {/* Email Preview */}
              <div className="bg-dark-700/30 rounded-lg p-4 border border-dark-600/50">
                <h4 className="text-white font-medium mb-3">Email Preview</h4>
                <div className="bg-white text-dark-900 rounded-lg p-4 mb-4">
                  <div className="border-b border-gray-200 pb-2 mb-3">
                    <p className="font-semibold">{emailData?.subject || 'Email Subject'}</p>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {emailData?.content?.substring(0, 200) || 'Email content preview...'}
                    {(emailData?.content?.length || 0) > 200 && '...'}
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Schedule</h4>
                  <p className="text-dark-300 text-sm">
                    {scheduleData.scheduleAt.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: scheduleData.timezone
                    })}
                  </p>
                  <p className="text-dark-400 text-xs">({scheduleData.timezone})</p>
                </div>

                <div className="bg-dark-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Recipients</h4>
                  <p className="text-neon-400 text-lg font-semibold">
                    {getTotalRecipients().toLocaleString()}
                  </p>
                  <p className="text-dark-400 text-xs">
                    {recipientMode === 'groups' ? 'From selected groups' : 'Custom list'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-dark-700/50 mt-8">
            <div>
              {schedulingStep !== 'datetime' && (
                <button
                  onClick={() => {
                    const steps = ['datetime', 'recipients', 'review'];
                    const currentIndex = steps.indexOf(schedulingStep);
                    if (currentIndex > 0) {
                      setSchedulingStep(steps[currentIndex - 1] as any);
                    }
                  }}
                  className="btn-secondary"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>

              {schedulingStep === 'review' ? (
                <button
                  onClick={handleSchedule}
                  disabled={getTotalRecipients() === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule Email
                </button>
              ) : (
                <button
                  onClick={() => {
                    const steps = ['datetime', 'recipients', 'review'];
                    const currentIndex = steps.indexOf(schedulingStep);
                    if (currentIndex < steps.length - 1) {
                      setSchedulingStep(steps[currentIndex + 1] as any);
                    }
                  }}
                  disabled={
                    (schedulingStep === 'recipients' && getTotalRecipients() === 0) ||
                    (schedulingStep === 'datetime' && scheduleData.scheduleAt <= new Date())
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}