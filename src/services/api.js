import { supabase } from '../lib/supabase';

export const api = {
  // Profiles
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  updateProfile: async (userId, updateData) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Activities
  getActivities: async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Daily Logs
  getDailyLogs: async (userId) => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addDailyLog: async (userId, logData) => {
    const formattedData = {
      user_id: userId,
      log_type: logData.log_type,
      activity_id: logData.activity_id ? parseInt(logData.activity_id, 10) : null,
      duration_minutes: parseInt(logData.duration_minutes, 10),
      description: logData.description || '',
      logged_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('daily_logs')
      .insert(formattedData)
      .select()
      .single();

    if (error) throw error;

    // Recalculate streak asynchronously in Supabase
    if (logData.log_type === 'offline') {
      try {
        await api.recalculateStreaks(userId);
      } catch (err) {
        console.error('Failed to recalculate streak in live Supabase mode:', err);
      }
    }

    return data;
  },

  // Streaks
  getStreak: async (userId) => {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data || { user_id: userId, current_streak: 0, longest_streak: 0, last_completed_date: null };
  },

  recalculateStreaks: async (userId) => {
    // Get user profile (to know the daily offline goal)
    const profile = await api.getProfile(userId);
    const offlineGoal = profile?.daily_offline_goal || 60;

    // Get all offline logs for user
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_type', 'offline');

    if (error) throw error;

    // Process logs by date
    const logsByDate = {};
    logs.forEach(log => {
      const dateStr = log.logged_at.split('T')[0];
      logsByDate[dateStr] = (logsByDate[dateStr] || 0) + log.duration_minutes;
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasGoalToday = (logsByDate[today] || 0) >= offlineGoal;
    const hasGoalYesterday = (logsByDate[yesterdayStr] || 0) >= offlineGoal;

    let currentStreak = 0;
    if (hasGoalToday || hasGoalYesterday) {
      let checkDate = hasGoalToday ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if ((logsByDate[checkStr] || 0) >= offlineGoal) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allUniqueDates = Object.keys(logsByDate).sort((a, b) => new Date(a) - new Date(b));
    
    for (let i = 0; i < allUniqueDates.length; i++) {
      const dateStr = allUniqueDates[i];
      const nextDateStr = allUniqueDates[i + 1];

      if (logsByDate[dateStr] >= offlineGoal) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        
        if (nextDateStr) {
          const d1 = new Date(dateStr);
          const d2 = new Date(nextDateStr);
          const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            tempStreak = 0;
          }
        }
      } else {
        tempStreak = 0;
      }
    }

    // Get current streak record
    const { data: currentStreakRecord } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const finalLongest = Math.max(longestStreak, currentStreakRecord?.longest_streak || 0, currentStreak);
    const lastCompleted = currentStreak > 0 ? (hasGoalToday ? today : yesterdayStr) : (currentStreakRecord?.last_completed_date || null);

    const { data: updatedStreak, error: streakError } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: finalLongest,
        last_completed_date: lastCompleted
      })
      .select()
      .single();

    if (streakError) throw streakError;
    return updatedStreak;
  },

  // Mood Logs
  getMoodLogs: async (userId) => {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addMoodLog: async (userId, mood) => {
    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ user_id: userId, mood })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reminders
  getReminders: async (userId) => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  addReminder: async (userId, reminderData) => {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        title: reminderData.title,
        reminder_time: reminderData.reminder_time,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateReminder: async (reminderId, updateData) => {
    const { data, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteReminder: async (reminderId) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
    return true;
  }
};
