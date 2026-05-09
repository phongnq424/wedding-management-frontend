import { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    isLoading: boolean;
    error: string | null;
    loginError: string | null;
    onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    loginError,
    onSubmit,
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9f7f4] via-[#faf8f5] to-[#f5f2ed] p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a961] to-[#b89851] mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-semibold text-primary mb-2">Wedding Center</h1>
                    <p className="text-muted-foreground">Management System</p>
                </div>

                <div className="bg-card rounded-[24px] shadow-lg p-8 border border-border">
                    <h2 className="text-2xl font-semibold text-primary mb-6">Sign In</h2>

                    {(loginError || error) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{loginError || error}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="your.email@wedding.vn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-accent hover:text-accent/80 transition-colors" disabled={isLoading}>
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-xs text-center text-muted-foreground">
                            Authorized access only. All activities are monitored and logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
