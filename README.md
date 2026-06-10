# Focus - Build Better Digital Habits

**Focus** is a modern, responsive digital wellness application designed to help users monitor and reduce their screen time while building healthy, offline habits. 

Built using React, Vite, Tailwind CSS v4, React Router, Lucide Icons, Recharts, and Supabase.

## Features

- **Dashboard**: Track daily screen usage vs limits, and offline minutes vs goals in real time.
- **Wellness Score & Progression**: Tracks overall balances using a dynamic formula: `Offline Minutes + (Streak * 10) - (Screen Time / 2)` and unlocks badges: *Beginner 🌱*, *Balanced 🌿*, and *Wellness Master 🌳*.
- **Logging Forms**: Seamlessly record daily screen sessions and offline wellness activities (Read, Gym, Meditate, etc.).
- **Mood Tracker**: Monitor mental state patterns (Happy, Focused, Neutral, Stressed).
- **Reminders**: Complete CRUD scheduler for custom stepping-away notifications.
- **Analytics**: Beautiful Recharts visualization charts detailing daily trends, weekly totals, and mood correlations.
- **Settings**: Fully customizable daily limits and profile attributes.

## Tech Stack
- **Frontend**: React (with Context State Management), Vite, Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide Icons
- **Backend Database & Auth**: Supabase

## Setup Instructions

1. **Environment Variables**: Configure a `.env` file in the root folder:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

2. **Database Schema**: Execute [schema.sql](./schema.sql) in your Supabase SQL editor to deploy tables, row level security policies, triggers, and seed data.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
