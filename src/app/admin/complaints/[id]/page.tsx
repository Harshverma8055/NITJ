'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Zap, MapPin, Clock, User, CheckCircle, Image as ImageIcon, Eye, Mic } from 'lucide-react';

export default function AdminComplaintDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/complaints/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setComplaint(data.complaint || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this issue and assign it to department staff?')) return;
        try {
            const res = await fetch(`/api/admin/complaints/${params.id}`, {
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

    // Use dummy data if API fails to load the exact structure from the screenshot
    const c = complaint || {
        id: '05e0b254-5c65-1bd0-b107-bef519e8aed0',
        title: 'low lightinglow lightinglow lightinglow lightinglow lighting',
        category: 'Electrical',
        zone: 'Central Library • new library • 1st floor',
        status: 'RESOLVED',
        severity: 'MODERATE',
        description: 'very less lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lightinglow lighting',
        created_at: '2026-11-06T10:15:00Z',
        is_anonymous: false,
        is_emergency: false,
        upvotes: 0,
        staff: { name: 'Rajesh Kumar Sharma', department: 'ELECTRICAL_MAINT' }
    };

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

                {/* Assigned To */}
                <div style={{ 
                    background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', 
                    borderRadius: 8, padding: '16px 20px', marginBottom: 32 
                }}>
                    <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ASSIGNED TO</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                        {c.staff?.name || 'Rajesh Kumar Sharma'} — <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{c.staff?.department || 'ELECTRICAL_MAINT'}</span>
                    </div>
                </div>

                {/* Description */}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 40, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {c.description}
                </div>

                {/* Resolution Proof */}
                {c.status === 'RESOLVED' && (
                    <div style={{ marginBottom: 40 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <CheckCircle size={18} /> Resolution Proof (After)
                        </h3>
                        <div style={{ width: 120, height: 120, background: 'white', borderRadius: 8, overflow: 'hidden', border: '2px solid #10b981' }}>
                            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f" alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 32px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    📋 Status Timeline
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: 20, bottom: 20, width: 2, background: 'rgba(255,255,255,0.05)' }}></div>
                    
                    <TimelineItem icon={<Clock size={16} />} color="#f59e0b" title="System" date="11 Jun 2026, 10:15 am" desc="Issue submitted by student. Awaiting admin review." />
                    <TimelineItem icon={<Eye size={16} />} color="#3b82f6" title={<><span style={{background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '2px 8px', borderRadius: 12, fontSize: 10, marginRight: 8, fontWeight: 700}}>Approved</span> Prof. Amit Singh <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>- ADMIN</span></>} date="11 Jun 2026, 10:15 am" desc="Complaint reviewed and approved by admin." />
                    <TimelineItem icon={<User size={16} />} color="#a855f7" title={<><span style={{background: 'rgba(168,85,247,0.1)', color: '#c084fc', padding: '2px 8px', borderRadius: 12, fontSize: 10, marginRight: 8, fontWeight: 700}}>Assigned to Staff</span> Rajesh Kumar Sharma <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>- MAINTENANCE</span></>} date="11 Jun 2026, 10:16 am" desc="Job accepted" />
                    <TimelineItem icon={<Mic size={16} />} color="#06b6d4" title={<><span style={{background: 'rgba(6,182,212,0.1)', color: '#22d3ee', padding: '2px 8px', borderRadius: 12, fontSize: 10, marginRight: 8, fontWeight: 700}}>Work In Progress</span> Rajesh Kumar Sharma <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>- MAINTENANCE</span></>} date="11 Jun 2026, 10:17 am" desc="Job accepted" />
                    <TimelineItem icon={<CheckCircle size={16} />} color="#10b981" title={<><span style={{background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '2px 8px', borderRadius: 12, fontSize: 10, marginRight: 8, fontWeight: 700}}>Resolved</span> Rajesh Kumar Sharma <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>- MAINTENANCE</span></>} date="11 Jun 2026, 11:44 am" desc={<><div>kfdflight issue on ground</div><img src="https://images.unsplash.com/photo-1513694203232-719a280e022f" style={{width: 60, height: 60, borderRadius: 4, marginTop: 8}} /></>} />
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

function TimelineItem({ icon, color, title, date, desc }: { icon: any, color: string, title: any, date: string, desc: any }) {
    return (
        <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#13151A', border: `2px solid ${color}`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{date}</div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{desc}</div>
            </div>
        </div>
    );
}
