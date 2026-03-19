import React, { useRef, useEffect } from 'react';
import './BackgroundAnimation.css';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      initParticles();
    };

    const getThemeColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        return {
          // Small nodes — subtle cool white/grey
          smallNode: 'rgba(160, 185, 220, ',
          // Medium nodes — brighter blue
          mediumNode: 'rgba(100, 170, 255, ',
          // Large nodes — vivid accent blue
          largeNode: 'rgba(70, 140, 255, ',
          lineColor: 'rgba(100, 160, 255, ',
          glowColor: 'rgba(70, 140, 255, ',
        };
      }
      return {
        // Small nodes — muted grey-blue
        smallNode: 'rgba(80, 100, 140, ',
        // Medium nodes — corporate blue
        mediumNode: 'rgba(30, 80, 180, ',
        // Large nodes — vivid deep blue
        largeNode: 'rgba(20, 60, 200, ',
        lineColor: 'rgba(20, 60, 140, ',
        glowColor: 'rgba(30, 80, 200, ',
      };
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Varied sizes: most small, some larger (like the image)
        const sizeRoll = Math.random();
        if (sizeRoll > 0.92) {
          this.size = Math.random() * 3 + 3;      // Large nodes (3-6px)
        } else if (sizeRoll > 0.7) {
          this.size = Math.random() * 2 + 2;      // Medium nodes (2-4px)
        } else {
          this.size = Math.random() * 1.5 + 0.8;  // Small nodes (0.8-2.3px)
        }
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }

      draw() {
        const colors = getThemeColors();

        // Pick color and glow based on size tier
        let nodeColorPrefix;
        if (this.size > 3.5) {
          // Large — vivid accent with strong glow
          nodeColorPrefix = colors.largeNode;
          ctx.shadowColor = colors.glowColor + '0.7)';
          ctx.shadowBlur = 16;
        } else if (this.size > 2) {
          // Medium — corporate blue with subtle glow
          nodeColorPrefix = colors.mediumNode;
          ctx.shadowColor = colors.glowColor + '0.35)';
          ctx.shadowBlur = 8;
        } else {
          // Small — muted, no glow
          nodeColorPrefix = colors.smallNode;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        const opacity = this.size > 3.5 ? '0.9)' : this.size > 2 ? '0.7)' : '0.45)';
        ctx.fillStyle = nodeColorPrefix + opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }


      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Soft boundary bounce
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse interaction — subtle repulsion
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= dx * force * 0.06;
            this.y -= dy * force * 0.06;
          }
        }
      }
    }

    const initParticles = () => {
      particles = [];
      // Density calibrated to match the inspiration (not too sparse, not too dense)
      const area = canvas.width * canvas.height;
      const count = Math.min(Math.floor(area / 8000), 200);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      const colors = getThemeColors();
      const maxDistance = 180;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - (distance / maxDistance)) * 0.25;
            ctx.strokeStyle = colors.lineColor + opacity + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connect();
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Observe theme changes to update colors reactively
    const observer = new MutationObserver(() => {});
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="hero-background-animation">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default BackgroundAnimation;
