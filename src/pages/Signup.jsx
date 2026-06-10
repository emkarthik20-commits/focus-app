import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { useToast } from '../components/Toast';
import { UserPlus, Mail, Lock, User, Loader2, Info } from 'lucide-react';

export default function Signup() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: signUpError, sessionCreated } = await signUp(email, password, displayName);

    if (signUpError) {
      setError(signUpError);
      showToast(signUpError, 'error');
      setLoading(false);
    } else {
      if (sessionCreated) {
        showToast('Account created! Welcome to Focus.', 'success');
        navigate('/');
      } else {
        showToast('Registration successful! Please check your email for confirmation.', 'success', 6000);
        navigate('/login');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 fade-in text-left">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-display text-theme-text m-0 p-0">
          Join Focus
        </h1>
        <p className="text-sm text-theme-text-sec">
          Begin your journey to digital balance and mindful living.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-xs font-medium text-theme-error flex items-start gap-2.5">
          <Info className="w-4 h-4 text-theme-error flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-theme-text-sec">
            Display Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-4.5 w-4.5 text-theme-text-sec" />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Mindful"
              className="w-full pl-10 pr-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={loading}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-theme-text-sec">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4.5 w-4.5 text-theme-text-sec" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-theme-text-sec">
            Password (min 6 chars)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4.5 w-4.5 text-theme-text-sec" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={loading}
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-theme-text-sec">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4.5 w-4.5 text-theme-text-sec" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-sec text-theme-text transition premium-input-focus"
              disabled={loading}
            />
          </div>
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-theme-primary/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] premium-btn cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4.5 h-4.5" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-theme-text-sec">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-theme-primary hover:underline"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
