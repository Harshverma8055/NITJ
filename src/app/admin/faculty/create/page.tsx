'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateFacultyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: 'Computer Science and Engineering',
        title: 'Professor'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Simplified API call for demonstration purposes
            alert('Faculty created successfully!');
            router.push('/admin/dashboard');
        } catch (error) {
            alert('Failed to create faculty.');
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
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Users size={24} color="#8b5cf6" /> Create Faculty Member
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px 0', fontSize: 14 }}>
                    Add a new faculty account to the system.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} placeholder="e.g., Dr. Rajesh Sharma" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Official Email</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} placeholder="e.g., sharmar@nitj.ac.in" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Title / Position</label>
                            <select value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                                <option>Professor</option>
                                <option>Associate Professor</option>
                                <option>Assistant Professor</option>
                                <option>Head of Department</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Temporary Password</label>
                            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Department</label>
                        <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                            <option>Computer Science and Engineering</option>
                            <option>Information Technology</option>
                            <option>Chemical Engineering</option>
                            <option>Mechanical Engineering</option>
                        </select>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        style={{ marginTop: 16, background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="spin" size={18} /> : 'Create Faculty Account'}
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
