import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isSignUp) {
                // Sign Up
                const { data, error } = await authClient.signUp.email({
                    email,
                    password,
                    name: name || email.split('@')[0],
                });

                if (error) {
                    setError(error.message || 'Sign up failed');
                } else {
                    setSuccess('Account created successfully! You can now sign in.');
                    setIsSignUp(false);
                    setName('');
                    setPassword('');
                }
            } else {
                // Sign In
                const { data, error } = await authClient.signIn.email({
                    email,
                    password,
                });

                if (error) {
                    setError(error.message || 'Login failed');
                } else {
                    navigate('/admin');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-primary-foreground/80">
                        {isSignUp ? 'Sign up to get started' : 'Sign in to manage your empire'}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center text-sm">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        {isSignUp && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </div>
                            {isSignUp && (
                                <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg shadow-primary/30 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

