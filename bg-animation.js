// =========================================================
// MediGuide AI — Highlighted Live Medical Canvas Background
// =========================================================

(function () {
    const canvas = document.createElement("canvas");
    canvas.id = "medicalBgCanvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: null, y: null, radius: 170 };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });

    function getParticleCount() {
        if (width < 768) return 45;
        if (width < 1200) return 75;
        return 95;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2.5 + 1.8;
            this.vx = (Math.random() - 0.5) * 0.85;
            this.vy = (Math.random() - 0.5) * 0.85;
            this.isCross = Math.random() < 0.28; // 28% are medical plus '+' icons
            this.crossSize = Math.random() * 6 + 5;
            this.alpha = Math.random() * 0.4 + 0.55; // Brighter alpha (0.55 - 0.95)
            this.pulseSpeed = Math.random() * 0.025 + 0.015;
            this.pulseVal = Math.random() * Math.PI;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 2.2;
                    this.y -= (dy / dist) * force * 2.2;
                }
            }

            this.pulseVal += this.pulseSpeed;
        }

        draw(isDark) {
            const currentAlpha = this.alpha * (0.75 + 0.25 * Math.sin(this.pulseVal));
            const primaryColor = isDark 
                ? `rgba(0, 229, 255, ${currentAlpha})` 
                : `rgba(0, 150, 180, ${currentAlpha})`;
            const secondaryColor = isDark 
                ? `rgba(139, 92, 246, ${currentAlpha})` 
                : `rgba(109, 62, 224, ${currentAlpha})`;
            const glowColor = isDark ? "rgba(0, 229, 255, 0.4)" : "rgba(0, 150, 180, 0.25)";

            ctx.save();
            if (this.isCross) {
                // Medical Plus '+' symbol with glow
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 2.2;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 8;
                const s = this.crossSize;
                ctx.beginPath();
                ctx.moveTo(this.x - s, this.y);
                ctx.lineTo(this.x + s, this.y);
                ctx.moveTo(this.x, this.y - s);
                ctx.lineTo(this.x, this.y + s);
                ctx.stroke();
            } else {
                // Glowing circular node
                ctx.fillStyle = Math.random() > 0.4 ? primaryColor : secondaryColor;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    let particles = [];
    function initParticles() {
        particles = [];
        const count = getParticleCount();
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    // ECG Heartbeat Pulse Line
    let ecgX = -120;
    const ecgSpeed = 4.2;
    const ecgYPercent = 0.68;

    function drawEcgLine(isDark) {
        ecgX += ecgSpeed;
        if (ecgX > width + 300) {
            ecgX = -250;
        }

        const baseY = height * ecgYPercent;
        const trailLength = 260;

        ctx.save();
        ctx.lineWidth = isDark ? 2.8 : 2.2;
        const ecgColor = isDark ? "0, 255, 170" : "0, 160, 110";

        ctx.beginPath();
        for (let x = ecgX - trailLength; x <= ecgX; x += 3) {
            if (x < 0 || x > width) continue;

            const distFromHead = ecgX - x;
            const alpha = Math.max(0, 1 - distFromHead / trailLength) * 0.6;
            ctx.strokeStyle = `rgba(${ecgColor}, ${alpha})`;

            let offset = 0;
            const relX = distFromHead;
            if (relX >= 40 && relX <= 55) {
                offset = -Math.sin(((relX - 40) / 15) * Math.PI) * 10;
            } else if (relX >= 60 && relX <= 68) {
                offset = 8;
            } else if (relX > 68 && relX <= 84) {
                offset = -40 * Math.sin(((relX - 68) / 16) * Math.PI); // Stronger heartbeat spike
            } else if (relX > 84 && relX <= 94) {
                offset = 12 * Math.sin(((relX - 84) / 10) * Math.PI);
            } else if (relX >= 108 && relX <= 140) {
                offset = -15 * Math.sin(((relX - 108) / 32) * Math.PI);
            }

            const ptY = baseY + offset;
            if (x === ecgX - trailLength) {
                ctx.moveTo(x, ptY);
            } else {
                ctx.lineTo(x, ptY);
            }
        }
        ctx.stroke();

        // High-glow leading vital sign head dot
        if (ecgX >= 0 && ecgX <= width) {
            ctx.fillStyle = `rgba(${ecgColor}, 1)`;
            ctx.shadowColor = `rgba(${ecgColor}, 1)`;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(ecgX, baseY, 4.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Connect close particles with highlighted neon lines
    function connectParticles(isDark) {
        const maxDist = 135;
        const lineBaseColor = isDark ? "0, 229, 255" : "0, 150, 180";

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.32; // Highlighted connection lines
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${alpha})`;
                    ctx.lineWidth = 1.1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // Connect to mouse with rich violet/cyan trail
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.55;
                    ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha})` : `rgba(109, 62, 224, ${alpha})`;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    let isVisible = true;
    document.addEventListener("visibilitychange", () => {
        isVisible = !document.hidden;
        if (isVisible) requestAnimationFrame(animate);
    });

    function animate() {
        if (!isVisible) return;

        const isDark = document.body.classList.contains("dark-mode");

        ctx.clearRect(0, 0, width, height);

        connectParticles(isDark);

        for (let p of particles) {
            p.update();
            p.draw(isDark);
        }

        drawEcgLine(isDark);

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();
