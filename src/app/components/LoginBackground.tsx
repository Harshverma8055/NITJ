'use client';

import { useEffect, useRef } from 'react';

export default function LoginBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        let w = window.innerWidth;
        let h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        const mouse = { x: w / 2, y: h / 2, active: false };

        interface Star { x: number; y: number; size: number; alpha: number; twinkle: number; twinkleSpeed: number; depth: number; }
        const stars: Star[] = [];
        for (let i = 0; i < 300; i++) {
            const depth = Math.random();
            stars.push({ x: Math.random() * w, y: Math.random() * h, size: 0.3 + depth * 2, alpha: 0.2 + depth * 0.6, twinkle: Math.random() * Math.PI * 2, twinkleSpeed: 0.01 + Math.random() * 0.04, depth });
        }

        interface Nebula { x: number; y: number; radius: number; color1: number[]; color2: number[]; driftX: number; driftY: number; breathPhase: number; breathSpeed: number; }
        const nebulae: Nebula[] = [
            { x: w * 0.25, y: h * 0.35, radius: 300, color1: [99, 102, 241], color2: [139, 92, 246], driftX: 0.15, driftY: 0.08, breathPhase: 0, breathSpeed: 0.003 },
            { x: w * 0.75, y: h * 0.25, radius: 250, color1: [16, 185, 129], color2: [14, 165, 233], driftX: -0.12, driftY: 0.1, breathPhase: 1.5, breathSpeed: 0.004 },
            { x: w * 0.6, y: h * 0.7, radius: 280, color1: [168, 85, 247], color2: [244, 63, 94], driftX: 0.1, driftY: -0.06, breathPhase: 3, breathSpeed: 0.002 }
        ];

        let time = 0;

        function animate() {
            time += 0.016;
            ctx.clearRect(0, 0, w, h);

            nebulae.forEach(n => {
                n.breathPhase += n.breathSpeed;
                n.x += n.driftX; n.y += n.driftY;
                if (n.x > w + n.radius) n.x = -n.radius;
                if (n.x < -n.radius) n.x = w + n.radius;
                if (n.y > h + n.radius) n.y = -n.radius;
                if (n.y < -n.radius) n.y = h + n.radius;
                const r = n.radius * (1 + 0.12 * Math.sin(n.breathPhase));
                const g1 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
                g1.addColorStop(0, `rgba(${n.color1[0]},${n.color1[1]},${n.color1[2]}, 0.07)`);
                g1.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill();
            });

            stars.forEach(s => {
                s.twinkle += s.twinkleSpeed;
                const a = s.alpha * (0.4 + 0.6 * Math.sin(s.twinkle));
                let px = s.x; let py = s.y;
                if (mouse.active) { px += (mouse.x - w / 2) * s.depth * 8 / w * -1; py += (mouse.y - h / 2) * s.depth * 8 / h * -1; }
                ctx.beginPath(); ctx.arc(px, py, s.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(220, 225, 255, ${a})`; ctx.fill();
            });

            animRef.current = requestAnimationFrame(animate);
        }

        const onMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
        const onLeave = () => { mouse.active = false; };
        const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
        window.addEventListener('mousemove', onMouse); window.addEventListener('mouseleave', onLeave); window.addEventListener('resize', onResize);
        animate();

        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('mousemove', onMouse); window.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', onResize); };
    }, []);

    return <canvas ref={canvasRef} className="bg-canvas" />;
}
