'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/department-router';

export default function CreateUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('STUDENT');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roll: '',
        department: 'Computer Science and Engineering',
        year: '1',
        staffDepartmentCode: 'ELECTRICAL_MAINT'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Include staff department name from lib if it's maintenance
            let staffDeptName = '';
            if (role === 'MAINTENANCE') {
                staffDeptName = DEPARTMENTS[formData.staffDepartmentCode as keyof typeof DEPARTMENTS]?.name || 'Maintenance Department';
            }

            const res = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role,
                    staffDepartmentName: staffDeptName
                })
            });

            if (res.ok) {
                alert('User created successfully!');
                router.push('/admin/users');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            <button 
                onClick={() => router.back()}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13 }}
            >
                <ArrowLeft size={16} /> Back to Management
            </button>

            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserPlus size={24} color="#8b5cf6" /> Create New User
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px 0', fontSize: 14 }}>
                    Add a Student, Maintenance Staff, or Admin to the Campus Pulse system.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>User Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid #8b5cf6', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none', fontWeight: 'bold' }}>
                            <option value="STUDENT">Student</option>
                            <option value="MAINTENANCE">Maintenance Staff</option>
                            <option value="ADMIN">System Admin</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Full Name {role === 'MAINTENANCE' && "(with Title)"}</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} placeholder={role === 'MAINTENANCE' ? "e.g. Mr. Akshay (Executive Engineer)" : "e.g. Ramesh Kumar"} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Email Address</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Temporary Password</label>
                            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                        </div>
                    </div>

                    {role === 'STUDENT' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Roll Number</label>
                                <input required type="text" value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Academic Department</label>
                                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                                        <option>Computer Science and Engineering</option>
                                        <option>Information Technology</option>
                                        <option>Chemical Engineering</option>
                                        <option>Mechanical Engineering</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Year</label>
                                    <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'MAINTENANCE' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Assigned Facility Department</label>
                            <select value={formData.staffDepartmentCode} onChange={e => setFormData({...formData, staffDepartmentCode: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                                {Object.values(DEPARTMENTS).map(dept => (
                                    <option key={dept.code} value={dept.code}>{dept.name} ({dept.code})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button 
                        disabled={loading}
                        type="submit" 
                        style={{ marginTop: 16, background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="spin" size={18} /> : `Create ${role === 'MAINTENANCE' ? 'Staff' : role === 'ADMIN' ? 'Admin' : 'Student'}`}
                    </button>
                </form>
            </div>
            <style jsx>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                option { background: #13151A; color: white; }
            `}</style>
        </div>
    );
}
