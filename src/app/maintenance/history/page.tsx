'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Wrench, CheckCircle, Clock, UserPlus, Zap, Image as ImageIcon, MapPin, MessageCircle } from 'lucide-react';
import { getSLATimeLeft, PRIORITY_LABELS, STATUS_LABELS, ZONE_LABELS, getPriorityColor, getStatusColor, getCategoryIcon } from '@/lib/complaints';
import type { ComplaintListItem } from '@/lib/complaints';

export default function MaintenanceHistory() {
    const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
    const [loading, setLoading]       = useState(true);
    const [updating, setUpdating]     = useState<string | null>(null);
    const [noteMap, setNoteMap]       = useState<Record<string, string>>({});
    const [fileMap, setFileMap]       = useState<Record<string, File>>({});

    const [userDept, setUserDept]     = useState<string | null>(null);
    const [myId, setMyId]             = useState<string | null>(null);
    const [role, setRole]             = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let deptCode: string | null = null;
        let staffId: string | null = null;

        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.user) {
                setRole(meData.user.role);
                deptCode = meData.user.maintenanceDept || null;
                staffId = meData.user.maintenanceId || null;
                setUserDept(deptCode);
                setMyId(staffId);
            }
        }

        const deptParam = deptCode ? `&department=${encodeURIComponent(deptCode)}` : '';
        const res = await fetch(`/api/complaints?sort=priority&limit=50&status=APPROVED,ASSIGNED${deptParam}`);
        const data = await res.json();
        
        const res2 = await fetch(`/api/complaints?sort=priority&limit=50&status=IN_PROGRESS${deptParam}`);
        const data2 = await res2.json();

        const res3 = await fetch(`/api/complaints?sort=resolved_at&limit=50&status=RESOLVED${deptParam}`);
        const data3 = await res3.json();
        
        setComplaints([...(data.complaints ?? []), ...(data2.complaints ?? []), ...(data3.complaints ?? [])]);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function uploadFile(file: File): Promise<string | null> {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', 'complaint-after');
        const res = await fetch('/api/complaints/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data.signedUrl || data.storagePath;
    }

    async function updateStatus(id: string, newStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED', requireNote = true) {
        const note = noteMap[id]?.trim() || (requireNote ? '' : 'Job accepted');
        if (requireNote && !note && newStatus !== 'ASSIGNED') { 
            alert('Please add a progress note before updating status.'); 
            return; 
        }
        
        let media_urls: string[] = [];
        if (newStatus === 'RESOLVED') {
            const file = fileMap[id];
            if (!file) {
                alert('Please upload an image of the completed work before marking as resolved.');
                return;
            }
            setUpdating(id);
            try {
                const path = await uploadFile(file);
                if (path) media_urls.push(path);
            } catch (err: unknown) {
                alert((err as Error).message || 'Failed to upload image.');
                setUpdating(null);
                return;
            }
        } else {
            setUpdating(id);
        }

        try {
            const res = await fetch(`/api/complaints/${id}/updates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note, new_status: newStatus, media_urls }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(`Failed to update status: ${data.error || 'Unknown error'}${data.details ? '\\n' + JSON.stringify(data.details) : ''}`);
                setUpdating(null);
                return;
            }
            await load();
            setUpdating(null);
            setNoteMap(prev => ({ ...prev, [id]: '' }));
            setFileMap(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
        } catch (err: unknown) {
            alert(`Network error: ${(err as Error).message}`);
            setUpdating(null);
        }
    }

    // 1. Available Jobs: Approved by admin, but not assigned to any specific staff member yet.
    const availableJobs = complaints.filter(c => c.status === 'APPROVED' && !c.assigned_staff_id);
    
    // 2. My Tasks: Assigned specifically to me (or I accepted them), waiting for me to start.
    const myTasks = complaints.filter(c => c.status === 'ASSIGNED' && (c.assigned_staff_id === myId || role === 'ADMIN'));
    
    // 3. In Progress: I am currently working on this.
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' && (c.assigned_staff_id === myId || role === 'ADMIN'));

    const resolved = complaints.filter(c => c.status === 'RESOLVED' && (c.assigned_staff_id === myId || role === 'ADMIN'));

    const breachedCount = complaints.filter(c => c.sla_breached).length;

    const inputStyle = {
        width: '100%', padding: '10px 14px', background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)', fontSize: 14, outline: 'none'
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1>Resolved History</h1>
                </div>
                <p>View all past maintenance jobs that have been completed by your department.</p>
            </div>

            {role === 'ADMIN' && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={18} /> You are viewing this as an Admin.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Admins see ALL complaints across the entire campus since they are not bound to a single department. To see the exact restricted view of a specific staff member, please log in with a staff account.
                    </p>
                </div>
            )}

            <Section 
                title="Resolved Work" 
                subtitle="Issues that have been fully addressed and closed."
                items={resolved} 
                icon={<CheckCircle size={18} />} 
                color="#10b981" 
                renderAction={(c) => (
                    <button
                        onClick={() => window.location.href = `/maintenance/complaints/${c.id}`}
                        style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                        View Details
                    </button>
                )}
            />
        </div>
    );

    // Helper component for rendering sections
    function Section({ title, subtitle, items, icon, color, renderAction }: {
        title: string; subtitle: string; items: ComplaintListItem[];
        icon: React.ReactNode; color: string;
        renderAction: (c: ComplaintListItem) => React.ReactNode;
    }) {
        if (items.length === 0) return null; // Don't show empty sections to keep UI clean

        return (
            <div style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ background: `${color}20`, color, padding: 8, borderRadius: 8 }}>{icon}</div>
                        <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>{title}</h2>
                        <span style={{ background: `rgba(255,255,255,0.05)`, color: 'var(--text-secondary)', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>
                            {items.length}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 0 46px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {items.map(c => (
                        <div key={c.id} style={{
                            background: 'var(--bg-secondary)', borderRadius: '12px',
                            border: c.sla_breached ? '2px solid #dc2626' : '1px solid var(--border-color)',
                            overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                        }}>
                            {/* SLA indicator */}
                            <div style={{
                                padding: '10px 16px', background: c.sla_breached ? 'rgba(220, 38, 38, 0.1)' : 'var(--bg-glass)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '1px solid var(--border-color)', fontSize: 12,
                            }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'monospace' }}>
                                    #{c.id.slice(0, 8).toUpperCase()}
                                </span>
                                {c.sla_deadline && (
                                    <span style={{
                                        color: c.sla_breached ? '#dc2626' : '#f59e0b',
                                        fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <Clock size={14} />
                                        {c.sla_breached ? 'SLA BREACHED' : getSLATimeLeft(c.sla_deadline)}
                                    </span>
                                )}
                            </div>

                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Top Row: Priority + Status */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ 
                                        color: getPriorityColor(c.priority), 
                                        fontWeight: 700, 
                                        fontSize: 11, 
                                        textTransform: 'uppercase', 
                                        letterSpacing: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 4 
                                    }}>
                                        {c.priority === 'LOW' && <Zap size={14} fill={getPriorityColor(c.priority)} />}
                                        {c.priority === 'MODERATE' && <AlertTriangle size={14} fill={getPriorityColor(c.priority)} />}
                                        {c.priority === 'HIGH' && <AlertTriangle size={14} fill={getPriorityColor(c.priority)} />}
                                        {c.priority === 'CRITICAL' && <AlertTriangle size={14} fill={getPriorityColor(c.priority)} />}
                                        {c.priority === 'EMERGENCY' && <AlertTriangle size={14} fill={getPriorityColor(c.priority)} />}
                                        {PRIORITY_LABELS[c.priority]}
                                    </span>
                                    <span style={{
                                        background: `${getStatusColor(c.status)}20`,
                                        color: getStatusColor(c.status),
                                        border: `1px solid ${getStatusColor(c.status)}50`,
                                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                    }}>
                                        {STATUS_LABELS[c.status]}
                                    </span>
                                </div>
                                
                                {/* Title */}
                                <h3 style={{ margin: '0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                    {c.title}
                                </h3>
                                
                                {/* Location */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                                    <MapPin size={13} />
                                    <span>{ZONE_LABELS[c.zone]}{c.building ? ` · ${c.building}` : ''}</span>
                                </div>
                                
                                {/* Bottom Row: comments, time */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: '4px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}>
                                        <MessageCircle size={14} /> {c.comment_count}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
                                        <Clock size={12} />
                                        {c.reporter && !c.is_anonymous
                                            ? `${c.reporter.name}${c.reporter.rollNumber ? ` (${c.reporter.rollNumber})` : ''} · `
                                            : c.is_anonymous ? 'Anonymous · ' : ''}
                                        {(() => {
                                            const ms = Date.now() - new Date(c.created_at).getTime();
                                            const d = Math.floor(ms / 86400000);
                                            const h = Math.floor((ms % 86400000) / 3600000);
                                            if (d > 0) return `${d}d ago`;
                                            if (h > 0) return `${h}h ago`;
                                            return `${Math.floor(ms / 60000)}m ago`;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
                                {renderAction(c)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
