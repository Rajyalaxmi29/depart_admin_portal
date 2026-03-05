import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginPromise = login(email, password);
      const timeoutPromise = new Promise<false>((resolve) =>
        setTimeout(() => {
          resolve(false);
        }, 30000)
      );

      const success = await Promise.race([loginPromise, timeoutPromise]);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-600 to-blue-500 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <img
              src="/icon.jpeg"
              alt="inCamp icon"
              className="w-32 h-32 rounded-lg object-contain"
            />
            <h1 className="text-5xl font-bold text-white">inCamp</h1>
          </div>
          <p className="text-white text-lg text-center max-w-xs">
            Turning campus challenges into countable change through innovation and entrepreneurship.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <img
              src="/icon.jpeg"
              alt="inCamp icon"
              className="w-20 h-20 rounded-lg mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold text-blue-600">inCamp</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col items-center mb-8">
              <img
                src="/icon.jpeg"
                alt="Welcome icon"
                className="w-24 h-24 rounded-full mb-4 object-contain"
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 text-sm mt-2">
                Sign in to access your department dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-blue-50 border border-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-blue-50 border border-blue-200"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Role: <span className="font-semibold text-gray-900">Department Admin</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">© 2026 inCamp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
