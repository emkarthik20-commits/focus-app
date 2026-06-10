import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  Bell, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Trash2, 
  Clock, 
  BellOff, 
  Check, 
  Sparkles
} from 'lucide-react';

export default function Reminders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState('');

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getReminders(user.id);
      setReminders(data);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      showToast('Failed to fetch reminders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for the reminder.');
      return;
    }

    if (!time) {
      setError('Please select a valid time.');
      return;
    }

    setAdding(true);
    try {
      await api.addReminder(user.id, {
        title: title.trim(),
        reminder_time: time,
      });
      showToast('Reminder created successfully.', 'success');
      setTitle('');
      await fetchReminders();
    } catch (err) {
      console.error(err);
      setError('Failed to create reminder. Please try again.');
      showToast('Failed to save reminder.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (reminder) => {
    try {
      const updated = await api.updateReminder(reminder.id, {
        is_active: !reminder.is_active,
      });
      
      // Update local state directly to be fast
      setReminders(prev => 
        prev.map(r => r.id === reminder.id ? updated : r)
      );

      showToast(
        `Reminder "${reminder.title}" turned ${!reminder.is_active ? 'ON' : 'OFF'}.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to update reminder:', err);
      showToast('Failed to change reminder state.', 'error');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.deleteReminder(reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      showToast('Reminder deleted.', 'success');
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      showToast('Failed to delete reminder.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 fade-in text-left">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-text-sec hover:text-theme-text transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
            Wellness Reminders
          </h2>
          <p className="text-xs text-theme-text-sec mt-0.5">
            Configure custom prompts to encourage breathing room, physical breaks, and digital limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Creator Form */}
        <div className="md:col-span-1 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
          <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-4">
            Add Reminder
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-theme-error/10 border border-theme-error/20 text-xs font-medium text-theme-error rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleAddReminder} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-theme-text-sec">
                Reminder Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stretch & walk around"
                className="w-full px-4 py-2 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
                disabled={adding}
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-theme-text-sec">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition cursor-pointer premium-input-focus"
                disabled={adding}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={adding}
              className="w-full mt-2 py-2.5 bg-theme-primary hover:opacity-90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-theme-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
            >
              {adding ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4.5 h-4.5" />
                  <span>Add Reminder</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Grid */}
        <div className="md:col-span-2 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 min-h-[300px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-4">
              Your Active Reminders
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-theme-primary" />
                <p className="text-xs text-theme-text-sec">Loading your schedule...</p>
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-4">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-theme-border animate-spin-slow"></div>
                  <div className="absolute w-14 h-14 rounded-full bg-theme-primary/5 border border-theme-primary/10"></div>
                  <div className="relative p-3.5 bg-theme-card border border-theme-border rounded-2xl shadow-md text-theme-text-sec">
                    <BellOff className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm text-theme-text mb-1">No reminders set</h4>
                <p className="text-xs text-theme-text-sec max-w-xs leading-relaxed">
                  Configure custom reminders to step away from screens, take walks, or practice breathing exercises.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-4 border rounded-xl transition ${
                      reminder.is_active
                        ? 'border-theme-success/30 bg-theme-success/5'
                        : 'border-theme-border bg-theme-sec/20 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        reminder.is_active 
                          ? 'bg-theme-success/10 text-theme-success' 
                          : 'bg-theme-sec text-theme-text-sec'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-theme-text truncate">
                          {reminder.title}
                        </h4>
                        <span className="text-xs font-extrabold text-theme-text-sec font-display block mt-0.5">
                          {reminder.reminder_time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleActive(reminder)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                          reminder.is_active ? 'bg-theme-success' : 'bg-theme-border'
                        }`}
                        title={reminder.is_active ? 'Deactivate reminder' : 'Activate reminder'}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            reminder.is_active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-1.5 text-theme-text-sec hover:text-theme-error hover:bg-theme-error/10 rounded-lg transition cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-theme-border pt-4 text-xs text-theme-text-sec flex gap-2 items-center">
            <Sparkles className="w-4 h-4 text-theme-warning flex-shrink-0" />
            <span>Reminders help construct natural trigger boundaries during heavy work days.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
