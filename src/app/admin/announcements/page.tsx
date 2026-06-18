'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'GENERAL', content: '' });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/announcements');
            const data = await res.json();
            setAnnouncements(data.announcements || []);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', type: 'GENERAL', content: '' });
                fetchAnnouncements();
            }
        } catch (err) {}
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAnnouncements();
        } catch (err) {}
    };

    const getColor = (type: string) => {
        if (type === 'ACADEMIC') return '#f59e0b';
        if (type === 'EVENTS') return '#8b5cf6';
        if (type === 'ALERTS') return '#ef4444';
        return '#3b82f6';
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Megaphone size={32} />
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0' }}>Announcements</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
                            Create and manage system-wide announcements
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ 
                        background: '#8b5cf6', color: 'white', border: 'none', 
                        padding: '12px 24px', flex: '1 1 200px', maxWidth: 400, borderRadius: 8, fontSize: 14, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> New Announcement
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {announcements.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: '#13151a', borderRadius: 12 }}>
                            No announcements yet.
                        </div>
                    ) : announcements.map(ann => (
                        <div key={ann.id} style={{ 
                            background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', 
                            borderLeft: `4px solid ${getColor(ann.zone)}`, borderRadius: 12, padding: 24,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}>
                            <div style={{ flex: 1, paddingRight: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{ann.title}</h3>
                                    <div style={{ 
                                        background: `rgba(${hexToRgb(getColor(ann.zone))}, 0.1)`, color: getColor(ann.zone), 
                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, letterSpacing: 0.5 
                                    }}>
                                        {ann.zone}
                                    </div>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>
                                    By Admin • {new Date(ann.created_at).toLocaleDateString()}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                                    {ann.description}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button 
                                    onClick={() => handleDelete(ann.id)}
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: 36, height: 36, 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: '#ef4444', cursor: 'pointer' 
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 500, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ margin: 0, fontSize: 20 }}>New Announcement</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>TITLE</label>
                                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 12, borderRadius: 8 }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>TYPE</label>
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 12, borderRadius: 8 }}>
                                    <option value="GENERAL">General</option>
                                    <option value="ACADEMIC">Academic</option>
                                    <option value="EVENTS">Events</option>
                                    <option value="ALERTS">Alerts</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>CONTENT</label>
                                <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 12, borderRadius: 8 }} />
                            </div>
                            <button type="submit" style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                                Publish Announcement
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
