'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock, CheckCircle, AlertTriangle, Filter, Search, MapPin, User, ThumbsUp } from 'lucide-react';

export default function ComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL_ACTIVE');
    const [votingIds, setVotingIds] = useState<Record<string, boolean>>({});
    const [sortBy, setSortBy] = useState<string>('latest');

    const fetchComplaints = (status?: string, sort: string = 'latest') => {
        setIsFetching(true);
        const params = new URLSearchParams({ limit: '50', sort: sort });
        if (status === 'MY_COMPLAINTS') {
            params.set('my_only', 'true');
        } else if (status && status !== 'ALL_ACTIVE') {
            params.set('status', status);
        }
        fetch(`/api/complaints?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                let list = data.complaints || [];
                // For ALL_ACTIVE, exclude resolved
                if (status === 'ALL_ACTIVE') {
                    list = list.filter((c: any) => c.status !== 'RESOLVED');
                }
                setComplaints(list);
                setInitialLoad(false);
                setIsFetching(false);
            })
            .catch(() => {
                setInitialLoad(false);
                setIsFetching(false);
            });
    };

    const handleVote = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (votingIds[id]) return;
        setVotingIds(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`/api/complaints/${id}/vote`, { method: 'POST' });
            const d = await res.json();
            if (res.ok) {
                setComplaints(prev => prev.map(c => {
                    if (c.id === id) {
                        return {
                            ...c,
                            has_voted: d.voted,
                            upvote_count: d.upvote_count
                        };
                    }
                    return c;
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setVotingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    useEffect(() => {
        fetchComplaints(statusFilter, sortBy);
    }, [statusFilter, sortBy]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return '#10b981';
            case 'IN_PROGRESS': return '#fbbf24';
            case 'ASSIGNED': return '#38bdf8';
            case 'APPROVED': return '#818cf8';
            default: return '#ef4444';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'rgba(16,185,129,0.1)';
            case 'IN_PROGRESS': return 'rgba(245,158,11,0.1)';
            case 'ASSIGNED': return 'rgba(56,189,248,0.1)';
            case 'APPROVED': return 'rgba(129,140,248,0.1)';
            default: return 'rgba(239,68,68,0.1)';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle size={24} />;
            case 'IN_PROGRESS': return <Clock size={24} />;
            default: return <AlertTriangle size={24} />;
        }
    };

    const FILTERS = [
        { key: 'ALL_ACTIVE', label: 'All Active' },
        { key: 'MY_COMPLAINTS', label: 'Your Complaints' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'ASSIGNED', label: 'Assigned' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
        { key: 'RESOLVED', label: 'Resolved' },
    ];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>Campus Issues</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>All active infrastructure problems reported across campus.</p>
                </div>
                <button 
                    onClick={() => router.push('/student/complaints/new')}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12,
                        display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(99,102,241,0.2)'
                    }}
                >
                    <Plus size={18} /> Report Issue
                </button>
            </div>

            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === 'true' && (
                <div style={{ 
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', 
                    padding: 20, borderRadius: 16, color: '#10b981', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 
                }}>
                    <CheckCircle size={24} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>🎉 Complaint Submitted Successfully!</div>
                        <div style={{ fontSize: 14, color: 'rgba(16,185,129,0.8)', marginTop: 4 }}>Your complaint has been received and is pending admin review.</div>
                    </div>
                </div>
            )}

            {/* Status Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                {FILTERS.map(f => (
                    <button 
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        style={{
                            background: statusFilter === f.key ? '#6366f1' : 'rgba(255,255,255,0.05)',
                            color: statusFilter === f.key ? 'white' : 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: statusFilter === f.key ? '#6366f1' : 'rgba(255,255,255,0.1)',
                            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Complaints Count & Sort */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>Showing <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{complaints.length}</strong> issue{complaints.length !== 1 ? 's' : ''}</span>
                    {isFetching && <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>Updating...</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Sort by:</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => setSortBy('latest')}
                            style={{
                                background: sortBy === 'latest' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: sortBy === 'latest' ? '#a5b4fc' : 'rgba(255, 255, 255, 0.6)',
                                border: sortBy === 'latest' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => setSortBy('upvotes')}
                            style={{
                                background: sortBy === 'upvotes' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: sortBy === 'upvotes' ? '#a5b4fc' : 'rgba(255, 255, 255, 0.6)',
                                border: sortBy === 'upvotes' ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                        >
                            Trending
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            {initialLoad ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner"></div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    {complaints.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 40, borderRadius: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            No issues found for this filter.
                        </div>
                    ) : (
                        complaints.map(c => (
                            <div 
                                key={c.id} 
                                className="complaint-card"
                                onClick={() => router.push(`/student/complaints/${c.id}`)}
                                style={{ 
                                    background: 'rgba(255,255,255,0.02)', padding: '24px', 
                                    borderRadius: 16, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ 
                                        width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: getStatusBg(c.status),
                                        color: getStatusColor(c.status)
                                    }}>
                                        {getStatusIcon(c.status)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 600, color: 'white' }}>{c.title}</h3>
                                        <div className="complaint-card-meta" style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13, flexWrap: 'wrap' }}>
                                            <span style={{ color: '#6366f1', fontWeight: 500 }}>{c.category?.replace('_', ' ')}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.zone?.replace('_', ' ')}</span>
                                            <span>{new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            {c.is_emergency && (
                                                <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 11, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 8 }}>EMERGENCY</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button
                                        onClick={(e) => handleVote(e, c.id)}
                                        disabled={votingIds[c.id]}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '6px 12px',
                                            background: c.has_voted ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                            border: c.has_voted ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: 20,
                                            cursor: votingIds[c.id] ? 'not-allowed' : 'pointer',
                                            color: c.has_voted ? '#a5b4fc' : 'rgba(255, 255, 255, 0.7)',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            if (!c.has_voted) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!c.has_voted) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }
                                        }}
                                    >
                                        <ThumbsUp size={14} fill={c.has_voted ? '#6366f1' : 'none'} />
                                        <span>{c.upvote_count ?? 0}</span>
                                    </button>

                                    <div style={{ 
                                        fontSize: 12, padding: '6px 16px', borderRadius: 20, fontWeight: 600,
                                        background: getStatusBg(c.status),
                                        color: getStatusColor(c.status),
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {c.status?.replace(/_/g, ' ')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

