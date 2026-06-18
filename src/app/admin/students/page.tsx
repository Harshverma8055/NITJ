'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Plus, Search, RefreshCw, Edit2, Key, Trash2 } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
    roll: string;
    dept: string;
    year: string;
}

export default function AdminStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('All Departments');
    const [yearFilter, setYearFilter] = useState('All');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/students');
            const data = await res.json();
            if (data.students) setStudents(data.students);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const getMappedDept = (dept: string) => {
        if (!dept) return 'N/A';
        const d = dept.toUpperCase();
        if (d.includes('COMPUTER') || d.includes('CSE')) return 'CSE';
        if ((d.includes('ELECTRONICS') && d.includes('COMMUNICATION')) || d.includes('ECE')) return 'ECE';
        if (d.includes('ELECTRONICS') || d.includes('EE')) return 'EE';
        if (d.includes('INFORMATION TECHNOLOGY') || d.includes('IT')) return 'IT';
        if (d.includes('INSTRUMENTATION') || d.includes('ICE')) return 'ICE';
        if (d.includes('INDUSTRIAL') || d.includes('PRODUCTION') || d.includes('IPE') || d.includes('IP')) return 'IPE';
        if (d.includes('BIO') || d.includes('BT')) return 'BT';
        if (d.includes('CHEM') || d.includes('CHE')) return 'ChE';
        if (d.includes('CIVIL') || d.includes('CE')) return 'CE';
        if (d.includes('DATA SCIENCE') || d.includes('DSE')) return 'DSE';
        if (d.includes('MATH') || d.includes('COMPUTING') || d.includes('MNC')) return 'MnC';
        if (d.includes('MECHANICAL') || d.includes('ME')) return 'ME';
        if (d.includes('TEXTILE') || d.includes('TT')) return 'TT';
        return dept;
    };

    const departments = useMemo(() => {
        const set = new Set(students.map(s => s.dept));
        return ['All Departments', ...Array.from(set)];
    }, [students]);

    const years = useMemo(() => {
        const set = new Set(students.map(s => s.year));
        return ['All', ...Array.from(set).sort()];
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const mappedDept = getMappedDept(s.dept);
            const searchLower = searchQuery.toLowerCase();
            
            const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                                  s.email.toLowerCase().includes(searchLower) ||
                                  s.roll.toLowerCase().includes(searchLower) ||
                                  s.dept.toLowerCase().includes(searchLower) ||
                                  mappedDept.toLowerCase().includes(searchLower);
            const matchesDept = deptFilter === 'All Departments' || s.dept === deptFilter;
            const matchesYear = yearFilter === 'All' || s.year === yearFilter;
            return matchesSearch && matchesDept && matchesYear;
        });
    }, [students, searchQuery, deptFilter, yearFilter]);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, gap: 40 }}>
                <div style={{ flexShrink: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <GraduationCap size={24} /> Manage Students
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 13, maxWidth: 250, lineHeight: 1.5 }}>
                        Create, edit, and manage student accounts
                    </p>
                </div>
                
                <button 
                    onClick={() => router.push('/admin/students/create')}
                    style={{ 
                        flex: 1, background: '#8b5cf6', color: 'white', border: 'none', 
                        padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <Plus size={18} /> Create Student
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px 100px 48px', gap: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Name, email, or roll number..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                                color: 'white', padding: '12px 16px 12px 44px', borderRadius: 12, fontSize: 13, outline: 'none'
                            }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Department</label>
                    <select 
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        style={{ 
                            width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white', padding: '12px 16px', borderRadius: 12, fontSize: 13, outline: 'none', appearance: 'none'
                        }}
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Year</label>
                    <select 
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        style={{ 
                            width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white', padding: '12px 16px', borderRadius: 12, fontSize: 13, outline: 'none', appearance: 'none'
                        }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button 
                        onClick={fetchStudents}
                        style={{ 
                            width: 48, height: 43, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? "spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Students ({filteredStudents.length})</h2>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
                        <thead>
                            <tr style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>NAME</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>EMAIL</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ROLL NO.</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>DEPARTMENT</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>YEAR</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading students...</td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No students found matching filters.</td>
                                </tr>
                            ) : filteredStudents.map((s, i) => (
                                <tr key={s.id} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: 13 }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.name}</td>
                                    <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.6)' }}>{s.email}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, display: 'inline-block', fontSize: 11, fontWeight: 600 }}>
                                            {s.roll}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.8)' }}>{s.dept}</td>
                                    <td style={{ padding: '16px 24px' }}>{s.year}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => alert('Edit feature coming soon.')} style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => alert('Password reset coming soon.')} style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Key size={12} />
                                            </button>
                                            <button onClick={() => alert('Delete feature coming soon.')} style={{ width: 28, height: 28, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style jsx>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
