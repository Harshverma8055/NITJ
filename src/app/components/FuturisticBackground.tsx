'use client';

import { useEffect, useRef } from 'react';

export default function FuturisticBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const COLORS = [
            { r: 99, g: 102, b: 241 }, { r: 139, g: 92, b: 246 },
            { r: 16, g: 185, b: 129 }, { r: 14, g: 165, b: 233 },
        ];

        interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; size: number; color: string; alpha: number; pulse: number; pulseSpeed: number; }
        const particles: Particle[] = [];
        for (let i = 0; i < 100; i++) {
            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            particles.push({ x: (Math.random() - 0.5) * width * 2, y: (Math.random() - 0.5) * height * 2, z: Math.random() * 1500 + 100, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, vz: -(Math.random() * 1.5 + 0.3), size: Math.random() * 3 + 1, color: `${c.r}, ${c.g}, ${c.b}`, alpha: Math.random() * 0.6 + 0.2, pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.03 + 0.01 });
        }

        const mousePos = { x: width / 2, y: height / 2 };

        function animate() {
            ctx!.clearRect(0, 0, width, height);
            const parallaxX = (mousePos.x - width / 2) * 0.02;
            const parallaxY = (mousePos.y - height / 2) * 0.02;

            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.z += p.vz; p.pulse += p.pulseSpeed;
                if (p.z <= 1) { p.z = 1500; p.x = (Math.random() - 0.5) * width * 2; p.y = (Math.random() - 0.5) * height * 2; }
                const scale = 600 / (600 + p.z);
                const px = (p.x + parallaxX) * scale + width / 2;
                const py = (p.y + parallaxY) * scale + height / 2;
                const pSize = p.size * scale * 2;
                const depthAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse)) * Math.min(1, scale * 1.5);
                if (px > -50 && px < width + 50 && py > -50 && py < height + 50) {
                    ctx!.beginPath();
                    ctx!.fillStyle = `rgba(${p.color}, ${depthAlpha})`;
                    ctx!.arc(px, py, pSize, 0, Math.PI * 2);
                    ctx!.fill();
                }
            });
            animRef.current = requestAnimationFrame(animate);
        }

        const handleMouse = (e: MouseEvent) => { mousePos.x = e.clientX; mousePos.y = e.clientY; };
        const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
        window.addEventListener('mousemove', handleMouse);
        window.addEventListener('resize', handleResize);
        animate();
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('mousemove', handleMouse); window.removeEventListener('resize', handleResize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}
