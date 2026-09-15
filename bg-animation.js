// =========================================================
// MediGuide AI — Realistic Medical Canvas with Glowing Hearts
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
        initHearts();
    });

    // =========================================================
    // 1. Realistic Glowing Red Hearts with Cardiac "Lub-Dub" Pulse
    // =========================================================

    class GlowingHeart {
        constructor(initial = false) {
            this.reset(initial);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 40;
            this.size = Math.random() * 9 + 11; // 11px - 20px realistic size
            this.speedY = Math.random() * 0.45 + 0.3; // gentle float upward
            this.swayAngle = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.02 + 0.012;
            this.swayAmplitude = Math.random() * 0.7 + 0.35;

            // Authentic Cardiac Cycle: "Lub-Dub" Rhythm
            this.heartRate = Math.random() * 0.035 + 0.045;
            this.heartPhase = Math.random() * Math.PI * 2;
            this.baseAlpha = Math.random() * 0.3 + 0.6; // High visibility glow (0.6 - 0.9)
        }

        update() {
            this.y -= this.speedY;
            this.swayAngle += this.swaySpeed;
            this.x += Math.sin(this.swayAngle) * this.swayAmplitude;
            this.heartPhase += this.heartRate;

            // React to mouse cursor proximity
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.heartPhase += 0.06; // accelerated heart rate near cursor
                }
            }

            if (this.y < -50 || this.x < -50 || this.x > width + 50) {
                this.reset(false);
            }
        }

        getBeatScale() {
            // Dual-phase cardiac cycle (Lub-Dub rhythm)
            const cycle = this.heartPhase % (Math.PI * 2);
            // S1 contraction (Lub)
            if (cycle < 0.55) {
                return 1 + 0.28 * Math.sin((cycle / 0.55) * Math.PI);
            }
            // S2 contraction (Dub)
            if (cycle >= 0.75 && cycle < 1.3) {
                return 1 + 0.18 * Math.sin(((cycle - 0.75) / 0.55) * Math.PI);
            }
            // Diastole (Resting interval)
            return 1.0;
        }

        draw() {
            const beat = this.getBeatScale();
            const alpha = Math.min(1, this.baseAlpha * (beat > 1.05 ? 1.15 : 0.92));
            const s = this.size;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(beat, beat);

            // Cardiac Neon Glow
            ctx.shadowColor = "rgba(255, 30, 80, 0.85)";
            ctx.shadowBlur = beat > 1.05 ? 22 : 14;

            // 3D Realistic Crimson Radial Gradient
            const heartGrad = ctx.createRadialGradient(-s * 0.2, -s * 0.2, 1, 0, 0, s * 1.3);
            heartGrad.addColorStop(0, `rgba(255, 80, 120, ${alpha})`);
            heartGrad.addColorStop(0.65, `rgba(235, 20, 65, ${alpha * 0.95})`);
            heartGrad.addColorStop(1, `rgba(175, 0, 45, ${alpha * 0.88})`);

            ctx.fillStyle = heartGrad;

            // Smooth Anatomical Cardiac Heart Shape (Bezier curves)
            ctx.beginPath();
            ctx.moveTo(0, s * 0.28);
            ctx.bezierCurveTo(-s * 0.65, -s * 0.65, -s * 1.15, s * 0.1, 0, s * 1.12);
            ctx.bezierCurveTo(s * 1.15, s * 0.1, s * 0.65, -s * 0.65, 0, s * 0.28);
            ctx.closePath();
            ctx.fill();

            // Specular light reflection on top-left lobe for 3D depth
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.38})`;
            ctx.beginPath();
            ctx.ellipse(-s * 0.32, -s * 0.12, s * 0.2, s * 0.09, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    let hearts = [];
    function initHearts() {
        hearts = [];
        const count = width < 768 ? 8 : 14; // balanced count
        for (let i = 0; i < count; i++) {
            hearts.push(new GlowingHeart(true));
        }
    }
    initHearts();

    // =========================================================
    // 2. Medical Neural Particles & Plus (+) Icons
    // =========================================================

    function getParticleCount() {
        if (width < 768) return 40;
        if (width < 1200) return 65;
        return 85;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2.5 + 1.8;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.isCross = Math.random() < 0.25;
            this.crossSize = Math.random() * 6 + 5;
            this.alpha = Math.random() * 0.4 + 0.55;
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
                    this.x -= (dx / dist) * force * 2;
                    this.y -= (dy / dist) * force * 2;
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
            const glowColor = isDark ? "rgba(0, 229, 255, 0.45)" : "rgba(0, 150, 180, 0.25)";

            ctx.save();
            if (this.isCross) {
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

    // =========================================================
    // 3. ECG Heartbeat Vital Signs Wave
    // =========================================================

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
            const alpha = Math.max(0, 1 - distFromHead / trailLength) * 0.65;
            ctx.strokeStyle = `rgba(${ecgColor}, ${alpha})`;

            let offset = 0;
            const relX = distFromHead;
            if (relX >= 40 && relX <= 55) {
                offset = -Math.sin(((relX - 40) / 15) * Math.PI) * 10;
            } else if (relX >= 60 && relX <= 68) {
                offset = 8;
            } else if (relX > 68 && relX <= 84) {
                offset = -40 * Math.sin(((relX - 68) / 16) * Math.PI);
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

    function connectParticles(isDark) {
        const maxDist = 135;
        const lineBaseColor = isDark ? "0, 229, 255" : "0, 150, 180";

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.32;
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${alpha})`;
                    ctx.lineWidth = 1.1;
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

        // 1. Draw connecting neural mesh
        connectParticles(isDark);

        // 2. Draw bio particles and medical crosses
        for (let p of particles) {
            p.update();
            p.draw(isDark);
        }

        // 3. Draw Realistic Floating Glowing Hearts (Cardiac Vibe)
        for (let h of hearts) {
            h.update();
            h.draw();
        }

        // 4. Draw ECG Vital Signs Heartbeat Wave
        drawEcgLine(isDark);

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();
