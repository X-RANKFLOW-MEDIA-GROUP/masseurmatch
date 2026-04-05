"use client";

import { useEffect, useRef } from "react";

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Brand colors
    const colors = {
      navy: { r: 11, g: 31, b: 58 },
      navyDeep: { r: 9, g: 23, b: 41 },
      orange: { r: 255, g: 138, b: 31 },
      orangeSoft: { r: 255, g: 179, b: 71 },
    };

    // Floating orbs configuration
    const orbs = [
      { x: 0.2, y: 0.3, radius: 0.35, color: colors.orange, opacity: 0.08, speed: 0.0003 },
      { x: 0.8, y: 0.2, radius: 0.28, color: colors.orangeSoft, opacity: 0.06, speed: 0.0004 },
      { x: 0.5, y: 0.7, radius: 0.4, color: colors.orange, opacity: 0.05, speed: 0.0002 },
      { x: 0.15, y: 0.8, radius: 0.25, color: colors.orangeSoft, opacity: 0.04, speed: 0.0005 },
      { x: 0.85, y: 0.6, radius: 0.3, color: colors.orange, opacity: 0.07, speed: 0.00035 },
    ];

    // Particles configuration
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      pulse: number;
    }> = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Initialize particles
      particles.length = 0;
      const particleCount = Math.min(Math.floor((rect.width * rect.height) / 15000), 60);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawGradientOrb = (
      x: number,
      y: number,
      radius: number,
      color: { r: number; g: number; b: number },
      opacity: number
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Clear with base gradient
      const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
      baseGradient.addColorStop(0, `rgb(${colors.navy.r}, ${colors.navy.g}, ${colors.navy.b})`);
      baseGradient.addColorStop(1, `rgb(${colors.navyDeep.r}, ${colors.navyDeep.g}, ${colors.navyDeep.b})`);
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw animated orbs
      orbs.forEach((orb, i) => {
        const offsetX = Math.sin(time * orb.speed * 1000 + i * 1.5) * width * 0.08;
        const offsetY = Math.cos(time * orb.speed * 800 + i * 2) * height * 0.06;
        const pulseRadius = orb.radius + Math.sin(time * 0.001 + i) * 0.03;
        
        drawGradientOrb(
          orb.x * width + offsetX,
          orb.y * height + offsetY,
          pulseRadius * Math.min(width, height),
          orb.color,
          orb.opacity + Math.sin(time * 0.0015 + i * 0.8) * 0.02
        );
      });

      // Draw mesh lines
      ctx.strokeStyle = `rgba(252, 251, 248, 0.03)`;
      ctx.lineWidth = 1;
      const gridSize = 80;
      const waveAmplitude = 8;
      
      // Horizontal wavy lines
      for (let y = 0; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const wave = Math.sin((x / width) * Math.PI * 3 + time * 0.0008) * waveAmplitude;
          const wave2 = Math.sin((x / width) * Math.PI * 5 + time * 0.0012) * (waveAmplitude * 0.5);
          if (x === 0) {
            ctx.moveTo(x, y + wave + wave2);
          } else {
            ctx.lineTo(x, y + wave + wave2);
          }
        }
        ctx.stroke();
      }

      // Vertical wavy lines
      for (let x = 0; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 10) {
          const wave = Math.sin((y / height) * Math.PI * 3 + time * 0.0006) * waveAmplitude;
          const wave2 = Math.cos((y / height) * Math.PI * 4 + time * 0.001) * (waveAmplitude * 0.5);
          if (y === 0) {
            ctx.moveTo(x + wave + wave2, y);
          } else {
            ctx.lineTo(x + wave + wave2, y);
          }
        }
        ctx.stroke();
      }

      // Draw particles
      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw with pulsing opacity
        const pulseOpacity = p.opacity * (0.7 + Math.sin(p.pulse) * 0.3);
        ctx.fillStyle = `rgba(252, 251, 248, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = `rgba(255, 138, 31, 0.08)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      time++;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
