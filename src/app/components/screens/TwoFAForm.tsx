import { Sparkles } from 'lucide-react';

interface TwoFAFormProps {
    twoFACode: string;
    setTwoFACode: (code: string) => void;
    isLoading: boolean;
    error: string | null;
    loginError: string | null;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

export function TwoFAForm({
    twoFACode,
    setTwoFACode,
    isLoading,
    error,
    loginError,
    onSubmit,
    onBack,
}: TwoFAFormProps) {
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
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                        Two-Factor Authentication
                    </h2>

                    <p className="text-sm text-muted-foreground mb-6">
                        Enter the 6-digit code sent to your email.
                    </p>

                    {(loginError || error) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{loginError || error}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Verification Code <span className="text-destructive">*</span>
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                placeholder="000000"
                                maxLength={6}
                                value={twoFACode}
                                onChange={(e) =>
                                    setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                }
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all text-center text-2xl tracking-widest font-mono disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={isLoading}
                                className="flex-1 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-secondary transition-all disabled:opacity-50"
                            >
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading || twoFACode.length !== 6}
                                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border">
                        <button
                            type="button"
                            className="text-sm text-accent hover:text-accent/80 transition-colors w-full text-center"
                            disabled={isLoading}
                        >
                            Having trouble? Contact administrator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}