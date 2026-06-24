'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Info, LogOut, Wrench, ClipboardList, User } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => { if (!r.ok) throw new Error('Not logged in'); return r.json(); });

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const { data: authData, error } = useSWR('/api/auth/me', fetcher);

    useEffect(() => {
        if (error) {
            router.push('/login');
        } else if (authData) {
            if (authData.user) {
                setUser(authData.user);
            } else {
                router.push('/login');
            }
        }
    }, [authData, error, router]);

    const navItems = [
        { name: 'My Queue', path: '/maintenance/dashboard', icon: ClipboardList },
        { name: 'Resolved History', path: '/maintenance/history', icon: CheckSquare },
        { name: 'My Profile', path: '/maintenance/profile', icon: User },
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
        <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div className="sidebar maintenance-sidebar" style={{
                width: 260,
                background: '#0B0E14', // Match the dark panel background
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0'
            }}>
                {/* Logo */}
                <div className="sidebar-logo" style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                    <div style={{ background: '#06b6d4', padding: 8, borderRadius: 8, display: 'flex' }}>
                        <Wrench size={20} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 16, color: 'white', fontWeight: 700 }}>Campus Pulse</h2>
                        <span style={{ fontSize: 10, color: '#06b6d4', letterSpacing: 1, fontWeight: 600 }}>MAINTENANCE PANEL</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(item => {
                        const active = pathname === item.path || pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`nav-link ${active ? 'maintenance-active active' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 24px', width: '100%',
                                    background: active ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                    color: active ? '#06b6d4' : 'rgba(255,255,255,0.6)',
                                    borderLeftWidth: 3, borderLeftStyle: 'solid',
                                    borderLeftColor: active ? '#06b6d4' : 'transparent',
                                    textDecoration: 'none', textAlign: 'left',
                                    transition: 'all 0.2s', fontSize: 14, fontWeight: 500
                                }}
                            >
                                <item.icon size={18} /> {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Sign Out */}
                <div className="sidebar-footer" style={{ padding: '0 16px' }}>
                    <div style={{
                        padding: 12, background: 'rgba(255,255,255,0.03)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 16
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#06b6d4', color: 'white',
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
                                {user.role || 'Staff'}
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
            <div className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-primary)' }}>
                {children}
            </div>
        </div>
    );
}
