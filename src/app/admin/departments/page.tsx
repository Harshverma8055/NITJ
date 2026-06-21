'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, BarChart3, ShieldCheck, Clock, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = [
    { id: 'electrical', name: 'Electrical', head: 'Chief Electrical Engineer', color: '#f59e0b', total: 9, active: 3, resolved: 6, sla: '48h', icon: Activity },
    { id: 'plumbing', name: 'Plumbing', head: 'Sanitation & Plumbing Supervisor', color: '#3b82f6', total: 4, active: 4, resolved: 0, sla: '24h', icon: Building2 },
    { id: 'hostel', name: 'Hostel', head: 'Hostel Maintenance Supervisor', color: '#10b981', total: 3, active: 3, resolved: 0, sla: '24h', icon: Building2 },
    { id: 'sports', name: 'Sports', head: 'Sports Officer', color: '#10b981', total: 2, active: 2, resolved: 0, sla: '72h', icon: Building2 },
    { id: 'security', name: 'Security', head: 'Chief Security Officer', color: '#ef4444', total: 1, active: 1, resolved: 0, sla: '4h', icon: ShieldCheck },
    { id: 'research', name: 'Research Infra', head: 'Research Infrastructure Coordinator', color: '#8b5cf6', total: 0, active: 0, resolved: 0, sla: '48h', icon: Building2 },
    { id: 'transport', name: 'Transport', head: 'Transport Officer', color: '#6366f1', total: 0, active: 0, resolved: 0, sla: '72h', icon: Building2 },
    { id: 'library', name: 'Library Tech', head: 'Library Systems Administrator', color: '#14b8a6', total: 0, active: 0, resolved: 0, sla: '48h', icon: Building2 },
    { id: 'civil', name: 'Civil Works', head: 'Executive Engineer (Civil)', color: '#f59e0b', total: 0, active: 0, resolved: 0, sla: '72h', icon: Building2 },
    { id: 'lab', name: 'Lab Maint', head: 'Laboratory Superintendent', color: '#10b981', total: 0, active: 0, resolved: 0, sla: '48h', icon: Building2 },
    { id: 'network', name: 'Network IT', head: 'Network Administrator', color: '#8b5cf6', total: 0, active: 0, resolved: 0, sla: '12h', icon: Building2 },
    { id: 'horticulture', name: 'Horticulture', head: 'Horticulture Supervisor', color: '#10b981', total: 0, active: 0, resolved: 0, sla: '120h', icon: Building2 },
];

const DEPT_ID_TO_CODE: Record<string, string> = {
    electrical: 'ELECTRICAL_MAINT',
    civil: 'CIVIL_WORKS',
    plumbing: 'PLUMBING_SANITATION',
    network: 'NETWORK_IT',
    hostel: 'HOSTEL_MAINT',
    sports: 'SPORTS_FACILITY',
    security: 'CAMPUS_SECURITY',
    research: 'RESEARCH_INFRA',
    transport: 'TRANSPORT_PARKING',
    library: 'LIBRARY_TECH',
    lab: 'LAB_MAINT',
    horticulture: 'HORTICULTURE'
};

