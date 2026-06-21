'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, CheckCircle, Clock, MapPin, ShieldAlert, LogOut, User } from 'lucide-react';

export default function StaffDashboard() {
    const router = useRouter();
    const [staff, setStaff] = useState<any>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.staff) {
                    setStaff(data.staff);
                    // In a real app we'd fetch complaints specifically assigned to this department
                    fetch('/api/complaints?limit=20')
                        .then(r => r.json())
                        .then(d => {
                            // Filter complaints that match staff department
                            const assigned = d.complaints?.filter((c: any) => c.category === data.staff.department_code) || [];
                            setComplaints(assigned);
                        });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const markResolved = async (id: string) => {
        try {
            await fetch('/api/admin/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'RESOLVED' }) // This automatically grants the +5 points in the backend API
            });
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
            setShowModal(false);
            setProofFile(null);
            setSelectedJob(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>;

    if (!staff) return <div style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Unauthorized. Please log in as Maintenance Staff.</div>;

    const pending = complaints.filter(c => c.status !== 'RESOLVED');
    const resolved = complaints.filter(c => c.status === 'RESOLVED');

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700 }}>
                        <div style={{ background: 'rgba(245,158,11,0.1)', padding: 12, borderRadius: 12 }}>
                            <Wrench size={28} color="#fbbf24" />
                        </div>
                        Staff Portal: {staff.department}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, paddingLeft: 60 }}>
                        Manage and resolve infrastructure issues assigned to your department.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={() => router.push('/staff/profile')}
                        style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)', padding: '10px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}
                    >
                        <User size={16} /> My Profile
                    </button>
                    <button 
                        onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} color="#fbbf24" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>PENDING WORK ORDERS</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{pending.length}</div>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>JOBS COMPLETED</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{resolved.length}</div>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: 20, marginBottom: 20, fontWeight: 600 }}>Active Assignments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {pending.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                        No pending jobs for your department!
                    </div>
                ) : (
                    pending.map(c => (
                        <div key={c.id} style={{
                            background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 16,
                            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ 
                                    width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: c.is_emergency ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                    color: c.is_emergency ? '#ef4444' : '#fbbf24'
                                }}>
                                    {c.is_emergency ? <ShieldAlert size={24} /> : <Clock size={24} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 600, color: c.is_emergency ? '#ef4444' : 'white' }}>
                                        {c.is_emergency && '🚨 '} {c.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {c.zone.replace('_', ' ')}</span>
                                        <span>Reported: {new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{c.description}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSelectedJob(c.id); setShowModal(true); }}
                                style={{ 
                                    background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', 
                                    padding: '12px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                            >
                                Submit Proof & Complete
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Proof Modal */}
            {showModal && selectedJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 500, padding: 32 }}>
                        <h2 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Upload Proof of Work</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
                            Please upload a photo showing the resolved issue before marking it complete.
                        </p>
                        
                        <div style={{ marginBottom: 24 }}>
                            {proofFile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '2px solid #10b981', borderRadius: 8 }}>
                                        <span style={{ fontSize: 20 }}>✅</span>
                                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: 14, flex: 1 }}>{proofFile.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button type="button" onClick={() => setProofFile(null)} style={{ cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                            ✕ Remove
                                        </button>
                                        <label style={{ cursor: 'pointer', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                            <input type="file" accept="image/*" capture="environment" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                            📷 Retake
                                        </label>
                                        <label style={{ cursor: 'pointer', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.4)', color: '#8b5cf6', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                            <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                            🖼️ Replace
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        padding: '22px 12px', border: '2px solid rgba(6,182,212,0.4)', borderRadius: 10,
                                        background: 'rgba(6,182,212,0.06)', cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <input type="file" accept="image/*" capture="environment" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                        <span style={{ fontSize: 28 }}>📷</span>
                                        <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: 13 }}>Camera</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Take photo now</span>
                                    </label>
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        padding: '22px 12px', border: '2px solid rgba(139,92,246,0.4)', borderRadius: 10,
                                        background: 'rgba(139,92,246,0.06)', cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                                        <span style={{ fontSize: 28 }}>🖼️</span>
                                        <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13 }}>Gallery</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Choose from device</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '10px 20px' }}>Cancel</button>
                            <button 
                                onClick={() => markResolved(selectedJob)}
                                disabled={!proofFile}
                                style={{ 
                                    background: proofFile ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                    color: proofFile ? 'white' : 'rgba(255,255,255,0.3)', 
                                    border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: proofFile ? 'pointer' : 'not-allowed' 
                                }}
                            >
                                Submit & Resolve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
