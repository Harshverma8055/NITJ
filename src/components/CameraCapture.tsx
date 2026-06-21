'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera, RotateCcw, ZoomIn } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef  = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [streaming,   setStreaming]   = useState(false);
    const [facingMode,  setFacingMode]  = useState<'environment' | 'user'>('environment');
    const [error,       setError]       = useState('');
    const [captured,    setCaptured]    = useState<string | null>(null); // preview data URL
    const [capturedFile,setCapturedFile]= useState<File | null>(null);
    const [loading,     setLoading]     = useState(true);

    const startCamera = useCallback(async (facing: 'environment' | 'user') => {
        setError('');
        setLoading(true);
        setStreaming(false);
        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        
        // Safety check for browser support and secure context
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Your browser does not support direct camera streaming or this page is not served over secure HTTPS. Please use the native camera fallback below.');
            setLoading(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStreaming(true);
        } catch (err: unknown) {
            setError((err as Error).message || 'Could not access camera. Please allow camera permission.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Start camera on mount
    useEffect(() => {
        startCamera('environment');
        return () => {
            // Cleanup stream on unmount
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [startCamera]);

    const flipCamera = async () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        setCaptured(null);
        setCapturedFile(null);
        await startCamera(next);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Mirror if using front camera
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCaptured(dataUrl);
        // Convert to File
        canvas.toBlob(blob => {
            if (!blob) return;
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setCapturedFile(file);
        }, 'image/jpeg', 0.88);
        // Pause the video stream while reviewing
        video.pause();
    };

    const retake = () => {
        setCaptured(null);
        setCapturedFile(null);
        if (videoRef.current) videoRef.current.play();
    };

    const confirmCapture = () => {
        if (!capturedFile) return;
        streamRef.current?.getTracks().forEach(t => t.stop());
        onCapture(capturedFile);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'rgba(0,0,0,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Camera size={18} color="#06b6d4" /> Camera
                </span>
                <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose(); }}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} color="white" />
                </button>
            </div>

            {/* Viewfinder */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
                {/* Live video */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        display: captured ? 'none' : 'block',
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    }}
                />
                {/* Captured preview */}
                {captured && (
                    <img src={captured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
                {/* Canvas (hidden, used for capture) */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Loading state */}
                {loading && !error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Starting camera...</span>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
                        <span style={{ fontSize: 48 }}>📵</span>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Camera Access Issue</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{error}</div>
                        
                        {/* Fallback Option */}
                        <div style={{ marginTop: 8, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <label style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: 50,
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onCapture(file);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                                📷 Take Photo via Device Camera
                            </label>
                            
                            {typeof window !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && (
                                <button
                                    onClick={() => startCamera(facingMode)}
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                                    Try Direct Stream Again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Flip camera button (top right, only when live) */}
                {streaming && !captured && !error && (
                    <button
                        onClick={flipCamera}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%', width: 44, height: 44,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                        <RotateCcw size={20} color="white" />
                    </button>
                )}
            </div>

            {/* Bottom Controls */}
            <div style={{
                padding: '24px 32px', background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
                {captured ? (
                    // Review mode: Retake or Use Photo
                    <>
                        <button
                            onClick={retake}
                            style={{
                                background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)',
                                color: 'white', padding: '12px 28px', borderRadius: 50, fontWeight: 600,
                                fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                            <RotateCcw size={16} /> Retake
                        </button>
                        <button
                            onClick={confirmCapture}
                            disabled={!capturedFile}
                            style={{
                                background: '#10b981', border: 'none',
                                color: 'white', padding: '14px 36px', borderRadius: 50, fontWeight: 700,
                                fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                            }}>
                            ✓ Use Photo
                        </button>
                    </>
                ) : (
                    // Live mode: Capture button
                    <button
                        onClick={capturePhoto}
                        disabled={!streaming || !!error}
                        style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: streaming && !error ? 'white' : 'rgba(255,255,255,0.3)',
                            border: '4px solid rgba(255,255,255,0.3)',
                            cursor: streaming && !error ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: streaming ? '0 0 0 6px rgba(255,255,255,0.15)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                        <Camera size={28} color={streaming ? '#000' : '#666'} />
                    </button>
                )}
            </div>
        </div>
    );
}
