'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateStudentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roll: '',
        password: '',
        department: 'Computer Science and Engineering',
        year: '1'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Wait this is an API route we need to make
            const res = await fetch('/api/admin/students/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Student created successfully!');
                router.push('/admin/students');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Failed to create student.');
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
                    <UserPlus size={24} color="#8b5cf6" /> Create New Student
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px 0', fontSize: 14 }}>
                    Manually add a student to the NITJ Final Project system.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Institute Email</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Roll Number</label>
                            <input required type="text" value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Temporary Password</label>
                            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Department</label>
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

                    <button 
                        disabled={loading}
                        type="submit" 
                        style={{ marginTop: 16, background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="spin" size={18} /> : 'Create Student'}
                    </button>
                </form>
            </div>
            <style jsx>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
