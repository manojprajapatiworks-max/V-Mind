import React, { useEffect, useRef } from "react";

export default function HeroOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let orbs: Orb[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Orb {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 200 + 100; // Increased radius (100 to 300)
        this.speedX = (Math.random() - 0.5) * 0.5; // Slightly faster
        this.speedY = (Math.random() - 0.5) * 0.5;
        
        const colors = [
          "rgba(59, 130, 246, 0.35)", // blue-500 (increased opacity)
          "rgba(147, 51, 234, 0.35)", // purple-600
          "rgba(6, 182, 212, 0.35)",  // cyan-500
          "rgba(37, 99, 235, 0.35)",  // blue-600
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        else if (this.x < -this.radius) this.x = canvas.width + this.radius;

        if (this.y > canvas.height + this.radius) this.y = -this.radius;
        else if (this.y < -this.radius) this.y = canvas.height + this.radius;
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      orbs = [];
      const numberOfOrbs = 18; // Increased from 12
      for (let i = 0; i < numberOfOrbs; i++) {
        orbs.push(new Orb());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < orbs.length; i++) {
        orbs[i].update();
        orbs[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
