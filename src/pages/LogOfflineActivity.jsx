import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Compass, ArrowLeft, Loader2, Save, Gift } from 'lucide-react';

export default function LogOfflineActivity() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await api.getActivities();
        setActivities(data);
        if (data.length > 0) {
          setSelectedActivityId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Error loading activities:', err);
        showToast('Failed to load activity options.', 'error');
      } finally {
        setLoadingActivities(false);
      }
    }
    fetchActivities();
  }, [showToast]);

  const selectedActivity = activities.find(
    (act) => act.id.toString() === selectedActivityId
  );

  const pointsPerMinute = selectedActivity?.points_per_minute || 1;
  const calculatedPoints = duration ? parseInt(duration, 10) * pointsPerMinute : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const parsedDuration = parseInt(duration, 10);
    if (!selectedActivityId) {
      setError('Please select an offline activity.');
      return;
    }
    if (!duration) {
      setError('Please specify the duration.');
      return;
    }
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError('Duration must be a positive integer greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await api.addDailyLog(user.id, {
        log_type: 'offline',
        activity_id: parseInt(selectedActivityId, 10),
        duration_minutes: parsedDuration,
        description: description.trim(),
      });
      showToast(
        `Logged activity successfully! You earned +${calculatedPoints} XP.`,
        'success'
      );
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to log offline activity. Please try again.');
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
        <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
            Log Offline Activity
          </h2>
          <p className="text-xs text-theme-text-sec mt-0.5">
            Record healthy real-world habits to replace screens and win streaks.
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

        {loadingActivities ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-theme-primary" />
            <p className="text-xs text-theme-text-sec">Retrieving wellness activities...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Activity Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-theme-text-sec">
                Choose Activity
              </label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition cursor-pointer premium-input-focus"
                disabled={loading}
              >
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name} ({act.points_per_minute} XP/min)
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-theme-text-sec">
                Duration (in minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
                disabled={loading}
                min="1"
              />
            </div>

            {/* Description Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-theme-text-sec">
                Notes / Reflections (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Read 20 pages of my book, worked out with weights..."
                rows="4"
                className="w-full px-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition resize-none premium-input-focus"
                disabled={loading}
              />
            </div>

            {/* Dynamic Point/XP Calculator */}
            {calculatedPoints > 0 && (
              <div className="p-3 bg-theme-success/5 border border-theme-success/15 rounded-xl flex items-center justify-between">
                <span className="text-xs text-theme-text-sec flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-theme-success" />
                  <span>Estimated rewards for your effort</span>
                </span>
                <span className="text-sm font-extrabold text-theme-success font-display">
                  +{calculatedPoints} XP
                </span>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}
