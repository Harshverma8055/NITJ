'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, ArrowLeft, Loader2 } from 'lucide-react';

export default function PostAnnouncementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target: 'All Students'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Simplified API call for demonstration purposes
            alert('Announcement posted successfully to ' + formData.target + '!');
            router.push('/admin/dashboard');
        } catch (error) {
            alert('Failed to post announcement.');
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
                    <Megaphone size={24} color="#8b5cf6" /> Post Announcement
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 32px 0', fontSize: 14 }}>
                    Broadcast a message to specific departments or all students.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }} placeholder="e.g., Campus Maintenance Schedule" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Target Audience</label>
                        <select value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none' }}>
                            <option>All Students</option>
                            <option>Computer Science and Engineering</option>
                            <option>Information Technology</option>
                            <option>Chemical Engineering</option>
                            <option>Faculty Only</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Message Content</label>
                        <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={5} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px', borderRadius: 8, outline: 'none', resize: 'vertical' }} placeholder="Type your announcement here..."></textarea>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        style={{ marginTop: 16, background: '#8b5cf6', color: 'white', border: 'none', padding: '16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="spin" size={18} /> : 'Broadcast Announcement'}
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
