import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Settings, ArrowLeft, Loader2, Save, Sparkles, User, Monitor, Compass } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [screenLimit, setScreenLimit] = useState('');
  const [offlineGoal, setOfflineGoal] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Hydrate state from profile context
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setScreenLimit(profile.daily_screen_limit?.toString() || '120');
      setOfflineGoal(profile.daily_offline_goal?.toString() || '60');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedScreenLimit = parseInt(screenLimit, 10);
    const parsedOfflineGoal = parseInt(offlineGoal, 10);

    // Validation
    if (!displayName.trim()) {
      setError('Display Name cannot be blank.');
      return;
    }

    if (isNaN(parsedScreenLimit) || parsedScreenLimit < 0) {
      setError('Daily Screen Limit must be a non-negative number.');
      return;
    }

    if (isNaN(parsedOfflineGoal) || parsedOfflineGoal <= 0) {
      setError('Daily Offline Goal must be a positive number greater than 0.');
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile(user.id, {
        display_name: displayName.trim(),
        daily_screen_limit: parsedScreenLimit,
        daily_offline_goal: parsedOfflineGoal,
      });
      
      // Update global context cache
      await refreshProfile();
      showToast('Settings saved successfully.', 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile settings.');
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 fade-in text-left">
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
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
            Account Settings
          </h2>
          <p className="text-xs text-theme-text-sec mt-0.5">
            Configure your personalized boundaries, wellness objectives, and display values.
          </p>
        </div>
      </div>

      {/* Card Form */}
      <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
        {error && (
          <div className="mb-4 p-3 bg-theme-error/10 border border-theme-error/20 text-xs font-medium text-theme-error rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Display Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-text-sec flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-theme-text-sec/60" /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={saving}
            />
          </div>

          {/* Daily Screen Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-text-sec flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 text-theme-text-sec/60" /> Daily Screen Limit (minutes)
            </label>
            <input
              type="number"
              value={screenLimit}
              onChange={(e) => setScreenLimit(e.target.value)}
              className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={saving}
              min="0"
            />
            <p className="text-[10px] text-theme-text-sec">
              The recommended limit is 120 minutes or fewer of non-work screen usage.
            </p>
          </div>

          {/* Daily Offline Goal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-text-sec flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-theme-text-sec/60" /> Daily Offline Activity Goal (minutes)
            </label>
            <input
              type="number"
              value={offlineGoal}
              onChange={(e) => setOfflineGoal(e.target.value)}
              className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={saving}
              min="1"
            />
            <p className="text-[10px] text-theme-text-sec">
              Establishing a streak requires logging offline activity totaling or exceeding this minutes target.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2 border-t border-theme-border pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 border border-theme-border hover:bg-theme-sec text-theme-text-sec hover:text-theme-text rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-theme-primary hover:opacity-90 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-theme-primary/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Insight info */}
      <div className="p-4 bg-theme-success/5 border border-theme-success/15 rounded-2xl flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-theme-success flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-theme-success mb-0.5">Flexible Boundaries</h4>
          <p className="text-theme-text-sec leading-relaxed">
            Changing your limits will recalculate your dashboard stats immediately. Start with realistic goals, e.g. 120 minutes limit and 30 minutes offline activity, and gradually challenge yourself as you progress!
          </p>
        </div>
      </div>
    </div>
  );
}
