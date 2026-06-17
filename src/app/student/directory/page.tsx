'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, User, Star, Award, ChevronRight, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentDirectoryPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All Depts');
    const [yearFilter, setYearFilter] = useState('All Years');

    const DEPARTMENTS = ['All Depts', 'BT', 'ChE', 'CE', 'CSE', 'DSE', 'EE', 'ECE', 'IPE', 'IT', 'ICE', 'MnC', 'ME', 'TT'];
    const YEARS = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

    useEffect(() => {
        // Fetch all students (simplified for this local demo)
        fetch('/api/students')
            .then(r => r.json())
            .then(data => {
                if (data.students) setStudents(data.students);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Helper to get initials
    const getInitials = (name: string) => {
        if (!name) return 'S';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    // Client-side filtering
    const filteredStudents = students.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
                              s.roll_number?.toLowerCase().includes(search.toLowerCase());
        const mappedDept = s.department?.includes('BIO') ? 'BT' : 
                           s.department?.includes('COMP') ? 'CSE' : 
                           s.department?.includes('CIVIL') ? 'CE' : s.department;
        
        const matchesDept = deptFilter === 'All Depts' || mappedDept === deptFilter;
        const matchesYear = yearFilter === 'All Years' || `Year ${s.year}` === yearFilter;
        return matchesSearch && matchesDept && matchesYear;
    });

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

            {/* Student Count */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                Showing 1-{Math.min(filteredStudents.length, 24)} of <strong>{students.length}</strong> students
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner"></div></div>
            ) : (
                <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 
                }}>
                    {filteredStudents.slice(0, 24).map((s: any) => (
                        <div key={s.id} onClick={() => alert(`Profile viewing for ${s.user?.name || 'student'} is coming soon.`)} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 16,
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'transform 0.2s, background 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: '#6366f1', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24, fontWeight: 600, marginBottom: 16
                            }}>
                                {getInitials(s.user?.name)}
                            </div>

                            {/* Name & Details */}
                            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#60a5fa', fontWeight: 600 }}>
                                {s.user?.name || 'Student Name'}
                            </h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                                <User size={12} /> {s.roll_number}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 24 }}>
                                <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                                    {s.department?.includes('BIO') ? 'BT' : s.department?.includes('COMP') ? 'CSE' : 'DEPT'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <GraduationCap size={12} /> Year {s.year || 1}
                                </span>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0', marginBottom: 16 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#10b981', fontSize: 18, fontWeight: 700 }}>{s.rating || 0}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                                        <Star size={10} /> Rating
                                    </div>
                                </div>
                                <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 700 }}>0</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                                        <Award size={10} /> Awards
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontSize: 13, fontWeight: 500 }}>
                                View Profile <ChevronRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
