'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, MapPin, Send, Camera, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function NewComplaintPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [zone, setZone] = useState('');
    const [building, setBuilding] = useState('');
    const [floor, setFloor] = useState('');
    const [room, setRoom] = useState('');
    const [severity, setSeverity] = useState('MODERATE');
    const [isEmergency, setIsEmergency] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [compressing, setCompressing] = useState(false);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    
    const [gpsLat, setGpsLat] = useState<number | null>(null);
    const [gpsLng, setGpsLng] = useState<number | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const STEPS = [
        { num: 1, title: 'Category & Severity' },
        { num: 2, title: 'Location' },
        { num: 3, title: 'Details' },
        { num: 4, title: 'Evidence' },
        { num: 5, title: 'Review & Submit' }
    ];

    const captureLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation is not supported by your browser");
            return;
        }
        setLocationStatus("Locating...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGpsLat(position.coords.latitude);
                setGpsLng(position.coords.longitude);
                setLocationStatus("Location captured successfully ✓");
            },
            () => setLocationStatus("Unable to retrieve your location")
        );
    };

    // Client-side image compression using Canvas API
    const compressImage = (file: File, maxWidth = 1200, quality = 0.6): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Scale down if wider than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(file); return; }

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        const compressed = new File(
                            [blob],
                            file.name.replace(/\.[^.]+$/, '.jpg'),
                            { type: 'image/jpeg' }
                        );
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = URL.createObjectURL(file);
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalSize(file.size);

            // Compress images automatically, pass videos through
            if (file.type.startsWith('image/')) {
                setCompressing(true);
                try {
                    const compressed = await compressImage(file);
                    setMediaFile(compressed);
                    setCompressedSize(compressed.size);
                    setPreviewUrl(URL.createObjectURL(compressed));
                } catch {
                    // Fallback: use original if compression fails
                    setMediaFile(file);
                    setCompressedSize(file.size);
                    setPreviewUrl(URL.createObjectURL(file));
                }
                setCompressing(false);
            } else {
                // Video — no compression
                setMediaFile(file);
                setCompressedSize(file.size);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const nextStep = () => {
        if (step === 1 && (!category || !severity)) {
            setError('Please select a category and severity');
            return;
        }
        if (step === 2 && !zone) {
            setError('Please select a campus zone');
            return;
        }
        if (step === 3 && (!title || !description)) {
            setError('Please provide a title and detailed description');
            return;
        }
        setError('');
        setStep(s => Math.min(5, s + 1));
    };

    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('zone', zone);
            if (building) formData.append('building', building);
            if (floor) formData.append('floor', floor);
            if (room) formData.append('room', room);
            formData.append('severity', severity);
            formData.append('isEmergency', String(isEmergency));
            formData.append('isAnonymous', String(isAnonymous));
            if (gpsLat && gpsLng) {
                formData.append('gpsLat', String(gpsLat));
                formData.append('gpsLng', String(gpsLng));
            }
            if (mediaFile) formData.append('media', mediaFile);

            const res = await fetch('/api/complaints', { method: 'POST', body: formData });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit issue');
            }
            
            if (data.complaintId) {
                router.push(`/student/complaints/${data.complaintId}?submitted=1`);
            } else {
                router.push('/student/complaints?success=true');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit issue');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: 32, margin: '0 0 12px 0', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    Report a Campus Issue <span style={{ fontSize: 28 }}>🏗️</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 15 }}>
                    Fill in the details below. Your report will be reviewed by the admin and assigned to maintenance staff.
                </p>
            </div>

            {/* Progress Tracker */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 40, gap: 16 }}>
                {STEPS.map((s, i) => (
                    <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ 
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: step === s.num ? '#6366f1' : step > s.num ? '#10b981' : 'rgba(255,255,255,0.05)',
                            color: step >= s.num ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 14,
                            border: `2px solid ${step === s.num ? '#818cf8' : step > s.num ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                            transition: 'all 0.3s'
                        }}>
                            {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                        </div>
                        {step === s.num && (
                            <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, position: 'absolute', transform: 'translateY(40px)' }}>
                                {s.title}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: 16, borderRadius: 12, color: '#f87171', marginBottom: 24, textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {/* Form Container */}
            <div style={{ background: '#13151A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, position: 'relative', overflow: 'hidden' }}>
                
                {/* Step 1: Category & Severity */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px 0' }}>Category & Urgency</h2>
                        
                        <label style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, padding: 20, borderRadius: 16, cursor: 'pointer',
                            background: isEmergency ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isEmergency ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            marginBottom: 24, transition: 'all 0.2s'
                        }}>
                            <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} style={{ width: 24, height: 24, accentColor: '#ef4444' }} />
                            <div>
                                <div style={{ color: isEmergency ? '#ef4444' : 'white', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    🚨 Mark as EMERGENCY
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Safety hazard / immediate risk to life or property</div>
                            </div>
                        </label>

                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Issue Category *</label>
                            <select 
                                style={{ width: '100%', padding: '16px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none', appearance: 'none', fontSize: 15 }}
                                value={category} onChange={(e) => setCategory(e.target.value)} required
                            >
                                <option value="" disabled>-- Select Category --</option>
                                <option value="IT_NETWORK">IT & Network</option>
                                <option value="ELECTRICAL">Electrical & AC</option>
                                <option value="PLUMBING">Plumbing & Water</option>
                                <option value="CIVIL">Civil Works (Walls, Floors)</option>
                                <option value="SANITATION">Sanitation & Cleaning</option>
                                <option value="FURNITURE">Furniture & Fixtures</option>
                                <option value="EQUIPMENT">Lab/Office Equipment</option>
                                <option value="SAFETY">Safety & Security</option>
                                <option value="HOSTEL">Hostel & Mess</option>
                                <option value="SPORTS">Sports & Recreation</option>
                                <option value="CAFETERIA">Cafeteria</option>
                                <option value="OTHER">Other Issues</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Severity Level *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {[
                                    { id: 'LOW', label: 'LOW', desc: 'Minor inconvenience', color: '#10b981' },
                                    { id: 'MODERATE', label: 'MODERATE', desc: 'Affects daily use', color: '#f59e0b' },
                                    { id: 'HIGH', label: 'HIGH', desc: 'Major disruption', color: '#f97316' },
                                    { id: 'CRITICAL', label: 'CRITICAL', desc: 'Dangerous condition', color: '#ef4444' }
                                ].map(sev => (
                                    <div 
                                        key={sev.id} onClick={() => setSeverity(sev.id)}
                                        style={{ 
                                            padding: 20, borderRadius: 12, cursor: 'pointer',
                                            background: severity === sev.id ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${severity === sev.id ? sev.color : 'rgba(255,255,255,0.05)'}`,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ color: sev.color, fontWeight: 700, marginBottom: 4 }}>{sev.label}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{sev.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={24} color="#6366f1" /> Location Details
                        </h2>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Campus Zone *</label>
                            <select 
                                style={{ width: '100%', padding: '16px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none', appearance: 'none', fontSize: 15 }}
                                value={zone} onChange={(e) => setZone(e.target.value)} required
                            >
                                <option value="" disabled>-- Select Zone --</option>
                                <option value="ACADEMIC_BLOCK">Academic Block</option>
                                <option value="HOSTEL_BOYS">Boys Hostel Area</option>
                                <option value="HOSTEL_GIRLS">Girls Hostel Area</option>
                                <option value="LIBRARY">Central Library</option>
                                <option value="LAB">Laboratories</option>
                                <option value="SPORTS_COMPLEX">Sports Complex</option>
                                <option value="CAFETERIA">Cafeteria</option>
                                <option value="PARKING">Parking Area</option>
                                <option value="ROAD">Campus Roads</option>
                                <option value="MAIN_GATE">Main Gate</option>
                                <option value="AUDITORIUM">Auditorium</option>
                                <option value="ADMIN_BLOCK">Admin Block</option>
                                <option value="OTHER">Other Location</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Building / Block</label>
                                <input type="text" placeholder="e.g. Block A" value={building} onChange={e => setBuilding(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Floor</label>
                                <input type="text" placeholder="e.g. 2nd Floor" value={floor} onChange={e => setFloor(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Room / Area</label>
                                <input type="text" placeholder="e.g. Room 204" value={room} onChange={e => setRoom(e.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#10b981' }}>
                                    <MapPin size={18} /> GPS Auto-Capture
                                </div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                    {locationStatus || 'Optional but highly recommended for outdoor issues.'}
                                </div>
                            </div>
                            <button type="button" onClick={captureLocation} style={{ background: gpsLat ? '#10b981' : 'transparent', color: gpsLat ? 'white' : '#10b981', border: `1px solid ${gpsLat ? '#10b981' : 'rgba(16,185,129,0.5)'}`, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                {gpsLat ? 'Captured ✓' : 'Detect Location'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            📄 Issue Details
                        </h2>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Title * ({title.length}/200)</label>
                            <input 
                                type="text" maxLength={200}
                                style={{ width: '100%', padding: '16px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none', fontSize: 15 }}
                                placeholder="Short, clear description of the problem"
                                value={title} onChange={(e) => setTitle(e.target.value)} required
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Description * ({description.length}/2000)</label>
                            <textarea 
                                style={{ width: '100%', padding: '16px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', outline: 'none', minHeight: 160, resize: 'vertical', fontSize: 15 }}
                                placeholder="Describe the issue in detail: what is damaged, when you noticed it, how it affects students..."
                                value={description} onChange={(e) => setDescription(e.target.value)} required
                            />
                        </div>

                        <label style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, padding: 20, borderRadius: 16, cursor: 'pointer',
                            background: isAnonymous ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isAnonymous ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            transition: 'all 0.2s'
                        }}>
                            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} style={{ width: 24, height: 24, accentColor: '#6366f1' }} />
                            <div>
                                <div style={{ color: isAnonymous ? '#818cf8' : 'white', fontWeight: 600, fontSize: 15 }}>
                                    Submit Anonymously
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Your name won't be shown publicly</div>
                            </div>
                        </label>
                    </div>
                )}

                {/* Step 4: Evidence */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ImageIcon size={24} color="#6366f1" /> Upload Evidence
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontSize: 15 }}>
                            Attach photos/videos of the issue. Images are auto-compressed to save storage. Optional but strongly recommended.
                        </p>

                        <div style={{ 
                            border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 24, padding: previewUrl ? 32 : 60,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.02)', position: 'relative', cursor: compressing ? 'wait' : 'pointer'
                        }}>
                            <input 
                                type="file" accept="image/*,video/*" 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: compressing ? 'wait' : 'pointer' }}
                                onChange={handleFileChange}
                                disabled={compressing}
                            />
                            {compressing ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                                    <div style={{ color: '#818cf8', fontWeight: 600, fontSize: 16 }}>Compressing image...</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>Optimizing for storage</div>
                                </div>
                            ) : previewUrl ? (
                                <div style={{ textAlign: 'center', width: '100%' }}>
                                    <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, marginBottom: 16 }} />
                                    <div style={{ color: '#818cf8', fontWeight: 600 }}>{mediaFile?.name}</div>
                                    {originalSize > 0 && compressedSize > 0 && originalSize !== compressedSize && (
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12,
                                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                            padding: '8px 16px', borderRadius: 20, fontSize: 13
                                        }}>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>{formatFileSize(originalSize)}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>{formatFileSize(compressedSize)}</span>
                                            <span style={{ color: '#10b981', fontWeight: 600 }}>({Math.round((1 - compressedSize / originalSize) * 100)}% saved)</span>
                                        </div>
                                    )}
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>Click to change file</div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                    <Camera size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
                                    <div style={{ fontSize: 18, color: 'white', fontWeight: 600, marginBottom: 8 }}>Drop files here or <span style={{ color: '#818cf8' }}>click to browse</span></div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Images auto-compressed • 0/1 files added</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            👁️ Review Your Complaint
                        </h2>

                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Category</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{category.replace('_', ' ')}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Severity</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{severity}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Zone</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{zone.replace('_', ' ')}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Location</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{[building, floor, room].filter(Boolean).join(', ') || 'Not specified'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Title</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{title}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Anonymous</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{isAnonymous ? 'Yes' : 'No'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Emergency</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{isEmergency ? 'Yes' : 'No'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Evidence files</div>
                                <div style={{ color: 'white', fontSize: 15 }}>{mediaFile ? '1 file attached' : '0 files attached'}</div>
                            </div>
                            <div style={{ padding: 20 }}>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Description:</div>
                                <div style={{ color: 'white', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12 }}>
                                    {description}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: 16, marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
                    {step > 1 && (
                        <button 
                            type="button" onClick={prevStep}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', 
                                padding: '16px 24px', borderRadius: 12, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'background 0.2s' 
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <ArrowLeft size={20} /> Back
                        </button>
                    )}
                    
                    {step < 5 ? (
                        <button 
                            type="button" onClick={nextStep}
                            style={{ 
                                flex: 1, background: '#6366f1', color: 'white', border: 'none', 
                                padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'background 0.2s' 
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                        >
                            Next <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button 
                            type="button" onClick={handleSubmit} disabled={submitting}
                            style={{ 
                                flex: 1, background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', border: 'none', 
                                padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 10px 25px rgba(139,92,246,0.3)' 
                            }}
                        >
                            {submitting ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : <><CheckCircle2 size={20} /> Submit Complaint</>}
                        </button>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
