'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function PremiumBackground() {
    const glowRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: -200, y: -200 });
    const currentRef = useRef({ x: -200, y: -200 });

    const animate = useCallback(() => {
        currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * 0.08;
        currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * 0.08;
        if (glowRef.current) {
            glowRef.current.style.transform = `translate(${currentRef.current.x - 200}px, ${currentRef.current.y - 200}px)`;
        }
        rafRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const onMouse = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
        const onLeave = () => { mouseRef.current.x = -200; mouseRef.current.y = -200; };
        window.addEventListener('mousemove', onMouse);
        window.addEventListener('mouseleave', onLeave);
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', onMouse);
            window.removeEventListener('mouseleave', onLeave);
        };
    }, [animate]);

    return (
        <div className="premium-bg" aria-hidden="true">
            <div className="premium-bg__orb premium-bg__orb--1" />
            <div className="premium-bg__orb premium-bg__orb--2" />
            <div className="premium-bg__orb premium-bg__orb--3" />
            <div className="premium-bg__orb premium-bg__orb--4" />
            <div className="premium-bg__grid" />
            <div className="premium-bg__noise" />
            <div className="premium-bg__accent-line" />
            <div ref={glowRef} className="premium-bg__cursor-glow" />
        </div>
    );
}
