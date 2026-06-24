'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Zap, MapPin, Clock, User, CheckCircle, Image as ImageIcon, MessageSquare } from 'lucide-react';
import ComplaintTimeline from '@/components/complaints/ComplaintTimeline';

export default function AdminComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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
                const refreshed = await fetch(`/api/admin/complaints/${id}`).then(r => r.json());
                if (refreshed.complaint) setComplaint(refreshed.complaint);
            }
        } catch (err) {
            setCommentError('Network error. Failed to post comment.');
        } finally {
            setPostingComment(false);
        }
    };

    useEffect(() => {
        fetch(`/api/admin/complaints/${id}`)
            .then(res => res.json())
            .then(data => {
                setComplaint(data.complaint || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this issue and assign it to department staff?')) return;
        try {
            const res = await fetch(`/api/admin/complaints/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            });
            if (res.ok) {
                alert('Complaint approved successfully!');
                router.push(`/admin/complaints?${new URLSearchParams(window.location.search).toString()}`);
            } else {
                alert('Failed to approve complaint.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    if (!complaint) return <div style={{ textAlign: 'center', marginTop: 100, color: 'white' }}>Complaint not found</div>;

    const c = complaint;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            <button 
                onClick={() => router.push(`/admin/complaints?${new URLSearchParams(window.location.search).toString()}`)}
                style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'rgba(255,255,255,0.5)', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', marginBottom: 24, fontSize: 13, alignSelf: 'flex-start'
                }}
            >
                <ArrowLeft size={16} /> Back to Queue
            </button>

            {/* Admin Actions Bar */}
            <div style={{ 
                background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, 
                padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 
            }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={14} /> ADMIN ACTIONS — ID: {c.id.split('-')[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    {c.status === 'PENDING_REVIEW' && (
                        <button onClick={handleApprove} style={{ 
                            background: '#10b981', color: 'white', border: 'none', 
                            padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                        }}>
                            <CheckCircle size={14} /> Approve & Assign
                        </button>
                    )}
                </div>
            </div>

            {/* Main Detail Card */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', padding: 32, marginBottom: 32 }}>
                
                {/* Header */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
                    <div style={{ color: '#f59e0b', marginTop: 4 }}><Zap size={32} fill="#f59e0b" /></div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.3 }}>{c.title}</h1>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
                            Category: {c.category}
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            {c.is_emergency && <Badge color="#ef4444" text="Emergency" variant="outline" />}
                            <Badge 
                                color={c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' ? '#06b6d4' : c.status === 'PENDING_REVIEW' ? '#f59e0b' : '#3b82f6'} 
                                text={c.status === 'RESOLVED' ? 'Resolved' : c.status === 'IN_PROGRESS' ? 'Work In Progress' : c.status === 'ASSIGNED' ? 'Assigned' : c.status === 'PENDING_REVIEW' ? 'Pending Review' : 'Approved'} 
                                variant="filled" 
                            />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                    <MetricBox title="EMERGENCY" value={c.is_emergency ? 'Yes' : 'No'} />
                    <MetricBox title="UPVOTES" value={c.upvote_count || 0} />
                    <MetricBox title="SUBMITTED" value={new Date(c.created_at).toLocaleDateString()} />
                    <MetricBox title="ANONYMOUS" value={c.is_anonymous ? 'Yes' : 'No'} />
                </div>

                {/* Exact Issue Location (Map) */}
                {(c.gps_lat && c.gps_lng) && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <MapPin size={18} color="#f59e0b" /> Exact Issue Location
                        </h3>
                        <div style={{ height: 250, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.gps_lng - 0.005},${c.gps_lat - 0.005},${c.gps_lng + 0.005},${c.gps_lat + 0.005}&layer=mapnik&marker=${c.gps_lat},${c.gps_lng}`}
                            ></iframe>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                            Coordinates: {c.gps_lat.toFixed(6)}, {c.gps_lng.toFixed(6)}
                            <a href={`https://www.google.com/maps?q=${c.gps_lat},${c.gps_lng}`} target="_blank" rel="noreferrer" style={{ marginLeft: 12, color: '#3b82f6', textDecoration: 'none' }}>Open in Google Maps</a>
                        </div>
                    </div>
                )}

                {/* Assigned To */}
                {c.staff ? (
                    <div style={{ 
                        background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', 
                        borderRadius: 8, padding: '16px 20px', marginBottom: 32 
                    }}>
                        <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ASSIGNED TO</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                            {c.staff.name} — <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{c.staff.department}</span>
                        </div>
                    </div>
                ) : (
                    <div style={{ 
                        background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', 
                        borderRadius: 8, padding: '16px 20px', marginBottom: 32 
                    }}>
                        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ASSIGNMENT STATUS</div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                            Not assigned to any staff yet
                        </div>
                    </div>
                )}

                {/* Evidence & Resolution Media */}
                {c.complaint_media && c.complaint_media.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                        {c.complaint_media.some((m: any) => m.is_before) && (
                            <div>
                                <h3 style={{ marginTop: 0, fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ImageIcon size={16} /> Problem Evidence (Before)
                                </h3>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {c.complaint_media.filter((m: any) => m.is_before).map((media: any) => (
                                        media.media_type === 'IMAGE' ? (
                                            <a key={media.id} href={media.public_url} target="_blank" rel="noopener noreferrer">
                                                <img src={media.public_url} alt="Evidence" style={{ height: 160, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                                            </a>
                                        ) : (
                                            <video key={media.id} src={media.public_url} controls style={{ height: 160, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                        {c.complaint_media.some((m: any) => m.is_after) && (
                            <div>
                                <h3 style={{ marginTop: 0, fontSize: 15, color: '#10b981', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CheckCircle size={16} color="#10b981" /> Work Resolution Evidence (After)
                                </h3>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {c.complaint_media.filter((m: any) => m.is_after).map((media: any) => (
                                        media.media_type === 'IMAGE' ? (
                                            <a key={media.id} href={media.public_url} target="_blank" rel="noopener noreferrer">
                                                <img src={media.public_url} alt="Resolution" style={{ height: 160, borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }} />
                                            </a>
                                        ) : (
                                            <video key={media.id} src={media.public_url} controls style={{ height: 160, borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 40, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {c.description}
                </div>
            </div>

            {/* Timeline */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 32px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    📋 Status Timeline
                </h3>
                
                <ComplaintTimeline 
                    updates={c.complaint_updates || []} 
                    currentStatus={c.status} 
                    createdAt={c.created_at} 
                />
            </div>

            {/* Comments / Discussion Section */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 32px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={18} color="#3b82f6" /> Discussion ({c.complaint_comments?.filter((comment: any) => !comment.is_deleted).length || 0})
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
                                    style={{ accentColor: '#ef4444', cursor: 'pointer' }}
                                />
                                Staff-only internal note
                            </label>
                        </div>
                        <button
                            onClick={postComment}
                            disabled={!commentText.trim() || postingComment}
                            style={{
                                background: '#3b82f6', color: 'white', border: 'none',
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

function ShieldCheck({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
}

function Badge({ color, text, variant }: { color: string, text: string, variant: 'outline' | 'filled' }) {
    return (
        <div style={{ 
            background: variant === 'filled' ? 'rgba(16,185,129,0.1)' : 'transparent', 
            border: `1px solid ${variant === 'filled' ? 'transparent' : color}`, 
            color: color, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 
        }}>
            {text}
        </div>
    );
}

function MetricBox({ title, value }: { title: string, value: string | number }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '16px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{value}</div>
        </div>
    );
}


