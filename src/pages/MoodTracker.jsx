import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  Smile, 
  Meh, 
  Frown, 
  Target, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Clock, 
  HeartHandshake
} from 'lucide-react';

const MOODS = [
  { 
    name: 'Happy', 
    icon: Smile, 
    color: 'bg-theme-success', 
    bgLight: 'bg-theme-success/5 hover:bg-theme-success/10',
    borderActive: 'border-theme-success ring-2 ring-theme-success/20',
    textColor: 'text-theme-success',
    description: 'Feeling energetic, joyful, and satisfied.'
  },
  { 
    name: 'Focused', 
    icon: Target, 
    color: 'bg-theme-primary', 
    bgLight: 'bg-theme-primary/5 hover:bg-theme-primary/10',
    borderActive: 'border-theme-primary ring-2 ring-theme-primary/20',
    textColor: 'text-theme-primary',
    description: 'Attentive, clear-headed, and productive.'
  },
  { 
    name: 'Neutral', 
    icon: Meh, 
    color: 'bg-theme-text-sec', 
    bgLight: 'bg-theme-sec hover:bg-theme-sec/80',
    borderActive: 'border-theme-text-sec ring-2 ring-theme-text-sec/20',
    textColor: 'text-theme-text-sec',
    description: 'Calm, balanced, or moderate mood.'
  },
  { 
    name: 'Stressed', 
    icon: Frown, 
    color: 'bg-theme-error', 
    bgLight: 'bg-theme-error/5 hover:bg-theme-error/10',
    borderActive: 'border-theme-error ring-2 ring-theme-error/20',
    textColor: 'text-theme-error',
    description: 'Anxious, overwhelmed, or tired.'
  },
];

export default function MoodTracker() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedMood, setSelectedMood] = useState('Happy');
  const [moodLogs, setMoodLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMoodLogs = useCallback(async () => {
    if (!user) return;
    try {
      const logs = await api.getMoodLogs(user.id);
      setMoodLogs(logs);
    } catch (err) {
      console.error('Error loading mood history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMoodLogs();
  }, [fetchMoodLogs]);

  const handleLogMood = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.addMoodLog(user.id, selectedMood);
      showToast(`Logged feeling ${selectedMood}!`, 'success');
      await fetchMoodLogs();
    } catch (err) {
      console.error(err);
      showToast('Failed to log mood. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 fade-in text-left">
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
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
            Mood Tracker
          </h2>
          <p className="text-xs text-theme-text-sec mt-0.5">
            Identify correlation between your offline activity and your mental health state.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Selection Pane */}
        <div className="md:col-span-2 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider mb-2">
            How are you feeling right now?
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.name;
              return (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.name)}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl text-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 premium-btn
                    ${isSelected 
                      ? `${mood.borderActive} bg-theme-card shadow-sm` 
                      : 'border-theme-border bg-theme-sec/20 hover:border-theme-text-sec/30'} 
                    ${mood.bgLight}`}
                >
                  <div className={`p-2.5 rounded-full text-white ${mood.color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold ${mood.textColor}`}>{mood.name}</span>
                  <span className="text-[10px] text-theme-text-sec line-clamp-2 leading-relaxed">
                    {mood.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-theme-border pt-4 mt-2">
            <button
              onClick={handleLogMood}
              disabled={saving}
              className="px-6 py-3 bg-theme-primary hover:opacity-90 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-theme-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging mood...</span>
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  <span>Log Current Mood</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* History Pane */}
        <div className="md:col-span-1 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-4">
              Mood Check-ins
            </h3>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-theme-primary" />
                <p className="text-xs text-theme-text-sec">Loading history...</p>
              </div>
            ) : moodLogs.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 px-2">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-theme-border animate-spin-slow"></div>
                  <div className="absolute w-11 h-11 rounded-full bg-theme-primary/5 border border-theme-primary/10"></div>
                  <div className="relative p-2.5 bg-theme-card border border-theme-border rounded-xl shadow-md text-theme-text-sec">
                    <Smile className="w-5 h-5 text-theme-primary" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-xs text-theme-text mb-1">No logs yet</h4>
                <p className="text-[10px] text-theme-text-sec leading-relaxed max-w-xs">
                  Log your mood to begin generating your wellness correlation map.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
                {moodLogs.map((log) => {
                  const moodInfo = MOODS.find(m => m.name === log.mood) || MOODS[0];
                  const Icon = moodInfo.icon;
                  return (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-theme-border text-left bg-theme-sec/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg text-white ${moodInfo.color} shadow-sm`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold ${moodInfo.textColor}`}>{log.mood}</span>
                          <span className="text-[9px] text-theme-text-sec block mt-0.5">
                            {new Date(log.logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                            {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-theme-border pt-4 text-center">
            <div className="p-3 bg-theme-primary/5 border border-theme-primary/10 rounded-xl flex gap-2 items-start">
              <HeartHandshake className="w-4 h-4 text-theme-primary flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-theme-text-sec leading-normal text-left">
                Studies show that logging your mood regularly increases mindful self-awareness by up to 40%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
