'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, X, AlertCircle, Paperclip, FileText, Download } from 'lucide-react';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnnouncementsPage() {
    const { data, error, isLoading: loading, mutate: fetchAnnouncements } = useSWR('/api/admin/announcements', fetcher, {
        keepPreviousData: true
    });
    const announcements = data?.announcements || [];

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        title: '', 
        type: 'GENERAL', 
        audience: 'ALL',
        is_important: false,
        content: '',
        attachment: null as File | null
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            let attachmentUrl = null;
            let attachmentName = null;
            
            // 1. Upload attachment if present
            if (formData.attachment) {
                const uploadData = new FormData();
                uploadData.append('file', formData.attachment);
                uploadData.append('bucket', 'announcements');
                
                const uploadRes = await fetch('/api/complaints/upload', {
                    method: 'POST',
                    body: uploadData
                });
                
                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    attachmentUrl = uploadResult.signedUrl || uploadResult.storagePath;
                    attachmentName = formData.attachment.name;
                } else {
                    alert('Failed to upload attachment.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // 2. Create Announcement
            const payload = {
                title: formData.title,
                type: formData.type,
                audience: formData.audience,
                is_important: formData.is_important,
                content: formData.content,
                attachment_url: attachmentUrl,
                attachment_name: attachmentName
            };

            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', type: 'GENERAL', audience: 'ALL', is_important: false, content: '', attachment: null });
                fetchAnnouncements();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
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
        if (type === 'MAINTENANCE') return '#06b6d4';
        return '#3b82f6';
    };

    const getAudienceLabel = (aud: string) => {
        if (aud === 'STUDENTS') return 'Students Only';
        if (aud === 'STAFF') return 'Staff Only';
        return 'Everyone';
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ background: '#8b5cf6', padding: 12, borderRadius: 12, display: 'flex' }}>
                        <Megaphone size={28} color="white" />
                    </div>
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
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                        transition: 'transform 0.2s, filter 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
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
                        <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: '#13151a', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <Megaphone size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.7)' }}>No announcements yet</h3>
                            <p style={{ margin: 0, fontSize: 14 }}>Click the "New Announcement" button to create your first one.</p>
                        </div>
                    ) : announcements.map((ann: any) => (
                        <div key={ann.id} style={{ 
                            background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', 
                            borderLeft: `4px solid ${getColor(ann.zone)}`, borderRadius: 12, padding: 24,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}>
                            <div style={{ flex: 1, paddingRight: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{ann.title}</h3>
                                    
                                    {ann.is_important && (
                                        <div style={{ 
                                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                                            fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                            <AlertCircle size={12} /> IMPORTANT
                                        </div>
                                    )}
                                    
                                    <div style={{ 
                                        background: `rgba(${hexToRgb(getColor(ann.zone))}, 0.1)`, color: getColor(ann.zone), 
                                        fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, letterSpacing: 0.5 
                                    }}>
                                        {ann.zone}
                                    </div>
                                    
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 
                                    }}>
                                        Audience: {getAudienceLabel(ann.audience)}
                                    </div>
                                </div>
                                
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>
                                    Posted on {new Date(ann.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </div>
                                
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 16px 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {ann.description}
                                </p>
                                
                                {ann.attachment_url && (
                                    <a 
                                        href={ann.attachment_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '8px 16px', borderRadius: 8, color: '#3b82f6', textDecoration: 'none',
                                            fontSize: 13, fontWeight: 500
                                        }}
                                    >
                                        <FileText size={16} /> 
                                        {ann.attachment_name || 'View Attachment'} 
                                        <Download size={14} style={{ marginLeft: 8, opacity: 0.5 }} />
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button 
                                    onClick={() => handleDelete(ann.id)}
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', width: 36, height: 36, 
                                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                                    title="Delete Announcement"
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
                    <div style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 600, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: 8, borderRadius: 8, color: '#8b5cf6' }}>
                                    <Megaphone size={20} />
                                </div>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Create Announcement</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>ANNOUNCEMENT TITLE</label>
                                <input 
                                    required 
                                    placeholder="E.g., Semester Registration Opens Next Week"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    style={{ width: '100%', background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 16px', borderRadius: 8, fontSize: 15 }} 
                                />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>CATEGORY</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 16px', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
                                        <option value="GENERAL">General Info</option>
                                        <option value="ACADEMIC">Academics</option>
                                        <option value="EVENTS">Campus Events</option>
                                        <option value="ALERTS">Safety / Alerts</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>AUDIENCE</label>
                                    <select value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} style={{ width: '100%', background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 16px', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
                                        <option value="ALL">Everyone</option>
                                        <option value="STUDENTS">Students Only</option>
                                        <option value="STAFF">Staff & Faculty Only</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: formData.is_important ? 'rgba(239, 68, 68, 0.1)' : '#13151A', border: `1px solid ${formData.is_important ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, padding: 16, borderRadius: 8, transition: 'all 0.2s' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.is_important} 
                                        onChange={e => setFormData({...formData, is_important: e.target.checked})}
                                        style={{ width: 18, height: 18, accentColor: '#ef4444', cursor: 'pointer' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: formData.is_important ? '#ef4444' : 'white', fontSize: 15 }}>Mark as Important</div>
                                        <div style={{ fontSize: 12, color: formData.is_important ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>This will highlight the announcement in red.</div>
                                    </div>
                                    <AlertCircle color={formData.is_important ? '#ef4444' : 'rgba(255,255,255,0.2)'} size={24} />
                                </label>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>DETAILED MESSAGE</label>
                                <textarea 
                                    required 
                                    rows={5} 
                                    placeholder="Enter the full details of the announcement here..."
                                    value={formData.content} 
                                    onChange={e => setFormData({...formData, content: e.target.value})} 
                                    style={{ width: '100%', background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 16px', borderRadius: 8, fontSize: 15, resize: 'vertical' }} 
                                />
                            </div>

                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>ATTACHMENT (OPTIONAL)</label>
                                <div style={{ 
                                    position: 'relative', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, padding: 20, 
                                    textAlign: 'center', background: formData.attachment ? 'rgba(59, 130, 246, 0.05)' : '#13151A', transition: 'all 0.2s'
                                }}>
                                    <input 
                                        type="file" 
                                        onChange={e => setFormData({...formData, attachment: e.target.files ? e.target.files[0] : null})}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                                    />
                                    {formData.attachment ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: 8, borderRadius: 8 }}>
                                                <FileText size={20} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{formData.attachment.name}</div>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{(formData.attachment.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Paperclip size={24} color="rgba(255,255,255,0.4)" style={{ margin: '0 auto 8px' }} />
                                            <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Click or drag file to attach</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>PDF, Images, or Documents (Max 10MB)</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} style={{ flex: 2, background: '#8b5cf6', color: 'white', border: 'none', padding: '14px', borderRadius: 8, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                    {isSubmitting ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Megaphone size={18} />}
                                    {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                                </button>
                            </div>
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