export default function DepartmentsPage() {
    const router = useRouter();
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [departments, setDepartments] = useState(DEPARTMENTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/complaints')
            .then(res => res.json())
            .then(data => {
                const complaints = data.complaints || [];
                
                // Map API categories to our departments
                const updatedDepts = DEPARTMENTS.map(dept => {
                    let matchingComplaints = [];
                    if (dept.id === 'electrical') matchingComplaints = complaints.filter((c:any) => c.category === 'ELECTRICAL');
                    else if (dept.id === 'plumbing') matchingComplaints = complaints.filter((c:any) => c.category === 'PLUMBING');
                    else if (dept.id === 'hostel') matchingComplaints = complaints.filter((c:any) => c.category === 'HOSTEL');
                    else if (dept.id === 'network') matchingComplaints = complaints.filter((c:any) => c.category === 'IT_INFRASTRUCTURE');
                    else if (dept.id === 'civil') matchingComplaints = complaints.filter((c:any) => c.category === 'FURNITURE');
                    
                    const total = matchingComplaints.length;
                    const resolved = matchingComplaints.filter((c:any) => c.status === 'RESOLVED').length;
                    const active = total - resolved;

                    return { ...dept, total, active, resolved };
                });
                
                setDepartments(updatedDepts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const totalDepts = departments.length;
    const allComplaints = departments.reduce((sum, d) => sum + d.total, 0);
    const resolvedComplaints = departments.reduce((sum, d) => sum + d.resolved, 0);
    const activeComplaints = departments.reduce((sum, d) => sum + d.active, 0);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        Department Management <span style={{ fontSize: 24 }}>🏛️</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                        {totalDepts} departments across NIT Jalandhar campus infrastructure. View complaint load, SLA compliance, and resolution metrics.
                    </p>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 }}>
                    <button 
                        onClick={() => setView('grid')}
                        style={{ background: view === 'grid' ? '#6366f1' : 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', transition: '0.2s' }}
                    >
                        Grid
                    </button>
                    <button 
                        onClick={() => setView('table')}
                        style={{ background: view === 'table' ? '#6366f1' : 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', transition: '0.2s' }}
                    >
                        Table
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                <StatCard icon={<Building2 size={20} color="#8b5cf6" />} title="Total Departments" value={totalDepts} color="#8b5cf6" />
                <StatCard icon={<BarChart3 size={20} color="#f59e0b" />} title="All Time Complaints" value={allComplaints} color="#f59e0b" />
                <StatCard icon={<ShieldCheck size={20} color="#10b981" />} title="Resolved" value={resolvedComplaints} color="#10b981" />
                <StatCard icon={<Clock size={20} color="#3b82f6" />} title="Active Issues" value={activeComplaints} color="#3b82f6" />
                <StatCard icon={<AlertTriangle size={20} color="#ef4444" />} title="SLA Breaches" value={0} color="#ef4444" />
            </div>

            {/* Department Content */}
            {view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {departments.map(dept => {
                        const resolutionRate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                        return (
                            <div key={dept.id} style={{ 
                                background: '#13151A', 
                                borderRadius: 16, 
                                border: `1px solid rgba(255,255,255,0.05)`, 
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {/* Top Color Line */}
                                <div style={{ height: 4, background: dept.color, width: '100%' }}></div>
                                
                                <div style={{ padding: 24 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${hexToRgb(dept.color)}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <dept.icon size={20} color={dept.color} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600 }}>{dept.name}</h3>
                                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{dept.head}</p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{dept.total}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>TOTAL</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: dept.active > 0 ? '#f59e0b' : 'white' }}>{dept.active}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>ACTIVE</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: dept.resolved > 0 ? '#10b981' : 'white' }}>{dept.resolved}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>RESOLVED</div>
                                        </div>
                                    </div>

                                    {/* Resolution Rate */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                                            <span>Resolution Rate</span>
                                            <span style={{ color: dept.color, fontWeight: 600 }}>{resolutionRate}%</span>
                                        </div>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${resolutionRate}%`, background: dept.color, borderRadius: 2 }}></div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                            SLA: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{dept.sla}</span>
                                        </div>
                                        <button onClick={() => {
                                            const code = DEPT_ID_TO_CODE[dept.id] || 'ALL';
                                            router.push(`/admin/complaints?dept=${code}&filter=All Complaints`);
                                        }} style={{ background: 'none', border: 'none', color: dept.color, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                            View <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>DEPARTMENT</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>HEAD</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>TOTAL</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ACTIVE</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>RESOLVED</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>RESOLUTION RATE</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => {
                                const resolutionRate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                                return (
                                    <tr key={dept.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td data-label="DEPARTMENT" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${hexToRgb(dept.color)}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <dept.icon size={16} color={dept.color} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{dept.name}</span>
                                        </td>
                                        <td data-label="HEAD" style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.6)' }}>{dept.head}</td>
                                        <td data-label="TOTAL" style={{ padding: '16px 24px', fontWeight: 600 }}>{dept.total}</td>
                                        <td data-label="ACTIVE" style={{ padding: '16px 24px', color: dept.active > 0 ? '#f59e0b' : 'white', fontWeight: 600 }}>{dept.active}</td>
                                        <td data-label="RESOLVED" style={{ padding: '16px 24px', color: dept.resolved > 0 ? '#10b981' : 'white', fontWeight: 600 }}>{dept.resolved}</td>
                                        <td data-label="RESOLUTION RATE" style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                                    <div style={{ height: '100%', width: `${resolutionRate}%`, background: dept.color, borderRadius: 2 }}></div>
                                                </div>
                                                <span style={{ fontSize: 12, color: dept.color, fontWeight: 600 }}>{resolutionRate}%</span>
                                            </div>
                                        </td>
                                        <td data-label="ACTION" style={{ padding: '16px 24px' }}>
                                            <button onClick={() => {
                                                const code = DEPT_ID_TO_CODE[dept.id] || 'ALL';
                                                router.push(`/admin/complaints?dept=${code}&filter=All Complaints`);
                                            }} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, title, value, color }: { icon: any, title: string, value: number, color: string }) {
    return (
        <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${hexToRgb(color)}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {icon}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{title}</div>
        </div>
    );
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
