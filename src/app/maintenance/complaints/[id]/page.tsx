'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, CheckCircle, Image as ImageIcon, Zap, AlertTriangle, Wrench, MessageSquare } from 'lucide-react';
import ComplaintTimeline from '@/components/complaints/ComplaintTimeline';


export default function MaintenanceComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [c, setC] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [commentText, setCommentText] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const postComment = async () => {
        if (!commentText.trim() || postingComment) return;
        setPostingComment(true);
        setCommentError('');
        try {
            const res = await fetch(`/api/complaints/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentText.trim(), is_internal: isInternal }),
            });
            const d = await res.json();
            if (!res.ok) {
                setCommentError(d.error || 'Failed to post comment.');
            } else {
                setCommentText('');
                setIsInternal(false);
                // Re-fetch to get updated comments
                const refreshed = await fetch(`/api/complaints/${id}`).then(r => r.json());
                if (refreshed.complaint) setC(refreshed.complaint);
            }
        } catch (err) {
            setCommentError('Network error. Failed to post comment.');
        } finally {
            setPostingComment(false);
        }
    };


    useEffect(() => {
        fetch(`/api/complaints/${id}`)
            .then(res => res.json())
            .then(data => {
                setC(data.complaint || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    async function uploadFile(file: File): Promise<string | null> {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', 'complaint-after');
        const res = await fetch('/api/complaints/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data.signedUrl || data.storagePath;
    }

    async function updateStatus(newStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED', requireNote = true) {
        if (!c) return;
        const defaultNote = newStatus === 'IN_PROGRESS' ? 'Work started on the complaint' : 'Job accepted';
        const progressNote = note.trim() || (requireNote ? '' : defaultNote);
        if (requireNote && !progressNote && newStatus !== 'ASSIGNED') { 
            alert('Please add a progress note before updating status.'); 
            return; 
        }
        
        let media_urls: string[] = [];
        if (newStatus === 'RESOLVED') {
            if (!file) {
                alert('Please upload an image of the completed work before marking as resolved.');
                return;
            }
            setUpdating(c.id);
            try {
                const path = await uploadFile(file);
                if (path) media_urls.push(path);
            } catch (err: any) {
                alert(err.message || 'Failed to upload image.');
                setUpdating(null);
                return;
            }
        } else {
            setUpdating(c.id);
        }

        try {
            const res = await fetch(`/api/complaints/${c.id}/updates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: progressNote, new_status: newStatus, media_urls }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(`Failed to update status: ${data.error || 'Unknown error'}`);
                setUpdating(null);
                return;
            }
            alert('Status updated successfully!');
            router.push(`/maintenance/dashboard?${new URLSearchParams(window.location.search).toString()}`);
        } catch (err: any) {
            alert(`Network error: ${err.message}`);
            setUpdating(null);
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;
    if (!c) return <div style={{ textAlign: 'center', marginTop: 100, color: 'white' }}>Complaint not found</div>;

    const inputStyle = {
        width: '100%', padding: '10px 14px', background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)', fontSize: 14, outline: 'none'
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', paddingBottom: 60 }}>

            <button 
                onClick={() => router.push(`/maintenance/dashboard?${new URLSearchParams(window.location.search).toString()}`)}
                style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'rgba(255,255,255,0.5)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', marginBottom: 24, fontSize: 13, alignSelf: 'flex-start'
                }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Main Detail Card */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', padding: 32, marginBottom: 32 }}>
                
                {/* Header */}
                {c.is_emergency && (
                    <div style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <AlertTriangle size={16} /> EMERGENCY ISSUE — Immediate Attention Required
                    </div>
                )}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
                    <div style={{ color: '#06b6d4', marginTop: 4 }}><Zap size={32} /></div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.3 }}>{c.title}</h1>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
                            Category: {c.category}
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                                {c.status}
                            </div>
                            {c.sla_deadline && (
                                <div style={{ border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24', padding: '2px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
                                    <Clock size={12} /> SLA Target: {new Date(c.sla_deadline).toLocaleString()}
                                </div>
                            )}
                            <div style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginLeft: 8 }}>
                                <MapPin size={14} /> {c.zone.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '16px' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>UPVOTES</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{c.upvote_count || 0}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '16px' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SUBMITTED</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '16px' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LOCATION DETAIL</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{[c.building, c.floor, c.room].filter(Boolean).join(' - ') || 'N/A'}</div>
                    </div>
                </div>

                {/* Exact Issue Location (Map) */}
                {(c.gps_lat && c.gps_lng) && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <MapPin size={18} color="#06b6d4" /> Exact Issue Location
                        </h3>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: 160, height: 160, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                                <iframe 
                                    width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} 
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.gps_lng - 0.002},${c.gps_lat - 0.002},${c.gps_lng + 0.002},${c.gps_lat + 0.002}&layer=mapnik&marker=${c.gps_lat},${c.gps_lng}`}
                                    style={{ pointerEvents: 'none' }}
                                ></iframe>
                                <a href={`https://www.google.com/maps?q=${c.gps_lat},${c.gps_lng}`} target="_blank" rel="noreferrer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} aria-label="Open Map"></a>
                            </div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                <a href={`https://www.google.com/maps?q=${c.gps_lat},${c.gps_lng}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 12, border: '1px solid rgba(59,130,246,0.3)' }}>
                                    Open in Google Maps ↗
                                </a><br/>
                                Coordinates: {c.gps_lat.toFixed(6)}, {c.gps_lng.toFixed(6)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6, marginBottom: 40, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 12 }}>
                    {c.description}
                </div>

                {/* Evidence Media */}
                {c.complaint_media && c.complaint_media.length > 0 && (
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: 24 }}>
                        {c.complaint_media.map((media: any) => (
                            <a key={media.id} href={media.public_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                {media.media_type === 'IMAGE' ? (
                                    <img src={media.public_url} alt="Evidence" style={{ height: 160, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                                ) : (
                                    <div style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                                        🎬 Video
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Bar based on Status */}
            {(c.status === 'APPROVED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS') && (
                <div style={{ background: '#13151A', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 24px 0', color: '#06b6d4' }}>🔧 Job Actions</h3>
                    
                    {(c.status === 'APPROVED' || c.status === 'ASSIGNED') && (
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                                {c.status === 'APPROVED' ? 'This job is available. Start work to assign it to yourself.' : 'You have accepted this job. Mark it as In Progress when you begin working.'}
                            </p>
                            <button
                                disabled={updating === c.id}
                                onClick={() => updateStatus('IN_PROGRESS', false)}
                                style={{ padding: '12px 24px', background: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Wrench size={16} />
                                {updating === c.id ? 'Starting...' : 'Start Work'}
                            </button>
                        </div>
                    )}

                    {c.status === 'IN_PROGRESS' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Upload a photo and add notes to mark this job as completely resolved.</p>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Resolution Notes</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                                    placeholder="Describe exactly what was fixed..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ImageIcon size={14} /> Work Evidence (Required)
                                </label>

                                {file ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '2px solid #10b981', borderRadius: 8 }}>
                                            <CheckCircle size={20} color="#10b981" />
                                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13, flex: 1 }}>{file.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <button type="button" onClick={() => setFile(null)} style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                                ✕ Remove
                                            </button>
                                            <label style={{ cursor: 'pointer', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                                <input type="file" accept="image/*" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                                📷 Retake
                                            </label>
                                            <label style={{ cursor: 'pointer', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.4)', color: '#8b5cf6', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                                🖼️ Replace
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        {/* Camera — opens native device camera */}
                                        <label style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            padding: '20px 12px', border: '2px solid rgba(6,182,212,0.4)', borderRadius: 10,
                                            background: 'rgba(6,182,212,0.06)', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <input type="file" accept="image/*" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: 28 }}>📷</span>
                                            <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: 13 }}>Camera</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Take photo now</span>
                                        </label>
                                        <label style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            padding: '20px 12px', border: '2px solid rgba(139,92,246,0.4)', borderRadius: 10,
                                            background: 'rgba(139,92,246,0.06)', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: 28 }}>🖼️</span>
                                            <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13 }}>Gallery</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Choose from device</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <button
                                disabled={updating === c.id}
                                onClick={() => updateStatus('RESOLVED')}
                                style={{ padding: '12px 24px', background: '#10b981', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
                                <CheckCircle size={18} />
                                {updating === c.id ? 'Saving...' : 'Mark as Resolved'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 24px 0' }}>📋 Status Timeline</h3>
                <ComplaintTimeline
                    updates={c.complaint_updates || []}
                    currentStatus={c.status}
                    createdAt={c.created_at}
                />
            </div>

            {/* Comments / Discussion Section */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={18} color="#06b6d4" /> Discussion ({c.complaint_comments?.filter((comment: any) => !comment.is_deleted).length || 0})
                </h3>

                {c.complaint_comments && c.complaint_comments.filter((comment: any) => !comment.is_deleted).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                        {c.complaint_comments.filter((comment: any) => !comment.is_deleted).map((comment: any) => (
                            <div key={comment.id} style={{
                                padding: '16px',
                                background: comment.is_official ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                                borderRadius: 12,
                                border: comment.is_official ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13, color: comment.is_official ? '#818cf8' : 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {comment.is_official ? '🏛️ Official' : ''} 
                                        {comment.is_internal && <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 6px', borderRadius: 4, fontSize: 10, letterSpacing: 0.5 }}>🔒 INTERNAL</span>}
                                        {comment.author?.name || 'User'}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                        {new Date(comment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>No comments or updates yet.</p>
                )}

                {/* Add comment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <textarea
                        style={{
                            width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                            color: 'white', fontSize: 14, minHeight: 90, resize: 'vertical',
                            boxSizing: 'border-box', outline: 'none'
                        }}
                        placeholder="Add a comment or update..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        maxLength={1000}
                    />
                    {commentError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{commentError}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{commentText.length}/1000</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                                />
                                Staff-only internal note
                            </label>
                        </div>
                        <button
                            onClick={postComment}
                            disabled={!commentText.trim() || postingComment}
                            style={{
                                background: '#06b6d4', color: 'white', border: 'none',
                                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, opacity: (!commentText.trim() || postingComment) ? 0.5 : 1
                            }}
                        >
                            {postingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
