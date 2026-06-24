'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react';
import PremiumBackground from '../components/PremiumBackground';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password: password.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
            if (data.user.role === 'ADMIN') window.location.href = '/admin/dashboard';
            else if (data.user.role === 'STUDENT') window.location.href = '/student/dashboard';
            else if (data.user.role === 'MAINTENANCE') window.location.href = '/maintenance/dashboard';
            else window.location.href = '/faculty/dashboard';
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setResetMessage(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to send reset email'); }
            else { setResetMessage(data.message); }
        } catch { setError('Network error. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="login-container">
            <PremiumBackground />
            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">
                        {isResetMode ? <KeyRound size={28} color="white" /> : <Shield size={28} color="white" />}
                    </div>
                    <h1>{isResetMode ? 'Reset Password' : 'Campus Pulse'}</h1>
                    {!isResetMode && (
                        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Sparkles size={14} /> Campus Infrastructure Management System <Sparkles size={14} />
                        </p>
                    )}
                </div>

                <div style={{ width: '60%', height: 1, margin: '0 auto 28px', background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)', opacity: 0.4 }} />

                {error && <div className="error-message">{error}</div>}

                {isResetMode ? (
                    <form onSubmit={handleForgotSubmit}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Enter your email and we will send a secure reset link.
                        </p>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input type="email" className="form-input" style={{ paddingLeft: 40 }} placeholder="Enter your registered email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                            </div>
                        </div>
                        {resetMessage && (
                            <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '22px', marginBottom: '8px' }}>📬</div>
                                <p style={{ color: '#10b981', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{resetMessage}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '8px 0 0' }}>Check your spam folder if you don&apos;t see it.</p>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={loading || !!resetMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '16px' }}>
                            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Sending...</> : 'Send Reset Link'}
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => { setIsResetMode(false); setError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '8px' }}>
                                Back to Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input type="email" className="form-input" style={{ paddingLeft: 40 }} placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ marginBottom: 0 }}>Password</label>
                                <button type="button" onClick={() => { setIsResetMode(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Forgot Password?</button>
                            </div>
                            <div style={{ position: 'relative', marginTop: '8px' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input type={showPassword ? "text" : "password"} className="form-input" style={{ paddingLeft: 40, paddingRight: 40 }} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <a href="/about" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Shield size={12} /> About this Project
                    </a>
                </div>
            </div>
        </div>
    );
}
