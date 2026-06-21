'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, FileText, Download, Check } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    type: string;
    audience: string;
    is_important: boolean;
    attachment_url: string | null;
    attachment_name: string | null;
    created_at: string;
}

import { useRouter, usePathname } from 'next/navigation';

interface Announcement {
    id: string;
    created_at: string;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            
            if (data.announcements) {
                const lastSeen = localStorage.getItem('last_seen_announcements');
                if (!lastSeen) {
                    setUnreadCount(data.announcements.length);
                } else {
                    const lastSeenDate = new Date(lastSeen);
                    const unread = data.announcements.filter((a: Announcement) => new Date(a.created_at) > lastSeenDate);
                    setUnreadCount(unread.length);
                }
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        }
    };

    const handleClick = () => {
        // Mark as read when navigating
        localStorage.setItem('last_seen_announcements', new Date().toISOString());
        setUnreadCount(0);
        
        // Navigate based on current panel
        if (pathname.startsWith('/maintenance')) {
            router.push('/maintenance/announcements');
        } else {
            router.push('/student/announcements');
        }
    };

    return (
        <button 
            onClick={handleClick}
            style={{ 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            title="View Announcements"
        >
            <Bell size={20} />
            
            {unreadCount > 0 && (
                <div style={{
                    position: 'absolute', top: -2, right: -2, background: '#ef4444', color: 'white',
                    fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0B0E14'
                }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </div>
            )}
        </button>
    );
}
