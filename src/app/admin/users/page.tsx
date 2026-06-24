'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());
import { Users, Search, RefreshCw, Edit2, Key, Trash2, MapPin, Star, Plus, ChevronDown } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
    roll: string;
    dept: string;
    year: string;
}

interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    department_code: string;
}

// Department options from department-router.ts
const DEPARTMENT_OPTIONS = [
    { code: 'ELECTRICAL_MAINT', name: 'Electrical Maintenance', shortName: 'Electrical', color: '#f59e0b' },
    { code: 'CIVIL_WORKS', name: 'Civil Works & Maintenance', shortName: 'Civil Works', color: '#92400e' },
    { code: 'PLUMBING_SANITATION', name: 'Plumbing & Sanitation', shortName: 'Plumbing', color: '#0ea5e9' },
    { code: 'NETWORK_IT', name: 'Network & IT Infrastructure', shortName: 'Network IT', color: '#6366f1' },
    { code: 'IT_CELL', name: 'IT Cell & Software Dev', shortName: 'IT Cell', color: '#7c3aed' },
    { code: 'ACADEMIC_TECH', name: 'Academic Technology', shortName: 'Academic Tech', color: '#2563eb' },
    { code: 'AV_SUPPORT', name: 'AV & Multimedia Support', shortName: 'AV Support', color: '#db2777' },
    { code: 'LAB_MAINT', name: 'Laboratory Maintenance', shortName: 'Lab Maint', color: '#059669' },
    { code: 'HOSTEL_MAINT', name: 'Hostel Maintenance', shortName: 'Hostel', color: '#10b981' },
    { code: 'MESS_MGMT', name: 'Mess & Cafeteria', shortName: 'Mess Mgmt', color: '#f97316' },
    { code: 'CAMPUS_SECURITY', name: 'Campus Security', shortName: 'Security', color: '#dc2626' },
    { code: 'RESEARCH_INFRA', name: 'Research Infrastructure', shortName: 'Research Infra', color: '#7c3aed' },
    { code: 'SPORTS_FACILITY', name: 'Sports Facilities', shortName: 'Sports', color: '#22c55e' },
    { code: 'HORTICULTURE', name: 'Horticulture & Landscaping', shortName: 'Horticulture', color: '#16a34a' },
    { code: 'TRANSPORT_PARKING', name: 'Transport & Parking', shortName: 'Transport', color: '#64748b' },
    { code: 'ESTATE_OFFICE', name: 'Estate & General Maintenance', shortName: 'Estate Office', color: '#78716c' },
    { code: 'STUDENT_WELFARE', name: 'Student Welfare', shortName: 'Student Welfare', color: '#ec4899' },
    { code: 'HEALTH_CENTRE', name: 'Health Centre', shortName: 'Health Centre', color: '#ef4444' },
    { code: 'LIBRARY_TECH', name: 'Library Technical Support', shortName: 'Library Tech', color: '#0891b2' },
];

function AdminUsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read initial states from URL query parameters
    const initialViewMode = (searchParams.get('view') as 'students' | 'staff') || 'students';
    const initialSearch = searchParams.get('q') || '';
    const initialDept = searchParams.get('dept') || 'All Departments';
    const initialYear = searchParams.get('year') || 'All';
    const initialRole = searchParams.get('role') || 'All Roles';
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    const [viewMode, setViewMode] = useState<'students' | 'staff'>(initialViewMode);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [deptFilter, setDeptFilter] = useState(initialDept);
    const [yearFilter, setYearFilter] = useState(initialYear);
    const [roleFilter, setRoleFilter] = useState(initialRole);
    const [page, setPage] = useState(initialPage);

    // Modals
    const [editingUser, setEditingUser] = useState<any>(null);
    const [resettingPasswordUser, setResettingPasswordUser] = useState<any>(null);
    const [deletingUser, setDeletingUser] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // Fetch data using useSWR
    const { data: studentsData, error: studentsError, isLoading: studentsLoading, mutate: mutateStudents } = useSWR('/api/admin/students', fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    });
    const { data: staffData, error: staffError, isLoading: staffLoading, mutate: mutateStaff } = useSWR('/api/staff', fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    });

    const students = studentsData?.students || [];
    const staffRaw = staffData?.staff || [];
    const staff = useMemo(() => {
        return staffRaw.map((s: any) => ({
            id: s.id,
            name: s.user?.name || 'Unknown',
            email: s.user?.email || 'No Email',
            role: s.role,
            department: s.department || 'General',
            department_code: s.department_code || ''
        }));
    }, [staffRaw]);

    const loading = studentsLoading || staffLoading;

    // Triggered after edits / deletes
    const fetchUsers = () => {
        mutateStudents();
        mutateStaff();
    };

    // Sync search params when they change (back/forward history)
    useEffect(() => {
        setViewMode((searchParams.get('view') as 'students' | 'staff') || 'students');
        setSearchQuery(searchParams.get('q') || '');
        setDeptFilter(searchParams.get('dept') || 'All Departments');
        setYearFilter(searchParams.get('year') || 'All');
        setRoleFilter(searchParams.get('role') || 'All Roles');
        setPage(parseInt(searchParams.get('page') || '1', 10));
    }, [searchParams]);

    const updateParams = (updates: Record<string, string | number>) => {
        const nextParams = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, val]) => {
            if (val === undefined || val === null || val === '') {
                nextParams.delete(key);
            } else {
                nextParams.set(key, val.toString());
            }
        });
        router.replace(`?${nextParams.toString()}`, { scroll: false });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });
            if (res.ok) {
                setEditingUser(null);
                fetchUsers();
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            alert('Error updating user');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${resettingPasswordUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            if (res.ok) {
                setResettingPasswordUser(null);
                setNewPassword('');
                alert('Password reset successfully!');
            } else {
                alert('Failed to reset password');
            }
        } catch (error) {
            alert('Error resetting password');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDeletingUser(null);
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            alert('Error deleting user');
        } finally {
            setActionLoading(false);
        }
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

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    // Filter computation
    const studentDepartments: string[] = useMemo(() => {
        const set = new Set<string>(students.map((s: Student) => getMappedDept(s.dept)));
        return ['All Departments', ...Array.from(set).sort()];
    }, [students]);

    const studentYears: string[] = useMemo(() => {
        const set = new Set<string>(students.map((s: Student) => s.year));
        return ['All', ...Array.from(set).sort()];
    }, [students]);

    const staffDepartments: string[] = useMemo(() => {
        const set = new Set<string>(staff.map((s: Staff) => s.department));
        return ['All Departments', ...Array.from(set).sort()];
    }, [staff]);

    const staffRoles: string[] = useMemo(() => {
        const set = new Set<string>(staff.map((s: Staff) => s.role));
        return ['All Roles', ...Array.from(set).sort()];
    }, [staff]);

    const filteredStudents = useMemo(() => {
        return students.filter((s: Student) => {
            const mappedDept = getMappedDept(s.dept);
            const searchLower = searchQuery.toLowerCase();
            
            const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                                  s.email.toLowerCase().includes(searchLower) ||
                                  s.roll.toLowerCase().includes(searchLower) ||
                                  mappedDept.toLowerCase().includes(searchLower);
            const matchesDept = deptFilter === 'All Departments' || mappedDept === deptFilter;
            const matchesYear = yearFilter === 'All' || s.year === yearFilter;
            return matchesSearch && matchesDept && matchesYear;
        }).sort((a: Student, b: Student) => (a.roll || '').localeCompare(b.roll || ''));
    }, [students, searchQuery, deptFilter, yearFilter]);

    const filteredStaff = useMemo(() => {
        return staff.filter((s: Staff) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                                  s.email.toLowerCase().includes(searchLower) ||
                                  s.department.toLowerCase().includes(searchLower);
            const matchesDept = deptFilter === 'All Departments' || s.department === deptFilter;
            const matchesRole = roleFilter === 'All Roles' || s.role === roleFilter;
            return matchesSearch && matchesDept && matchesRole;
        }).sort((a: Staff, b: Staff) => {
            if (a.role === b.role) {
                return a.name.localeCompare(b.name);
            }
            if (a.role === 'ADMIN') return -1;
            if (b.role === 'ADMIN') return 1;
            if (a.role === 'MAINTENANCE') return -1;
            if (b.role === 'MAINTENANCE') return 1;
            return a.role.localeCompare(b.role);
        });
    }, [staff, searchQuery, deptFilter, roleFilter]);

    const ITEMS_PER_PAGE = 50;

    const totalStudentPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStudents, page]);

    const totalStaffPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE) || 1;
    const paginatedStaff = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredStaff, page]);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, gap: 40 }}>
                <div style={{ flexShrink: 0 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Users size={28} color="#6366f1" /> User Directory
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
                        Manage students, faculty, maintenance staff, and admins.
                    </p>
                </div>
                
                <button 
                    onClick={() => router.push('/admin/users/create')}
                    style={{ 
                        background: '#6366f1', color: 'white', border: 'none', 
                        padding: '12px 24px', borderRadius: 12, fontWeight: 600, display: 'flex', 
                        alignItems: 'center', gap: 8, cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    <Plus size={18} /> Create User
                </button>
            </div>

            {/* Toggle Students/Staff */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
                <button 
                    onClick={() => { 
                        setViewMode('students'); 
                        setDeptFilter('All Departments'); 
                        setSearchQuery(''); 
                        setPage(1);
                        updateParams({ view: 'students', dept: 'All Departments', q: '', page: 1, year: 'All', role: 'All Roles' });
                    }}
                    style={{
                        background: viewMode === 'students' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: viewMode === 'students' ? '#818cf8' : 'rgba(255,255,255,0.6)',
                        border: 'none', padding: '8px 24px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Students ({students.length})
                </button>
                <button 
                    onClick={() => { 
                        setViewMode('staff'); 
                        setDeptFilter('All Departments'); 
                        setSearchQuery(''); 
                        setPage(1);
                        updateParams({ view: 'staff', dept: 'All Departments', q: '', page: 1, year: 'All', role: 'All Roles' });
                    }}
                    style={{
                        background: viewMode === 'staff' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: viewMode === 'staff' ? '#818cf8' : 'rgba(255,255,255,0.6)',
                        border: 'none', padding: '8px 24px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Staff ({staff.length})
                </button>
            </div>

            {/* Filters Area */}
            <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: '20px',
                marginBottom: 24,
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap'
            }}>
                {/* Search */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>SEARCH</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder={viewMode === 'students' ? "Search students by name, email, roll..." : "Search staff by name, email..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                                updateParams({ q: e.target.value, page: 1 });
                            }}
                            style={{ 
                                width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', 
                                color: 'white', padding: '12px 16px 12px 44px', borderRadius: 12, fontSize: 14, outline: 'none'
                            }} 
                        />
                    </div>
                </div>

                {/* Filters based on mode */}
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>DEPARTMENT</label>
                    <select 
                        value={deptFilter}
                        onChange={(e) => {
                            setDeptFilter(e.target.value);
                            setPage(1);
                            updateParams({ dept: e.target.value, page: 1 });
                        }}
                        className="form-select"
                        style={{ width: '100%', fontSize: 14, padding: '12px 36px 12px 16px' }}
                    >
                        {(viewMode === 'students' ? studentDepartments : staffDepartments).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {viewMode === 'students' ? (
                    <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>YEAR</label>
                        <select 
                            value={yearFilter}
                            onChange={(e) => {
                                setYearFilter(e.target.value);
                                setPage(1);
                                updateParams({ year: e.target.value, page: 1 });
                            }}
                            className="form-select"
                            style={{ width: '100%', fontSize: 14, padding: '12px 36px 12px 16px' }}
                        >
                            {studentYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                ) : (
                    <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>ROLE</label>
                        <select 
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(1);
                                updateParams({ role: e.target.value, page: 1 });
                            }}
                            className="form-select"
                            style={{ width: '100%', fontSize: 14, padding: '12px 36px 12px 16px' }}
                        >
                            {staffRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button 
                        onClick={fetchUsers}
                        style={{ 
                            width: 46, height: 46, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={18} className={loading ? "spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>#</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>NAME & EMAIL</th>
                                {viewMode === 'students' ? (
                                    <>
                                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>ROLL NO.</th>
                                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>DEPARTMENT</th>
                                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>YEAR</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>ROLE</th>
                                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>DEPARTMENT</th>
                                    </>
                                )}
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td>
                                </tr>
                            ) : (viewMode === 'students' ? filteredStudents.length === 0 : filteredStaff.length === 0) ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>No {viewMode} found matching your criteria.</td>
                                </tr>
                            ) : (
                                (viewMode === 'students' ? paginatedStudents : paginatedStaff).map((user: any, i: number) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '16px 24px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                                            {(page - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: viewMode === 'students' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: viewMode === 'students' ? '#818cf8' : '#34d399',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 13, fontWeight: 700
                                                }}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'white' }}>{user.name}</div>
                                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {viewMode === 'students' ? (
                                            <>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '4px 10px', borderRadius: 6, display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                                                        {user.roll}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#60a5fa', fontWeight: 500, fontSize: 14 }}>
                                                    {getMappedDept(user.dept)}
                                                </td>
                                                <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                                                    Year {user.year}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ 
                                                        background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : user.role === 'MAINTENANCE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                        color: user.role === 'ADMIN' ? '#ef4444' : user.role === 'MAINTENANCE' ? '#f59e0b' : '#3b82f6',
                                                        padding: '4px 10px', borderRadius: 6, display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: 0.5
                                                    }}>
                                                        {user.role}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                                                    {user.department}
                                                </td>
                                            </>
                                        )}
                                        
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button title="Edit User" onClick={() => setEditingUser({ ...user, originalRole: viewMode === 'students' ? 'STUDENT' : user.role })} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button title="Reset Password" onClick={() => setResettingPasswordUser(user)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
                                                    <Key size={14} />
                                                </button>
                                                <button title="Delete User" onClick={() => setDeletingUser(user)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modals */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500 }}>
                        <h2 style={{ marginTop: 0, marginBottom: 24 }}>Edit User</h2>
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Name</label>
                                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Email</label>
                                <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                            </div>
                            {editingUser.originalRole === 'STUDENT' ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Roll Number</label>
                                        <input type="text" value={editingUser.roll} onChange={e => setEditingUser({...editingUser, roll: e.target.value})} required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Department</label>
                                            <input type="text" value={editingUser.dept} onChange={e => setEditingUser({...editingUser, dept: e.target.value})} required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Year</label>
                                            <input type="number" value={editingUser.year} onChange={e => setEditingUser({...editingUser, year: e.target.value})} required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Role Selector */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Role</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={editingUser.role}
                                                onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: 14 }}
                                            >
                                                <option value="MAINTENANCE" style={{ background: '#1a1c23' }}>Maintenance Staff</option>
                                                <option value="ADMIN" style={{ background: '#1a1c23' }}>Admin</option>
                                            </select>
                                            <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>

                                    {/* Category / Department Selector */}
                                    {editingUser.role === 'MAINTENANCE' && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Category / Department</label>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={editingUser.department_code || ''}
                                                    onChange={e => {
                                                        const code = e.target.value;
                                                        const dept = DEPARTMENT_OPTIONS.find(d => d.code === code);
                                                        setEditingUser({
                                                            ...editingUser,
                                                            department_code: code,
                                                            department: dept?.name || code
                                                        });
                                                    }}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: 14 }}
                                                >
                                                    <option value="" disabled style={{ background: '#1a1c23' }}>Select a category...</option>
                                                    {DEPARTMENT_OPTIONS.map(d => (
                                                        <option key={d.code} value={d.code} style={{ background: '#1a1c23' }}>
                                                            {d.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            </div>
                                            {/* Current assignment badge */}
                                            {editingUser.department_code && (() => {
                                                const dept = DEPARTMENT_OPTIONS.find(d => d.code === editingUser.department_code);
                                                return dept ? (
                                                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Assigned to: <strong style={{ color: dept.color }}>{dept.shortName}</strong></span>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}
                                </>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: '12px', background: '#6366f1', border: 'none', color: 'white', borderRadius: 8, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>{actionLoading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resettingPasswordUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400 }}>
                        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Reset Password</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: 14 }}>Enter a new password for {resettingPasswordUser.name}.</p>
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <input type="text" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 14px', borderRadius: 8, outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                <button type="button" onClick={() => setResettingPasswordUser(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: '12px', background: '#fbbf24', border: 'none', color: '#000', fontWeight: 600, borderRadius: 8, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>{actionLoading ? 'Resetting...' : 'Reset'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.1)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Trash2 size={24} />
                        </div>
                        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Delete User</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: 14 }}>Are you sure you want to delete {deletingUser.name}? This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={() => setDeletingUser(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                                            <button type="button" onClick={handleDeleteConfirm} disabled={actionLoading} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 600, borderRadius: 8, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
                       {/* Pagination Controls */}
            {!loading && (viewMode === 'students' ? filteredStudents.length : filteredStaff.length) > 0 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: 20, 
                    padding: '12px 24px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: 12,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.6)'
                }}>
                    <div>
                        Showing{' '}
                        <strong style={{ color: 'white' }}>
                            {Math.min((page - 1) * ITEMS_PER_PAGE + 1, (viewMode === 'students' ? filteredStudents.length : filteredStaff.length))}
                        </strong>
                        {' '}-{' '}
                        <strong style={{ color: 'white' }}>
                            {Math.min(page * ITEMS_PER_PAGE, (viewMode === 'students' ? filteredStudents.length : filteredStaff.length))}
                        </strong>
                        {' '}of{' '}
                        <strong style={{ color: 'white' }}>
                            {viewMode === 'students' ? filteredStudents.length : filteredStaff.length}
                        </strong>
                        {' '}{viewMode}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            disabled={page === 1}
                            onClick={() => {
                                const nextPage = page - 1;
                                setPage(nextPage);
                                updateParams({ page: nextPage });
                            }}
                            style={{
                                background: page === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                color: page === 1 ? 'rgba(255,255,255,0.2)' : 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: 8,
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: 12,
                                transition: 'all 0.2s'
                            }}
                        >
                            Previous
                        </button>
                        <span>
                            Page <strong style={{ color: 'white' }}>{page}</strong> of{' '}
                            <strong style={{ color: 'white' }}>{viewMode === 'students' ? totalStudentPages : totalStaffPages}</strong>
                        </span>
                        <button
                            disabled={page === (viewMode === 'students' ? totalStudentPages : totalStaffPages)}
                            onClick={() => {
                                const nextPage = page + 1;
                                setPage(nextPage);
                                updateParams({ page: nextPage });
                            }}
                            style={{
                                background: page === (viewMode === 'students' ? totalStudentPages : totalStaffPages) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                color: page === (viewMode === 'students' ? totalStudentPages : totalStaffPages) ? 'rgba(255,255,255,0.2)' : 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: 8,
                                cursor: page === (viewMode === 'students' ? totalStudentPages : totalStaffPages) ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: 12,
                                transition: 'all 0.2s'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #6366f1; animation: spin 1s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><div className="spinner"></div></div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
