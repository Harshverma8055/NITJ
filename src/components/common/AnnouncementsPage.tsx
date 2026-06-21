'use client';

import { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, FileText, Download, Clock } from 'lucide-react';

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

export default function AnnouncementsPage({ title, role }: { title: string, role: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
        // Clear unread badge
        localStorage.setItem('last_seen_announcements', new Date().toISOString());
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            
            if (data.announcements) {
                setAnnouncements(data.announcements);
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (type: string) => {
        if (type === 'ACADEMIC') return '#f59e0b';
        if (type === 'EVENTS') return '#8b5cf6';
        if (type === 'ALERTS') return '#ef4444';
        if (type === 'MAINTENANCE') return '#06b6d4';
        return '#3b82f6';
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 12, borderRadius: 12, color: '#3b82f6' }}>
                    <Megaphone size={28} />
                </div>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px 0' }}>{title}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 15 }}>
                        Stay updated with the latest campus news and alerts.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {announcements.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: '#13151a', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Megaphone size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.7)' }}>No announcements yet</h3>
                        <p style={{ margin: 0, fontSize: 14 }}>You're all caught up!</p>
                    </div>
                ) : announcements.map(ann => (
                    <div key={ann.id} style={{ 
                        background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', 
                        borderLeft: `4px solid ${getColor(ann.type)}`, borderRadius: 16, padding: 28,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                            {ann.is_important && (
                                <div style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <AlertCircle size={14} /> IMPORTANT
                                </div>
                            )}
                            
                            <div style={{ 
                                background: `rgba(255,255,255,0.05)`, color: getColor(ann.type), 
                                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: 0.5 
                            }}>
                                {ann.type}
                            </div>
                            
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={14} />
                                {new Date(ann.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </div>
                        </div>
                        
                        <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600, color: 'white', lineHeight: 1.4 }}>{ann.title}</h2>
                        
                        <p style={{ margin: '0 0 20px 0', fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {ann.content}
                        </p>
                        
                        {ann.attachment_url && (
                            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <a 
                                    href={ann.attachment_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                        padding: '10px 20px', borderRadius: 8, color: '#60a5fa', textDecoration: 'none',
                                        fontSize: 14, fontWeight: 600, transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                >
                                    <FileText size={18} /> 
                                    {ann.attachment_name || 'Download Attachment'} 
                                    <Download size={16} style={{ marginLeft: 8 }} />
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
