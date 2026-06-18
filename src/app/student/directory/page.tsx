'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, User, Star, Award, ChevronRight, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentDirectoryPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All Depts');
    const [yearFilter, setYearFilter] = useState('All Years');
    const [viewMode, setViewMode] = useState<'students' | 'staff'>('students');
    const [visibleCount, setVisibleCount] = useState(24);

    const DEPARTMENTS = ['All Depts', 'BT', 'ChE', 'CE', 'CSE', 'DSE', 'EE', 'ECE', 'IPE', 'IT', 'ICE', 'MnC', 'ME', 'TT'];
    const YEARS = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

    useEffect(() => {
        fetch('/api/students').then(r => r.json()).then((studentData) => {
            if (studentData.students) setStudents(studentData.students);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Helper to get initials
    const getInitials = (name: string) => {
        if (!name) return 'S';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

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

    // Client-side filtering
    const filteredData = students.filter(s => {
        const mappedDept = getMappedDept(s.department);
        const searchLower = search.toLowerCase();
        
        const matchesSearch = s.user?.name?.toLowerCase().includes(searchLower) || 
                              s.roll_number?.toLowerCase().includes(searchLower) ||
                              s.department?.toLowerCase().includes(searchLower) ||
                              mappedDept.toLowerCase().includes(searchLower);
        
        const matchesDept = deptFilter === 'All Depts' || mappedDept === deptFilter;
        const matchesYear = yearFilter === 'All Years' || `Year ${s.year}` === yearFilter;
        return matchesSearch && matchesDept && matchesYear;
    });

    useEffect(() => {
        setVisibleCount(24);
    }, [search, deptFilter, yearFilter]);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    🎓 Campus Student Directory
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Browse and discover your peers across all departments
                </p>
            </div>

            {/* Search Bar */}
            <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 24
            }}>
                <Search size={20} color="rgba(255,255,255,0.4)" />
                <input 
                    type="text" 
                    placeholder="Search by name or roll number..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        background: 'transparent', border: 'none', color: 'white',
                        fontSize: 16, width: '100%', outline: 'none'
                    }}
                />
            </div>

            {/* Filters */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <MapPin size={18} color="rgba(255,255,255,0.4)" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {DEPARTMENTS.map(dept => (
                                <button 
                                    key={dept}
                                    onClick={() => setDeptFilter(dept)}
                                    style={{
                                        background: deptFilter === dept ? '#6366f1' : 'rgba(255,255,255,0.03)',
                                        color: deptFilter === dept ? 'white' : 'rgba(255,255,255,0.6)',
                                        border: '1px solid',
                                        borderColor: deptFilter === dept ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {YEARS.map(year => (
                            <button 
                                key={year}
                                onClick={() => setYearFilter(year)}
                                style={{
                                    background: yearFilter === year ? '#6366f1' : 'rgba(255,255,255,0.03)',
                                    color: yearFilter === year ? 'white' : 'rgba(255,255,255,0.6)',
                                    border: '1px solid',
                                    borderColor: yearFilter === year ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>


            {/* Count */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                Showing 1-{Math.min(filteredData.length, visibleCount)} of <strong>{filteredData.length}</strong> students
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner"></div></div>
            ) : (
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>NAME</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>ROLL NO.</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>DEPARTMENT</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>YEAR</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>PULSE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No students found.</td>
                                    </tr>
                                ) : filteredData.slice(0, visibleCount).map((s: any, i: number) => (
                                    <tr key={s.id} style={{ borderBottom: i < visibleCount - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: 13, transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td data-label="NAME" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: '#60a5fa',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 12, fontWeight: 700
                                            }}>
                                                {getInitials(s.user?.name)}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{s.user?.name || 'User Name'}</span>
                                        </td>
                                        <td data-label="ROLL NO." style={{ padding: '16px 24px' }}>
                                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, display: 'inline-block', fontSize: 11, fontWeight: 600 }}>
                                                {s.roll_number}
                                            </div>
                                        </td>
                                        <td data-label="DEPARTMENT" style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.8)' }}>
                                            <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                                                {getMappedDept(s.department)}
                                            </span>
                                        </td>
                                        <td data-label="YEAR" style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.6)' }}>
                                            Year {s.year || 1}
                                        </td>
                                        <td data-label="PULSE" style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700 }}>
                                                <Star size={14} fill="#10b981" /> {s.rating || 0}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {visibleCount < filteredData.length && (
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <button 
                                onClick={() => setVisibleCount(v => v + 24)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#60a5fa',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Load More Students
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
