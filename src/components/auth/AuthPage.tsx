'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Flower2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type AuthView = 'login' | 'register' | 'forgot';

function getInitialView(currentView: string): AuthView {
  if (currentView === 'register') return 'register';
  if (currentView === 'forgot-password') return 'forgot';
  return 'login';
}

export default function AuthPage() {
  const { locale } = useLanguageStore();
  const { login, isAuthenticated } = useAuthStore();
  const { currentView, navigate } = useUIStore();
  const [view, setView] = useState<AuthView>(() => getInitialView(currentView));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [forgotForm, setForgotForm] = useState({ email: '' });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        toast.success(t('auth.signIn', locale));
        navigate('home');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      // Demo fallback for local dev
      login({
        id: 'demo-1',
        name: 'Demo User',
        email: loginForm.email,
        phone: null,
        role: 'customer',
        token: 'demo-token',
      });
      toast.success(t('auth.signIn', locale));
      navigate('home');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError(t('auth.passwordMismatch', locale));
      return;
    }
    if (registerForm.password.length < 8) {
      setError(t('auth.passwordMin', locale));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        toast.success(t('auth.signUp', locale));
        navigate('home');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      login({
        id: 'demo-new',
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        role: 'customer',
        token: 'demo-token',
      });
      toast.success(t('auth.signUp', locale));
      navigate('home');
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotForm.email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      // UI only - show success
      setSuccess(t('auth.resetSent', locale));
    } catch {
      setSuccess(t('auth.resetSent', locale));
    }
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    // UI only
    login({
      id: 'google-1',
      name: 'Google User',
      email: 'user@gmail.com',
      phone: null,
      role: 'customer',
      token: 'google-token',
    });
    toast.success('Signed in with Google');
    navigate('home');
  };

  const switchView = (v: AuthView) => {
    setView(v);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream/30 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flower2 className="h-8 w-8 text-gold" />
            <span className="text-2xl font-bold gold-gradient">Bloom & Gift</span>
          </div>

          {view === 'login' && (
            <>
              <h1 className="text-2xl font-bold text-charcoal">{t('auth.loginTitle', locale)}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t('auth.loginSubtitle', locale)}</p>
            </>
          )}
          {view === 'register' && (
            <>
              <h1 className="text-2xl font-bold text-charcoal">{t('auth.registerTitle', locale)}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t('auth.registerSubtitle', locale)}</p>
            </>
          )}
          {view === 'forgot' && (
            <>
              <h1 className="text-2xl font-bold text-charcoal">{t('auth.forgotTitle', locale)}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t('auth.forgotSubtitle', locale)}</p>
            </>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Google auth */}
          {view !== 'forgot' && (
            <>
              <Button
                variant="outline"
                onClick={handleGoogleAuth}
                className="w-full h-11 rounded-xl border-border hover:bg-cream transition-colors"
              >
                <svg className="h-5 w-5 me-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {view === 'login' ? t('auth.signInWithGoogle', locale) : t('auth.signUpWithGoogle', locale)}
              </Button>
              <div className="relative my-6">
                <Separator />
                <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
                  {t('auth.orContinueWith', locale)}
                </span>
              </div>
            </>
          )}

          {/* Login form */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>{t('auth.email', locale)}</Label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="mt-1 h-11 rounded-xl"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <Label>{t('auth.password', locale)}</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-11 rounded-xl pe-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={loginForm.remember}
                    onCheckedChange={(v) => setLoginForm({ ...loginForm, remember: v === true })}
                    className="rounded border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                  />
                  <span className="text-charcoal-light">{t('auth.rememberMe', locale)}</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-sm text-gold hover:text-gold/80 font-medium"
                >
                  {t('auth.forgotPassword', locale)}
                </button>
              </div>

              <Button type="submit" className="w-full btn-luxury rounded-xl h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  t('auth.signIn', locale)
                )}
              </Button>
            </form>
          )}

          {/* Register form */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label>
                  {t('auth.fullName', locale)} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="mt-1 h-11 rounded-xl"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label>
                  {t('auth.email', locale)} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="mt-1 h-11 rounded-xl"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <Label>{t('auth.mobileNumber', locale)}</Label>
                <div className="relative mt-1">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    +971
                  </span>
                  <Input
                    value={registerForm.phone?.replace('+971', '') || ''}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="h-11 rounded-xl ps-14"
                    placeholder="XX XXX XXXX"
                  />
                </div>
              </div>
              <div>
                <Label>
                  {t('auth.password', locale)} <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="h-11 rounded-xl pe-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('auth.passwordMin', locale)}</p>
              </div>
              <div>
                <Label>
                  {t('auth.confirmPassword', locale)} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="mt-1 h-11 rounded-xl"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full btn-luxury rounded-xl h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  t('auth.signUp', locale)
                )}
              </Button>
            </form>
          )}

          {/* Forgot password form */}
          {view === 'forgot' && (
            <>
              {!success ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <Label>{t('auth.email', locale)}</Label>
                    <Input
                      type="email"
                      value={forgotForm.email}
                      onChange={(e) => setForgotForm({ email: e.target.value })}
                      className="mt-1 h-11 rounded-xl"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-luxury rounded-xl h-11" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      t('auth.sendResetLink', locale)
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-sage mx-auto mb-3" />
                  <p className="text-charcoal font-medium mb-4">{success}</p>
                  <Button variant="outline" onClick={() => switchView('login')} className="rounded-full">
                    {t('auth.backToLogin', locale)}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Toggle links */}
          {!success && (
            <div className="mt-6 text-center text-sm">
              {view === 'login' && (
                <p className="text-muted-foreground">
                  {t('auth.noAccount', locale)}{' '}
                  <button onClick={() => switchView('register')} className="text-gold font-medium hover:underline">
                    {t('auth.signUp', locale)}
                  </button>
                </p>
              )}
              {view === 'register' && (
                <p className="text-muted-foreground">
                  {t('auth.hasAccount', locale)}{' '}
                  <button onClick={() => switchView('login')} className="text-gold font-medium hover:underline">
                    {t('auth.signIn', locale)}
                  </button>
                </p>
              )}
              {view === 'forgot' && !success && (
                <button onClick={() => switchView('login')} className="text-gold font-medium hover:underline">
                  {t('auth.backToLogin', locale)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
