'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users, UserCheck, AlertTriangle, PenTool, 
    Building2, FileDigit, Megaphone, QrCode, LineChart, 
    FileKey, Info, LogOut, Shield
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState<{ id: string; title: string; zone: string } | null>(null);

    useEffect(() => {
        let subscription: any;

        fetch('/api/auth/me')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(async data => {
                if (data.user && data.user.role === 'ADMIN') {
                    setUser(data.user);
                    // Dynamically import supabaseClient to subscribe client-side
                    const { supabaseClient } = await import('@/lib/supabase');
                    subscription = supabaseClient
                        .channel('admin-complaints')
                        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, payload => {
                            if (payload.new.status === 'PENDING_REVIEW') {
                                setToastMsg({
                                    id: payload.new.id,
                                    title: payload.new.title,
                                    zone: payload.new.zone || 'Unknown Zone'
                                });
                                // Auto dismiss after 8s
                                setTimeout(() => setToastMsg(null), 8000);
                            }
                        })
                        .subscribe();
                }
                else router.push('/login');
            })
            .catch(() => router.push('/login'));
            
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [router]);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Campus Issues', path: '/admin/complaints', icon: PenTool },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
        { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { name: 'Audit Log', path: '/admin/audit', icon: FileKey },
        { name: 'About Project', path: '/admin/about', icon: Info },
    ];

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090a0f' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#090a0f', color: 'white' }}>
            {/* Sidebar */}
            <div style={{
                width: 260,
                background: '#13151A',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                height: '100vh',
                overflowY: 'auto'
            }}>
                {/* Logo */}
                <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <div style={{ background: '#f59e0b', padding: 8, borderRadius: 8, display: 'flex' }}>
                        <Shield size={20} color="black" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 16, color: 'white', fontWeight: 700 }}>NITJ Final Project</h2>
                        <span style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 1, fontWeight: 600 }}>ADMIN PANEL</span>
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
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 24px', width: '100%',
                                    background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                    color: active ? '#f59e0b' : 'rgba(255,255,255,0.6)',
                                    border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid',
                                    borderLeftColor: active ? '#f59e0b' : 'transparent',
                                    cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s', fontSize: 14, fontWeight: 500
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <item.icon size={18} /> {item.name}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Sign Out */}
                <div style={{ padding: '0 16px', marginTop: 24 }}>
                    <div style={{
                        padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 16
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#f59e0b', color: 'black',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: 14
                        }}>
                            GA
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Gabbar Admin
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
                                ADMINISTRATOR
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: '#090a0f', position: 'relative' }}>
                {children}

                {/* Real-time Toast Popup */}
                {toastMsg && (
                    <div style={{
                        position: 'fixed', bottom: 32, right: 32, width: 340,
                        background: '#13151A', border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: 16, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.3s ease-out forwards', zIndex: 9999
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', padding: 8, borderRadius: 12 }}>
                                <AlertTriangle size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: 'white' }}>New Issue Reported</h4>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                                    <strong>{toastMsg.zone.replace('_', ' ')}:</strong> {toastMsg.title.substring(0, 40)}...
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        onClick={() => {
                                            router.push(`/admin/complaints/${toastMsg.id}`);
                                            setToastMsg(null);
                                        }}
                                        style={{ flex: 1, background: '#f59e0b', color: 'black', border: 'none', padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Review Now
                                    </button>
                                    <button 
                                        onClick={() => setToastMsg(null)}
                                        style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                        <style>{`
                            @keyframes slideUp {
                                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
}
