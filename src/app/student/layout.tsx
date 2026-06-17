'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Users, User, Info, LogOut, Shield } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                if (data.user) setUser({ ...data.user, student: data.student });
                else router.push('/login');
            })
            .catch(() => router.push('/login'));
    }, [router]);

    const navItems = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Campus Issues', path: '/student/complaints', icon: AlertTriangle },
        { name: 'Student Directory', path: '/student/directory', icon: Users },
        { name: 'My Profile', path: '/student/profile', icon: User },
        { name: 'About Project', path: '/about', icon: Info },
    ];

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div style={{
                width: 260,
                background: '#0B0E14', // Match the dark panel background
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0'
            }}>
                {/* Logo */}
                <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                    <div style={{ background: '#10b981', padding: 8, borderRadius: 8, display: 'flex' }}>
                        <Shield size={20} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 16, color: 'white', fontWeight: 700 }}>CampusNiti</h2>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>STUDENT PANEL</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(item => {
                        const active = pathname === item.path || pathname.startsWith(item.path + '/');
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.path)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 24px', width: '100%',
                                    background: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    color: active ? '#10b981' : 'rgba(255,255,255,0.6)',
                                    border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid',
                                    borderLeftColor: active ? '#10b981' : 'transparent',
                                    cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s', fontSize: 14, fontWeight: 500
                                }}
                            >
                                <item.icon size={18} /> {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Sign Out */}
                <div style={{ padding: '0 16px' }}>
                    <div style={{
                        padding: 12, background: 'rgba(255,255,255,0.03)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 16
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#10b981', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: 14
                        }}>
                            {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                {user.student?.roll_number || 'Student'}
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            router.push('/login');
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '8px 12px', width: '100%',
                            background: 'transparent', color: 'rgba(255,255,255,0.5)',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                            fontSize: 14, transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-primary)' }}>
                {children}
            </div>
        </div>
    );
}
