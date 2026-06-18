'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Zap, MapPin, Clock, User, CheckCircle, Image as ImageIcon } from 'lucide-react';
import ComplaintTimeline from '@/components/complaints/ComplaintTimeline';

export default function AdminComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                router.push('/admin/complaints');
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
                onClick={() => router.push('/admin/complaints')}
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
                    <button style={{ 
                        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12
                    }}>
                        <Plus size={14} /> Add Note
                    </button>
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
                            Category: {c.category} / Lighting
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Badge color="#10b981" text="Low Priority" variant="outline" />
                            <Badge color="#10b981" text="Resolved" variant="filled" />
                            <div style={{ border: '1px solid rgba(245,158,11,0.5)', color: '#fbbf24', padding: '2px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
                                <Clock size={12} /> SLA: 8d 11h
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginLeft: 8 }}>
                                <MapPin size={14} /> {c.zone.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                    <MetricBox title="SEVERITY" value={c.severity} />
                    <MetricBox title="UPVOTES" value={c.upvote_count || 0} />
                    <MetricBox title="SUBMITTED" value={new Date(c.created_at).toLocaleDateString()} />
                    <MetricBox title="ANONYMOUS" value={c.is_anonymous ? 'Yes' : 'No'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                    <MetricBox title="EMERGENCY" value={c.is_emergency ? 'Yes' : 'No'} />
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

                {/* Description */}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 40, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {c.description}
                </div>
            </div>

            {/* Timeline */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 32px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    📋 Status Timeline
                </h3>
                
                <ComplaintTimeline 
                    updates={c.complaint_updates || []} 
                    currentStatus={c.status} 
                    createdAt={c.created_at} 
                />
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


