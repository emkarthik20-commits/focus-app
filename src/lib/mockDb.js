// UnPlugged Local Storage Mock Database Provider
// Simulates Supabase auth & tables with local storage persistence and mock historical data.

const MOCK_ACTIVITIES = [
  { id: 1, name: 'Reading', points_per_minute: 2, icon_name: 'BookOpen' },
  { id: 2, name: 'Exercise & Gym', points_per_minute: 3, icon_name: 'Dumbbell' },
  { id: 3, name: 'Meditating', points_per_minute: 3, icon_name: 'Smile' },
  { id: 4, name: 'Walking & Hiking', points_per_minute: 2, icon_name: 'Footprints' },
  { id: 5, name: 'Gardening', points_per_minute: 2, icon_name: 'Flower' },
  { id: 6, name: 'Cooking & Baking', points_per_minute: 1, icon_name: 'Utensils' },
  { id: 7, name: 'Playing Music', points_per_minute: 2, icon_name: 'Music' },
  { id: 8, name: 'Socializing', points_per_minute: 2, icon_name: 'Users' },
  { id: 9, name: 'Crafts & Art', points_per_minute: 2, icon_name: 'Palette' },
];

const getStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(`focus_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(`focus_${key}`, JSON.stringify(value));
};

// Initialize database stores
export const initMockDb = () => {
  if (!localStorage.getItem('focus_activities')) {
    setStorageItem('activities', MOCK_ACTIVITIES);
  }
  if (!localStorage.getItem('focus_users')) {
    setStorageItem('users', []);
  }
  if (!localStorage.getItem('focus_profiles')) {
    setStorageItem('profiles', {});
  }
  if (!localStorage.getItem('focus_daily_logs')) {
    setStorageItem('daily_logs', []);
  }
  if (!localStorage.getItem('focus_user_streaks')) {
    setStorageItem('user_streaks', {});
  }
  if (!localStorage.getItem('focus_mood_logs')) {
    setStorageItem('mood_logs', []);
  }
  if (!localStorage.getItem('focus_reminders')) {
    setStorageItem('reminders', []);
  }
};

// Auto initialize on load
initMockDb();

// Generate historical logging data for the past 7 days for a user to make the graphs look spectacular immediately.
const populateMockHistory = (userId) => {
  const dailyLogs = getStorageItem('daily_logs', []);
  
  // Check if user already has logs
  const userLogs = dailyLogs.filter(log => log.user_id === userId);
  if (userLogs.length > 0) return;

  const newLogs = [];
  const moodLogs = getStorageItem('mood_logs', []);
  const moods = ['Happy', 'Neutral', 'Focused', 'Stressed'];

  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Screen logs
    // Random screen duration between 60 and 240 minutes
    const screenDuration = Math.floor(Math.random() * 180) + 60;
    newLogs.push({
      id: `screen-mock-${userId}-${i}`,
      user_id: userId,
      log_type: 'screen',
      activity_id: null,
      duration_minutes: screenDuration,
      description: 'Used laptop for work and browsing social media.',
      logged_at: new Date(date.setHours(20, 0, 0, 0)).toISOString(),
    });

    // Offline logs
    // Random 1-2 offline logs per day
    const numOffline = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numOffline; j++) {
      const activity = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      const offlineDuration = Math.floor(Math.random() * 45) + 15;
      newLogs.push({
        id: `offline-mock-${userId}-${i}-${j}`,
        user_id: userId,
        log_type: 'offline',
        activity_id: activity.id,
        duration_minutes: offlineDuration,
        description: `Engaged in ${activity.name.toLowerCase()} activity.`,
        logged_at: new Date(date.setHours(12 + j * 3, 0, 0, 0)).toISOString(),
      });
    }

    // Mood logs
    moodLogs.push({
      id: `mood-mock-${userId}-${i}`,
      user_id: userId,
      mood: moods[Math.floor(Math.random() * moods.length)],
      logged_at: new Date(date.setHours(18, 0, 0, 0)).toISOString(),
    });
  }

  setStorageItem('daily_logs', [...dailyLogs, ...newLogs]);
  setStorageItem('mood_logs', moodLogs);
  
  // Set default initial reminders
  const reminders = getStorageItem('reminders', []);
  const userReminders = reminders.filter(r => r.user_id === userId);
  if (userReminders.length === 0) {
    const defaultReminders = [
      { id: `r1-${userId}`, user_id: userId, title: 'Screen limit check-in', reminder_time: '14:00', is_active: true },
      { id: `r2-${userId}`, user_id: userId, title: 'Evening digital detox time', reminder_time: '21:30', is_active: true },
      { id: `r3-${userId}`, user_id: userId, title: 'Afternoon stretch & water walk', reminder_time: '16:00', is_active: false },
    ];
    setStorageItem('reminders', [...reminders, ...defaultReminders]);
  }

  // Calculate streaks
  const streaks = getStorageItem('user_streaks', {});
  streaks[userId] = {
    user_id: userId,
    current_streak: 5,
    longest_streak: 8,
    last_completed_date: new Date().toISOString().split('T')[0]
  };
  setStorageItem('user_streaks', streaks);
};

export const mockAuth = {
  signUp: async (email, password, displayName) => {
    await new Promise((r) => setTimeout(r, 600)); // Simulating network latency
    const users = getStorageItem('users', []);
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = { id: `user-${Date.now()}`, email, password };
    users.push(newUser);
    setStorageItem('users', users);

    // Create Profile
    const profiles = getStorageItem('profiles', {});
    profiles[newUser.id] = {
      id: newUser.id,
      display_name: displayName || email.split('@')[0],
      daily_screen_limit: 120,
      daily_offline_goal: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStorageItem('profiles', profiles);

    // Create Streak
    const streaks = getStorageItem('user_streaks', {});
    streaks[newUser.id] = {
      user_id: newUser.id,
      current_streak: 0,
      longest_streak: 0,
      last_completed_date: null
    };
    setStorageItem('user_streaks', streaks);

    populateMockHistory(newUser.id);

    const session = { user: { id: newUser.id, email } };
    setStorageItem('session', session);
    return { data: session, error: null };
  },

  signIn: async (email, password) => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStorageItem('users', []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    populateMockHistory(user.id);

    const session = { user: { id: user.id, email } };
    setStorageItem('session', session);
    return { data: session, error: null };
  },

  signOut: async () => {
    localStorage.removeItem('focus_session');
    return { error: null };
  },

  getSession: () => {
    const session = getStorageItem('session', null);
    return { data: { session }, error: null };
  }
};

export const mockDb = {
  // Profiles
  getProfile: async (userId) => {
    const profiles = getStorageItem('profiles', {});
    return profiles[userId] || null;
  },
  
  updateProfile: async (userId, data) => {
    const profiles = getStorageItem('profiles', {});
    if (!profiles[userId]) throw new Error('Profile not found');
    profiles[userId] = { 
      ...profiles[userId], 
      ...data, 
      updated_at: new Date().toISOString() 
    };
    setStorageItem('profiles', profiles);
    return profiles[userId];
  },

  // Activities
  getActivities: async () => {
    return getStorageItem('activities', MOCK_ACTIVITIES);
  },

  // Daily Logs
  getDailyLogs: async (userId) => {
    const logs = getStorageItem('daily_logs', []);
    return logs.filter(log => log.user_id === userId);
  },

  addDailyLog: async (userId, data) => {
    const logs = getStorageItem('daily_logs', []);
    const newLog = {
      id: `log-${Date.now()}`,
      user_id: userId,
      log_type: data.log_type,
      activity_id: data.activity_id || null,
      duration_minutes: parseInt(data.duration_minutes, 10),
      description: data.description || '',
      logged_at: new Date().toISOString(),
    };
    logs.push(newLog);
    setStorageItem('daily_logs', logs);

    // Update streak if offline goal is met for today
    if (data.log_type === 'offline') {
      await mockDb.recalculateStreaks(userId);
    }

    return newLog;
  },

  // Streaks calculation logic
  recalculateStreaks: async (userId) => {
    const logs = getStorageItem('daily_logs', []);
    const profiles = getStorageItem('profiles', {});
    const userProfile = profiles[userId];
    if (!userProfile) return;

    const offlineGoal = userProfile.daily_offline_goal || 60;
    
    // Group offline logs by date
    const offlineLogs = logs.filter(log => log.user_id === userId && log.log_type === 'offline');
    const logsByDate = {};
    offlineLogs.forEach(log => {
      const dateStr = log.logged_at.split('T')[0];
      logsByDate[dateStr] = (logsByDate[dateStr] || 0) + log.duration_minutes;
    });

    // Sort dates descending
    const dates = Object.keys(logsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if offline goal met today/yesterday to continue streak
    const hasGoalToday = (logsByDate[today] || 0) >= offlineGoal;
    const hasGoalYesterday = (logsByDate[yesterdayStr] || 0) >= offlineGoal;

    if (hasGoalToday || hasGoalYesterday) {
      // Calculate current streak backwards from the latest date that met the goal
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

    // Calculate longest streak historically
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
        
        // Check if next day exists and is consecutive. If not, break temp streak
        if (nextDateStr) {
          const d1 = new Date(dateStr);
          const d2 = new Date(nextDateStr);
          const diffTime = Math.abs(d2 - d1);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            tempStreak = 0;
          }
        }
      } else {
        tempStreak = 0;
      }
    }

    const streaks = getStorageItem('user_streaks', {});
    const previous = streaks[userId] || { longest_streak: 0 };
    streaks[userId] = {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: Math.max(longestStreak, previous.longest_streak || 0, currentStreak),
      last_completed_date: currentStreak > 0 ? (hasGoalToday ? today : yesterdayStr) : (previous.last_completed_date || null)
    };
    setStorageItem('user_streaks', streaks);
  },

  getStreak: async (userId) => {
    const streaks = getStorageItem('user_streaks', {});
    return streaks[userId] || { user_id: userId, current_streak: 0, longest_streak: 0, last_completed_date: null };
  },

  // Mood Logs
  getMoodLogs: async (userId) => {
    const logs = getStorageItem('mood_logs', []);
    return logs.filter(log => log.user_id === userId);
  },

  addMoodLog: async (userId, mood) => {
    const logs = getStorageItem('mood_logs', []);
    const newLog = {
      id: `mood-${Date.now()}`,
      user_id: userId,
      mood,
      logged_at: new Date().toISOString(),
    };
    logs.push(newLog);
    setStorageItem('mood_logs', logs);
    return newLog;
  },

  // Reminders
  getReminders: async (userId) => {
    const reminders = getStorageItem('reminders', []);
    return reminders.filter(r => r.user_id === userId);
  },

  addReminder: async (userId, data) => {
    const reminders = getStorageItem('reminders', []);
    const newReminder = {
      id: `rem-${Date.now()}`,
      user_id: userId,
      title: data.title,
      reminder_time: data.reminder_time,
      is_active: true,
    };
    reminders.push(newReminder);
    setStorageItem('reminders', reminders);
    return newReminder;
  },

  updateReminder: async (reminderId, data) => {
    const reminders = getStorageItem('reminders', []);
    const idx = reminders.findIndex(r => r.id === reminderId);
    if (idx === -1) throw new Error('Reminder not found');
    reminders[idx] = { ...reminders[idx], ...data };
    setStorageItem('reminders', reminders);
    return reminders[idx];
  },

  deleteReminder: async (reminderId) => {
    const reminders = getStorageItem('reminders', []);
    const filtered = reminders.filter(r => r.id !== reminderId);
    setStorageItem('reminders', filtered);
    return true;
  }
};
