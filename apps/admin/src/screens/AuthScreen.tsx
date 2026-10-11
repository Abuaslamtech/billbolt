import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import billboltSymbol from '../assets/svg/billbolt_symbol.svg';
import { apiClient, saveTokens, saveStoredUser } from '../lib/apiClient';
import { Button } from '../components/Elements/Button';

export interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiClient.post('/auth/email/login', {
        email: email.trim(),
        password,
      });

      if (data?.accessToken) {
        saveTokens(data.accessToken, data.refreshToken);
        if (data.user) {
          saveStoredUser(data.user);
        }
        onLoginSuccess();
      } else {
        throw new Error('Authentication succeeded but no access token was returned.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Unable to sign in. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bolt-surface flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-bolt-border rounded-2xl p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={billboltSymbol}
            alt="Billbolt Logo"
            className="w-16 h-16 rounded-2xl shadow-xs object-contain mb-4"
          />
          <h1 className="font-poppins font-bold text-2xl text-bolt-graphite tracking-tight">
            Billbolt Admin
          </h1>
          <p className="text-xs text-bolt-slate font-medium mt-1">
            Sign in with your administrator account to access live data
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-bolt-danger-bg border border-bolt-danger-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-bolt-danger-text flex-shrink-0 mt-0.5" />
            <p className="text-xs text-bolt-danger-text font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bolt-slate mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-bolt-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-bolt-surface border border-bolt-border text-bolt-graphite placeholder:text-bolt-slate/70 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bolt-slate mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bolt-slate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-bolt-surface border border-bolt-border text-bolt-graphite placeholder:text-bolt-slate/70 focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full mt-2"
            icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
          </Button>
        </form>
      </div>
    </div>
  );
};
