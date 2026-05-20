'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/admin/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3 border border-outline-variant">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Türkiye Diyanet Vakfı</h1>
          <p className="text-on-surface-variant text-sm mt-1">Admin Portal Login</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="superadmin@deyaanat.org"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            {error && (
              <div className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</div>
            )}
            <Button type="submit" loading={loading} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-on-surface-variant mt-4">
          <Link href="/" className="hover:text-primary transition-colors">&larr; Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
