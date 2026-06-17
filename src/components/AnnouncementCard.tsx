'use client';

import { Bell } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    isUrgent: boolean;
    createdAt: string;
    author: { name: string };
}

interface Props {
    announcements: Announcement[];
}

export default function AnnouncementCard({ announcements }: Props) {
    if (!announcements || announcements.length === 0) {
        return (
            <div>
                <div className="card-header">
                    <h2><Bell size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Announcements</h2>
                </div>
                <div className="card-body">
                    <p style={{ color: 'var(--text-muted)' }}>No announcements available.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="card-header">
                <h2><Bell size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Announcements</h2>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {announcements.map(a => (
                        <div key={a.id} style={{
                            padding: '16px',
                            background: a.isUrgent ? 'rgba(244, 63, 94, 0.05)' : 'var(--bg-glass)',
                            border: `1px solid ${a.isUrgent ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: a.isUrgent ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                                    {a.isPinned && '📌 '} {a.title}
                                </h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {new Date(a.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                                {a.content}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px' }}>
                                    {a.category}
                                </span>
                                <span>Posted by {a.author?.name || 'Admin'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
