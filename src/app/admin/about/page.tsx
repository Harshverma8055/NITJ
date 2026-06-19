'use client';

import { Code2, Heart, Shield, Sparkles, GraduationCap } from 'lucide-react';

export default function AboutPage() {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', color: 'white', paddingBottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 64 }}>
                <div style={{ 
                    width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                    boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)'
                }}>
                    <Shield size={32} color="white" />
                </div>
                <h1 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: -0.5 }}>Campus Pulse</h1>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="#6366f1" /> Campus Infrastructure Management System <Sparkles size={16} color="#6366f1" />
                </div>
            </div>

            {/* Faculty Mentor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f472b6', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>
                <GraduationCap size={16} /> FACULTY MENTOR & GUIDE
            </div>

            <div style={{ 
                background: '#13151A', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 16, 
                padding: '32px 64px', marginBottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 0 40px rgba(236, 72, 153, 0.1)'
            }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 16, boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}>
                    DU
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0' }}>Dr. Urvashi</h2>
                <div style={{ color: '#f472b6', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>Faculty Mentor</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Department of Computer Science & Engineering</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 32 }}>
                <Code2 size={16} /> DEVELOPMENT TEAM
            </div>

            {/* Project Leader */}
            <div style={{ 
                background: '#13151A', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, 
                padding: 32, width: '100%', marginBottom: 24, position: 'relative',
                boxShadow: '0 0 30px rgba(245,158,11,0.05)'
            }}>
                <div style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(245,158,11,0.2)' }}>
                    ⭐ PROJECT LEADER
                </div>
                
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                        HK
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>Harsh Kumar</h2>
                        <div style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 11, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 16 }}>
                            25103063
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px 0' }}>
                            Conceived, designed, and led the development of Campus Pulse from the ground up — architecting the full-stack infrastructure, database schema, and all core features.
                        </p>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Dept. of Computer Science & Engineering</div>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, width: '100%', marginBottom: 40 }}>
                {/* Hitesh */}
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 16, boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>H</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>Hitesh</h3>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 16 }}>Mechanical Engineering</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Contributed to system planning and cross-department workflow design for the maintenance management module.</p>
                </div>

                {/* Inderjeet */}
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 16, boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>I</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>Inderjeet</h3>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 16 }}>Electronics & Communication Engineering</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Assisted in system testing and IoT integration planning for smart campus infrastructure monitoring.</p>
                </div>

                {/* Hemant Kumar */}
                <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 16, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>HK</div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px 0' }}>Hemant Kumar</h3>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 16 }}>Computer Science & Engineering</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>Contributed to the frontend design discussions and student-facing feature ideation for the complaint module.</p>
                </div>
            </div>

            {/* Built With */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, width: '100%', textAlign: 'center', marginBottom: 40 }}>
                <h3 style={{ fontSize: 12, color: 'white', letterSpacing: 1, fontWeight: 700, margin: '0 0 24px 0' }}>BUILT WITH</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'PostgreSQL', 'Web Push API', 'Lucide Icons', 'Zod'].map(tech => (
                        <div key={tech} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                            {tech}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    Made with <Heart size={12} fill="#ef4444" color="#ef4444" /> for our Campus
                </div>
                <div>© 2026 Campus Pulse · All Rights Reserved</div>
            </div>
        </div>
    );
}
