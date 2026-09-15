// =========================================================
// MediGuide AI — Live Interactive Medical Canvas Background
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

    let mouse = { x: null, y: null, radius: 150 };

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
        if (width < 768) return 30;
        if (width < 1200) return 55;
        return 75;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2.2 + 1.2;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.isCross = Math.random() < 0.22;
            this.crossSize = Math.random() * 5 + 4;
            this.alpha = Math.random() * 0.5 + 0.3;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
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
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }

            this.pulseVal += this.pulseSpeed;
        }

        draw(isDark) {
            const currentAlpha = this.alpha * (0.7 + 0.3 * Math.sin(this.pulseVal));
            const primaryColor = isDark ? `rgba(0, 229, 255, ${currentAlpha})` : `rgba(0, 144, 168, ${currentAlpha * 0.8})`;
            const violetColor = isDark ? `rgba(139, 92, 246, ${currentAlpha})` : `rgba(109, 62, 224, ${currentAlpha * 0.8})`;

            ctx.save();
            if (this.isCross) {
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 1.6;
                const s = this.crossSize;
                ctx.beginPath();
                ctx.moveTo(this.x - s, this.y);
                ctx.lineTo(this.x + s, this.y);
                ctx.moveTo(this.x, this.y - s);
                ctx.lineTo(this.x, this.y + s);
                ctx.stroke();
            } else {
                ctx.fillStyle = Math.random() > 0.5 ? primaryColor : violetColor;
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

    let ecgX = -100;
    const ecgSpeed = 3.5;
    const ecgYPercent = 0.72;

    function drawEcgLine(isDark) {
        ecgX += ecgSpeed;
        if (ecgX > width + 250) {
            ecgX = -250;
        }

        const baseY = height * ecgYPercent;
        const trailLength = 220;

        ctx.save();
        ctx.lineWidth = isDark ? 2 : 1.5;
        const ecgColor = isDark ? "0, 255, 163" : "0, 148, 106";

        ctx.beginPath();
        for (let x = ecgX - trailLength; x <= ecgX; x += 3) {
            if (x < 0 || x > width) continue;

            const distFromHead = ecgX - x;
            const alpha = Math.max(0, 1 - distFromHead / trailLength) * 0.35;
            ctx.strokeStyle = `rgba(${ecgColor}, ${alpha})`;

            let offset = 0;
            const relX = distFromHead;
            if (relX >= 40 && relX <= 55) {
                offset = -Math.sin(((relX - 40) / 15) * Math.PI) * 7;
            } else if (relX >= 60 && relX <= 68) {
                offset = 6;
            } else if (relX > 68 && relX <= 82) {
                offset = -32 * Math.sin(((relX - 68) / 14) * Math.PI);
            } else if (relX > 82 && relX <= 92) {
                offset = 10 * Math.sin(((relX - 82) / 10) * Math.PI);
            } else if (relX >= 105 && relX <= 135) {
                offset = -12 * Math.sin(((relX - 105) / 30) * Math.PI);
            }

            const ptY = baseY + offset;
            if (x === ecgX - trailLength) {
                ctx.moveTo(x, ptY);
            } else {
                ctx.lineTo(x, ptY);
            }
        }
        ctx.stroke();

        if (ecgX >= 0 && ecgX <= width) {
            ctx.fillStyle = `rgba(${ecgColor}, 0.8)`;
            ctx.shadowColor = `rgba(${ecgColor}, 0.8)`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(ecgX, baseY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function connectParticles(isDark) {
        const maxDist = 115;
        const lineBaseColor = isDark ? "0, 229, 255" : "0, 144, 168";

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.16;
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.25;
                    ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha})` : `rgba(109, 62, 224, ${alpha})`;
                    ctx.lineWidth = 1.1;
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
