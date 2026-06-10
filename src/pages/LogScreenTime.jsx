import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Monitor, ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';

export default function LogScreenTime() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form Validation
    const parsedDuration = parseInt(duration, 10);
    if (!duration) {
      setError('Please specify the screen duration.');
      return;
    }
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError('Duration must be a positive number greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await api.addDailyLog(user.id, {
        log_type: 'screen',
        duration_minutes: parsedDuration,
        description: description.trim(),
      });
      showToast('Screen time logged successfully.', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to log screen time. Please try again.');
      showToast('Failed to save log.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 fade-in text-left">
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
        <div className="p-3 bg-theme-warning/10 text-theme-warning rounded-2xl">
          <Monitor className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
            Log Screen Time
          </h2>
          <p className="text-xs text-theme-text-sec mt-0.5">
            Log your digital sessions to stay conscious of your screen limits.
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Duration Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-text-sec">
              Duration (in minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={loading}
              min="1"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-text-sec">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Watched videos on phone, worked on laptop..."
              rows="4"
              className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition resize-none premium-input-focus"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 border border-theme-border hover:bg-theme-sec text-theme-text-sec hover:text-theme-text rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-theme-primary hover:opacity-90 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-theme-primary/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Wellness Insight */}
      <div className="p-4 bg-theme-success/5 border border-theme-success/15 rounded-2xl flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-theme-success flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-theme-success mb-0.5">Mindful Screen Practice</h4>
          <p className="text-theme-text-sec leading-relaxed">
            By logging your screens, you are creating self-awareness. Taking breaks every 45-60 minutes can improve your posture, reduce eye strain, and boost overall brain energy.
          </p>
        </div>
      </div>
    </div>
  );
}
