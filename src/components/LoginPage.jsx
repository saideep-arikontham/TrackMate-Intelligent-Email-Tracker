import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Shield, Zap, Sparkles, Lock, CheckCircle2, Sun, Moon } from 'lucide-react';
import Button from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import GoogleIcon from './icons/GoogleIcon';
import { useTheme } from './ThemeProvider';

const LoginPage = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await login(); // Redirects to Google OAuth via backend
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Theme toggle available on login screen */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 border border-white/30 dark:border-white/10 backdrop-blur transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          )}
        </button>
      </div>
      {/* vibrant gradient background + glow orbs */}
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-500/20 blur-3xl" />

      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
              TrackMate <Sparkles className="h-6 w-6 text-indigo-500" />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Intelligent email insights for busy professionals</p>
          </div>

          {/* Auth Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome back</CardTitle>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in with Google to continue</p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button onClick={handleGoogleLogin} disabled={loading} size="lg" className="w-full">
                {loading ? (
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                ) : (
                  <GoogleIcon className="mr-2 h-5 w-5" />
                )}
                Sign in with Google
              </Button>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Lock className="h-4 w-4 text-indigo-500" />
                  Secure OAuth2
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Zap className="h-4 w-4 text-fuchsia-500" />
                  Fast insights
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Gmail ready
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
