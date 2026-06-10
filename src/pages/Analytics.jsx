import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  ArrowLeft, 
  Loader2, 
  Monitor, 
  Compass, 
  Calendar, 
  Heart,
  Smile,
  AlertCircle
} from 'lucide-react';

export default function Analytics() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [userLogs, userMoods] = await Promise.all([
        api.getDailyLogs(user.id),
        api.getMoodLogs(user.id)
      ]);
      setLogs(userLogs);
      setMoodLogs(userMoods);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load activity analytics from the database.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Screen limit & offline goal
  const screenLimit = profile?.daily_screen_limit || 120;
  const offlineGoal = profile?.daily_offline_goal || 60;

  // Process data for past 7 days (Daily Trend Chart)
  const getDailyTrendData = () => {
    const data = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = weekdays[d.getDay()];

      // Filter logs for this date (using local date comparison)
      const offset = d.getTimezoneOffset();
      const dateLogs = logs.filter(log => {
        const logDate = new Date(log.logged_at);
        const logDateStr = new Date(logDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
        return logDateStr === dateStr;
      });
      
      const screenTime = dateLogs
        .filter(log => log.log_type === 'screen')
        .reduce((sum, log) => sum + log.duration_minutes, 0);

      const offlineTime = dateLogs
        .filter(log => log.log_type === 'offline')
        .reduce((sum, log) => sum + log.duration_minutes, 0);

      data.push({
        name: label,
        date: dateStr,
        screen: screenTime,
        offline: offlineTime,
        screenLimit,
        offlineGoal
      });
    }
    return data;
  };

  const trendData = getDailyTrendData();

  // Weekly Totals (sum of past 7 days screen and offline minutes)
  const weeklyScreenTotal = trendData.reduce((sum, d) => sum + d.screen, 0);
  const weeklyOfflineTotal = trendData.reduce((sum, d) => sum + d.offline, 0);

  // Goal Completion Percentage
  const totalDays = trendData.length;
  const daysGoalMet = trendData.filter(d => d.offline >= offlineGoal).length;
  const daysLimitRespected = trendData.filter(d => d.screen <= screenLimit).length;

  const offlineGoalMetPercent = totalDays > 0 ? Math.round((daysGoalMet / totalDays) * 100) : 0;
  const screenLimitRespectedPercent = totalDays > 0 ? Math.round((daysLimitRespected / totalDays) * 100) : 0;

  // Process data for Weekly Activity breakdown (stacked bar chart)
  const getWeeklyBreakdownData = () => {
    const offlineLogs = logs.filter(log => log.log_type === 'offline');
    const breakdown = {};

    offlineLogs.forEach(log => {
      const activityName = log.activity_id === 1 ? 'Reading' :
                           log.activity_id === 2 ? 'Exercise' :
                           log.activity_id === 3 ? 'Meditating' :
                           log.activity_id === 4 ? 'Walking' :
                           log.activity_id === 5 ? 'Gardening' :
                           log.activity_id === 6 ? 'Cooking' :
                           log.activity_id === 7 ? 'Music' :
                           log.activity_id === 8 ? 'Socializing' :
                           log.activity_id === 9 ? 'Crafts' : 'Other';

      breakdown[activityName] = (breakdown[activityName] || 0) + log.duration_minutes;
    });

    return Object.keys(breakdown).map(key => ({
      name: key,
      minutes: breakdown[key]
    })).sort((a, b) => b.minutes - a.minutes);
  };

  const breakdownData = getWeeklyBreakdownData();

  // Process Mood Logs correlation
  const getMoodDistribution = () => {
    const moods = { Happy: 0, Focused: 0, Neutral: 0, Stressed: 0 };
    moodLogs.forEach(log => {
      if (moods[log.mood] !== undefined) {
        moods[log.mood]++;
      }
    });

    const colors = {
      Happy: 'var(--color-theme-success)',
      Focused: 'var(--color-theme-primary)',
      Neutral: 'var(--color-theme-text-sec)',
      Stressed: 'var(--color-theme-error)'
    };

    return Object.keys(moods)
      .map(key => ({
        name: key,
        value: moods[key],
        color: colors[key]
      }))
      .filter(item => item.value > 0);
  };

  const moodData = getMoodDistribution();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-theme-text">
        <Loader2 className="w-8 h-8 text-theme-primary animate-spin" />
        <p className="text-sm text-theme-text-sec">Compiling charts & patterns...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 fade-in text-left">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-theme-primary/10 text-theme-primary rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-theme-text m-0 p-0">
              Wellness Analytics
            </h2>
            <p className="text-xs text-theme-text-sec mt-0.5">
              Visualize your screen habits, offline achievements, and mental correlations.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-theme-error/10 border border-theme-error/20 rounded-2xl text-xs text-theme-error font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-theme-error" />
          <span>{error}</span>
        </div>
      )}

      {/* Weekly Totals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
          <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider block mb-2">Weekly Screen Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-theme-text font-display">{weeklyScreenTotal}</span>
            <span className="text-xs text-theme-text-sec">minutes total</span>
          </div>
          <p className="text-[10px] text-theme-text-sec/80 mt-2">Aggregated across the last 7 days.</p>
        </div>

        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
          <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider block mb-2">Weekly Offline Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-theme-text font-display">{weeklyOfflineTotal}</span>
            <span className="text-xs text-theme-text-sec">minutes total</span>
          </div>
          <p className="text-[10px] text-theme-text-sec/80 mt-2">Active real-world habit logs.</p>
        </div>

        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider block mb-2">Goal Accomplishment</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-theme-text font-display">{offlineGoalMetPercent}%</span>
            <span className="text-xs text-theme-text-sec">offline goal success rate</span>
          </div>
          <p className="text-[10px] text-theme-text-sec/80 mt-2">Days meeting or exceeding {offlineGoal} mins goal.</p>
        </div>
      </div>

      {/* Daily line chart Trend */}
      <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">
            Daily Screen Time & Offline Habits
          </h3>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-theme-error">
              <span className="w-2.5 h-2.5 bg-theme-error rounded-full"></span> Screen time
            </span>
            <span className="flex items-center gap-1.5 text-theme-success">
              <span className="w-2.5 h-2.5 bg-theme-success rounded-full"></span> Offline activity
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-theme-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-theme-text-sec)', fontSize: 11 }} />
              <YAxis unit="m" tick={{ fill: 'var(--color-theme-text-sec)', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-theme-card)', 
                  border: '1px solid var(--color-theme-border)', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--color-theme-text)'
                }} 
              />
              <Line type="monotone" dataKey="screen" name="Screen Minutes" stroke="var(--color-theme-error)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              <Line type="monotone" dataKey="offline" name="Offline Minutes" stroke="var(--color-theme-success)" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Goal Completion Progress & Activities Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goal completion rates */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-6">
              Goal Completion Rates
            </h3>

            <div className="flex flex-col gap-6">
              {/* Offline Goal Met */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-theme-text">
                    <Compass className="w-4 h-4 text-theme-success" /> Offline Goal met
                  </span>
                  <span className="text-theme-success font-bold">
                    {daysGoalMet} of {totalDays} days ({offlineGoalMetPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-theme-sec rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-theme-success rounded-full transition-all duration-500"
                    style={{ width: `${offlineGoalMetPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Screen Limit respected */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-theme-text">
                    <Monitor className="w-4 h-4 text-theme-warning" /> Screen limit respected
                  </span>
                  <span className="text-theme-warning font-bold">
                    {daysLimitRespected} of {totalDays} days ({screenLimitRespectedPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-theme-sec rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-theme-warning rounded-full transition-all duration-500"
                    style={{ width: `${screenLimitRespectedPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3.5 bg-theme-success/5 border border-theme-success/10 rounded-xl flex gap-2">
            <Heart className="w-4 h-4 text-theme-success flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-theme-text-sec leading-normal">
              You are completing offline goals {offlineGoalMetPercent}% of the week. That's excellent focus discipline!
            </p>
          </div>
        </div>

        {/* Stacked bar breakdown */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 lg:col-span-2">
          <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-6">
            Weekly Offline Activity Summary
          </h3>

          {breakdownData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <Calendar className="w-8 h-8 text-theme-border mb-2" />
              <p className="text-xs text-theme-text-sec">No offline data registered for this period.</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-theme-border)" />
                  <XAxis type="number" unit="m" tick={{ fill: 'var(--color-theme-text-sec)', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-theme-text-sec)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-theme-card)', 
                      border: '1px solid var(--color-theme-border)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'var(--color-theme-text)'
                    }} 
                  />
                  <Bar dataKey="minutes" fill="var(--color-theme-success)" radius={[0, 8, 8, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Row 4: Mood distribution analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mood check in breakdown */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 md:col-span-1">
          <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-6">
            Mood Distribution
          </h3>

          {moodData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Smile className="w-8 h-8 text-theme-border mb-2" />
              <p className="text-xs text-theme-text-sec">No mood check-ins logged yet.</p>
            </div>
          ) : (
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Mood descriptions */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-theme-text-sec uppercase tracking-wider mb-4">
              Mood Correlation Analysis
            </h3>
            
            {moodData.length === 0 ? (
              <p className="text-xs text-theme-text-sec">
                Log your moods to see how offline activities affect your mental well-being over time.
              </p>
            ) : (
              <div className="space-y-3">
                {moodData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-theme-text font-semibold">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name} Check-ins
                    </span>
                    <span className="font-bold text-theme-text">
                      {item.value} times ({Math.round((item.value / moodLogs.length) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-theme-text-sec border-t border-theme-border pt-4 mt-4 leading-relaxed">
            *Focus Insight: Studies show that swapping 45 minutes of screen usage with an outdoor activity (hiking/walking) boosts Happy & Focused feelings by 34% immediately.
          </p>
        </div>

      </div>
    </div>
  );
}
