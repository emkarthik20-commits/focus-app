import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { api } from '../services/api';
import { 
  Monitor, 
  Compass, 
  Flame, 
  Trophy, 
  Plus, 
  RefreshCw, 
  ArrowRight,
  Smile,
  Zap,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError('');
    try {
      const [userLogs, userStreak] = await Promise.all([
        api.getDailyLogs(user.id),
        api.getStreak(user.id)
      ]);
      setLogs(userLogs);
      setStreak(userStreak);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to fetch latest dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh interval (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [loadDashboardData]);

  // Get logs logged today in the user's local timezone
  const getTodayLogs = () => {
    const todayLocal = new Date();
    const offset = todayLocal.getTimezoneOffset();
    const todayStr = new Date(todayLocal.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

    return logs.filter(log => {
      const logDate = new Date(log.logged_at);
      const logDateStr = new Date(logDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
      return logDateStr === todayStr;
    });
  };

  const todayLogs = getTodayLogs();
  
  // Calculate today's totals
  const todayScreenTime = todayLogs
    .filter(log => log.log_type === 'screen')
    .reduce((sum, log) => sum + log.duration_minutes, 0);

  const todayOfflineTime = todayLogs
    .filter(log => log.log_type === 'offline')
    .reduce((sum, log) => sum + log.duration_minutes, 0);

  // Limits and goals
  const screenLimit = profile?.daily_screen_limit || 120;
  const offlineGoal = profile?.daily_offline_goal || 60;

  // Calculate percentages
  const screenPercent = Math.min(Math.round((todayScreenTime / screenLimit) * 100), 100);
  const offlinePercent = Math.min(Math.round((todayOfflineTime / offlineGoal) * 100), 100);

  // Wellness Score = Offline Minutes + (Current Streak * 10) - (Screen Time / 2)
  const totalOfflineMinutes = logs
    .filter(log => log.log_type === 'offline')
    .reduce((sum, log) => sum + log.duration_minutes, 0);

  const totalScreenMinutes = logs
    .filter(log => log.log_type === 'screen')
    .reduce((sum, log) => sum + log.duration_minutes, 0);

  const rawWellnessScore = totalOfflineMinutes + (streak.current_streak * 10) - (totalScreenMinutes / 2);
  const wellnessScore = Math.max(0, Math.round(rawWellnessScore));

  // Determine Level / Rank
  let badgeName = 'Beginner 🌱';
  let nextRankName = 'Balanced 🌿';
  let badgePercent = 0;
  let motivationalMessage = 'Starting fresh! Log more offline activities to level up.';

  if (wellnessScore <= 100) {
    badgeName = 'Beginner 🌱';
    nextRankName = 'Balanced 🌿';
    badgePercent = Math.min(100, Math.round((wellnessScore / 100) * 100));
    motivationalMessage = 'Starting fresh! Log more offline activities to level up.';
  } else if (wellnessScore <= 300) {
    badgeName = 'Balanced 🌿';
    nextRankName = 'Wellness Master 🌳';
    badgePercent = Math.min(100, Math.round(((wellnessScore - 100) / 200) * 100));
    motivationalMessage = 'Great job maintaining balance! Focus on increasing offline habits and building streaks.';
  } else {
    badgeName = 'Wellness Master 🌳';
    nextRankName = 'Max Level';
    badgePercent = 100;
    motivationalMessage = 'Sensational focus! You are a master of offline balance. Maintain your zen.';
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-theme-primary animate-spin" />
        <p className="text-sm text-theme-text-sec">Loading your balance stats...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 fade-in text-left">
      {/* Welcome & Auto-refresh banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-theme-text m-0 p-0">
            Hello, {profile?.display_name || 'Champion'}!
          </h2>
          <p className="text-sm text-theme-text-sec m-0 mt-1">
            Let's maintain digital health today. Here is your balance report.
          </p>
        </div>

        <button
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-theme-text-sec border border-theme-border rounded-xl hover:bg-theme-card transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs text-theme-error font-medium">
          {error}
        </div>
      )}

      {/* Grid of Key Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Screen Time Card */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider">Screen Time</span>
            <div className="p-2.5 bg-red-500/10 text-theme-error rounded-xl">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-display text-theme-text">{todayScreenTime}</span>
            <span className="text-xs text-theme-text-sec">/ {screenLimit} min</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-theme-text-sec mb-1">
              <span>Limit usage</span>
              <span className={todayScreenTime > screenLimit ? 'text-theme-error font-bold' : ''}>{screenPercent}%</span>
            </div>
            <div className="w-full h-2 bg-theme-sec rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  todayScreenTime > screenLimit ? 'bg-theme-error' : 'bg-theme-warning'
                }`}
                style={{ width: `${screenPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Offline Time Card */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider">Offline Goals</span>
            <div className="p-2.5 bg-green-500/10 text-theme-success rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-display text-theme-text">{todayOfflineTime}</span>
            <span className="text-xs text-theme-text-sec">/ {offlineGoal} min</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-theme-text-sec mb-1">
              <span>Goal progress</span>
              <span className={todayOfflineTime >= offlineGoal ? 'text-theme-success font-bold' : ''}>{offlinePercent}%</span>
            </div>
            <div className="w-full h-2 bg-theme-sec rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-theme-success transition-all duration-500"
                style={{ width: `${offlinePercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 pulse-glow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider">Active Streak</span>
            <div className="p-2.5 bg-amber-500/10 text-theme-warning rounded-xl">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-display text-theme-text">{streak.current_streak}</span>
            <span className="text-xs text-theme-text-sec">days</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-theme-text-sec border-t border-theme-border pt-3">
            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-theme-warning" /> Personal best:</span>
            <span className="font-bold text-theme-text">{streak.longest_streak} days</span>
          </div>
        </div>

        {/* Wellness Score Card */}
        <div className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium card-hover transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-theme-text-sec uppercase tracking-wider">Wellness Score</span>
              <div className="p-2.5 bg-blue-500/10 text-theme-primary rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-extrabold font-display text-theme-text">{wellnessScore}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-primary">
                {badgeName}
              </span>
            </div>
            
            {/* Progress Bar towards Next Rank */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-theme-text-sec mb-1">
                <span>Next Rank: {nextRankName}</span>
                <span>{badgePercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sec rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-theme-primary transition-all duration-500"
                  style={{ width: `${badgePercent}%` }}
                ></div>
              </div>
              {/* Formula Breakdown */}
              <div className="flex justify-between text-[9px] text-theme-text-sec mt-2 border-t border-theme-border pt-1.5 leading-normal">
                <span>Offline: {totalOfflineMinutes}m</span>
                <span>Streak: +{streak.current_streak * 10}</span>
                <span>Screen: -{Math.round(totalScreenMinutes / 2)}m</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] leading-relaxed text-theme-text-sec italic font-medium pt-2 border-t border-theme-border">
            {motivationalMessage}
          </div>
        </div>
      </div>

      {/* Main Row layout: Quick actions + History list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick actions box */}
        <div className="lg:col-span-1 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-base font-bold font-display text-theme-text mb-1">
              Quick Actions
            </h3>
            <p className="text-xs text-theme-text-sec mb-6">
              Fast logging tools to register your daily actions.
            </p>

            <div className="flex flex-col gap-3">
              <Link 
                to="/log-screen"
                className="flex items-center justify-between p-3.5 rounded-xl border border-theme-border hover:border-theme-warning bg-theme-sec/30 hover:bg-theme-sec/50 transition-all duration-200 group text-left cursor-pointer hover:translate-x-0.5 premium-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-theme-warning/10 text-theme-warning rounded-lg transition-transform duration-300 group-hover:scale-105">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-theme-text">Log Screen Time</h4>
                    <p className="text-[10px] text-theme-text-sec">Record minutes spent on screens</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-theme-text-sec group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/log-offline"
                className="flex items-center justify-between p-3.5 rounded-xl border border-theme-border hover:border-theme-primary bg-theme-sec/30 hover:bg-theme-sec/50 transition-all duration-200 group text-left cursor-pointer hover:translate-x-0.5 premium-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-theme-primary/10 text-theme-primary rounded-lg transition-transform duration-300 group-hover:scale-105">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-theme-text">Log Offline Activity</h4>
                    <p className="text-[10px] text-theme-text-sec">Track reading, hiking, gym...</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-theme-text-sec group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/mood"
                className="flex items-center justify-between p-3.5 rounded-xl border border-theme-border hover:border-theme-secondary bg-theme-sec/30 hover:bg-theme-sec/50 transition-all duration-200 group text-left cursor-pointer hover:translate-x-0.5 premium-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-theme-secondary/10 text-theme-secondary rounded-lg transition-transform duration-300 group-hover:scale-105">
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-theme-text">Check-in Mood</h4>
                    <p className="text-[10px] text-theme-text-sec">Record how you're feeling</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-theme-text-sec group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-theme-border text-left">
            <h4 className="text-xs font-bold text-theme-text mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-theme-warning" /> Wellness Tip:
            </h4>
            <p className="text-[11px] text-theme-text-sec leading-relaxed">
              Every 20 minutes spent on a screen, look at an object 20 feet away for 20 seconds. Reclaim your focus.
            </p>
          </div>
        </div>

        {/* Today's log list */}
        <div className="lg:col-span-2 bg-theme-card border border-theme-border p-6 rounded-2xl shadow-premium flex flex-col justify-between card-hover">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold font-display text-theme-text">
                Today's Timeline
              </h3>
              <span className="text-xs text-theme-text-sec font-semibold bg-theme-sec px-2.5 py-1 rounded-full">
                {todayLogs.length} events logged
              </span>
            </div>

            {todayLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-theme-border animate-spin-slow"></div>
                  <div className="absolute w-14 h-14 rounded-full bg-theme-primary/5 border border-theme-primary/10"></div>
                  <div className="relative p-3.5 bg-theme-card border border-theme-border rounded-2xl shadow-md text-theme-text-sec">
                    <Clock className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm text-theme-text mb-1">
                  No activities logged today
                </h4>
                <p className="text-xs text-theme-text-sec max-w-xs mb-2 leading-relaxed">
                  Maintain self-awareness by logging your screen sessions or mindful offline achievements.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                {todayLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex justify-between items-start p-3.5 rounded-xl border border-theme-border hover:bg-theme-sec/45 transition text-left"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2 rounded-lg ${
                        log.log_type === 'screen' 
                          ? 'bg-red-500/10 text-theme-error' 
                          : 'bg-green-500/10 text-theme-success'
                      }`}>
                        {log.log_type === 'screen' ? <Monitor className="w-4.5 h-4.5" /> : <BookOpen className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-theme-text">
                          {log.log_type === 'screen' ? 'Screen usage logged' : 'Offline activity logged'}
                        </h4>
                        <p className="text-[11px] text-theme-text-sec mt-0.5 line-clamp-1">
                          {log.description || 'No description provided.'}
                        </p>
                        <span className="text-[9px] text-theme-text-sec block mt-1.5">
                          {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-bold ${
                        log.log_type === 'screen' ? 'text-theme-error' : 'text-theme-success'
                      }`}>
                        {log.log_type === 'screen' ? '-' : '+'}{log.duration_minutes} min
                      </span>
                      {log.log_type === 'offline' && (
                        <span className="text-[9px] font-bold text-theme-success bg-green-500/10 px-1.5 py-0.5 rounded-md">
                          +{log.duration_minutes * 2} XP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-right mt-6 border-t border-theme-border pt-4">
            <Link 
              to="/analytics" 
              className="text-xs font-bold text-theme-primary hover:text-theme-primary/80 inline-flex items-center gap-1 transition"
            >
              <span>View full analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
