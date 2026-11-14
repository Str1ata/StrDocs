'use strict';

/* Fundo espacial em parallax, tudo num canvas 2D:
   - estrelas em 3 profundidades, discretas;
   - constelação: rede de nós ligados por linhas finas;
   - globos de pontos (esfera de Fibonacci) girando com o tempo e a rolagem;
   - sistemas de órbitas: elipses finas com pontos de luz percorrendo.
   Cada camada acompanha uma fração da rolagem (parallax). Sob reduced-motion fica parado. */
(function () {
    const layer = document.querySelector('.bg-fx');
    if (!layer) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;

    const canvas = document.createElement('canvas');
    canvas.className = 'bg-space';
    canvas.setAttribute('aria-hidden', 'true');
    layer.insertBefore(canvas, layer.querySelector('.bg-grid'));
    const ctx = canvas.getContext('2d');

    const CYAN = [0, 229, 255];
    const BLUE = [56, 132, 255];
    const ICE = [186, 240, 255];
    const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
    const rand = (a, b) => a + Math.random() * (b - a);

    let width = 0;
    let height = 0;
    let scrollY = window.scrollY;
    let scrollMax = 1;
    let small = false;

    /* ---------- Estrelas ---------- */
    const STAR_LAYERS = [
        { speed: 0.03, density: 1 / 9000, r: [0.35, 0.7], a: [0.18, 0.4] },
        { speed: 0.08, density: 1 / 18000, r: [0.6, 1.0], a: [0.3, 0.55] },
        { speed: 0.16, density: 1 / 42000, r: [0.9, 1.4], a: [0.45, 0.75] }
    ];
    let stars = [];

    function buildStars() {
        stars = [];
        STAR_LAYERS.forEach((cfg, li) => {
            const count = Math.round(width * height * 2 * cfg.density);
            for (let i = 0; i < count; i += 1) {
                stars.push({
                    li,
                    x: Math.random() * width,
                    y: Math.random() * height * 2,
                    r: rand(cfg.r[0], cfg.r[1]),
                    a: rand(cfg.a[0], cfg.a[1]),
                    tw: rand(0.3, 0.9),
                    ph: Math.random() * Math.PI * 2,
                    c: Math.random() < 0.25 ? ICE : [255, 255, 255]
                });
            }
        });
    }

    function drawStars(time) {
        const loop = height * 2;
        for (const s of stars) {
            let y = (s.y - scrollY * STAR_LAYERS[s.li].speed) % loop;
            if (y < 0) y += loop;
            if (y > height + 2) continue;
            const tw = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(time * s.tw + s.ph);
            ctx.fillStyle = rgba(s.c, s.a * tw);
            ctx.beginPath();
            ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ---------- Constelação ---------- */
    const NET_SPEED = 0.1;
    let nodes = [];

    function buildNetwork() {
        nodes = [];
        const span = height + scrollMax * NET_SPEED;
        const count = Math.round((width * span) / (small ? 36000 : 26000));
        for (let i = 0; i < count; i += 1) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * span,
                vx: rand(-0.06, 0.06),
                vy: rand(-0.04, 0.04),
                r: rand(0.8, 1.6)
            });
        }
    }

    function drawNetwork(dt) {
        const offset = scrollY * NET_SPEED;
        const link = small ? 110 : 150;
        const visible = [];
        for (const n of nodes) {
            if (!reduceMotion) {
                n.x += n.vx * dt;
                n.y += n.vy * dt;
                if (n.x < -20) n.x = width + 20;
                if (n.x > width + 20) n.x = -20;
            }
            const y = n.y - offset;
            if (y > -link && y < height + link) visible.push({ n, x: n.x, y });
        }
        ctx.lineWidth = 0.6;
        for (let i = 0; i < visible.length; i += 1) {
            const a = visible[i];
            for (let j = i + 1; j < visible.length; j += 1) {
                const b = visible[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < link) {
                    ctx.strokeStyle = rgba(CYAN, 0.13 * (1 - d / link));
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        for (const v of visible) {
            ctx.fillStyle = rgba(ICE, 0.45);
            ctx.beginPath();
            ctx.arc(v.x, v.y, v.n.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ---------- Globos de pontos e órbitas ---------- */
    /* at: fração da rolagem em que o objeto passa pelo meio da tela; x: fração da largura;
       size: raio em px (desktop); speed: profundidade do parallax. */
    const OBJECTS = [
        { kind: 'globe', at: 0.0, x: 0.94, y: 0.78, size: 210, speed: 0.18, tilt: 0.38, color: CYAN },
        { kind: 'orbits', at: 0.16, x: -0.03, y: 0.5, size: 210, speed: 0.24, tilt: 0.32 },
        { kind: 'globe', at: 0.36, x: 0.95, y: 0.5, size: 170, speed: 0.2, tilt: -0.3, color: BLUE },
        { kind: 'orbits', at: 0.55, x: 0.95, y: 0.5, size: 180, speed: 0.26, tilt: -0.28 },
        { kind: 'globe', at: 0.72, x: -0.02, y: 0.5, size: 200, speed: 0.16, tilt: 0.42, color: CYAN },
        { kind: 'orbits', at: 0.92, x: 0.94, y: 0.5, size: 220, speed: 0.22, tilt: 0.3 }
    ];

    /* Esfera de Fibonacci: pontos bem distribuídos */
    const SPHERE = (() => {
        const n = 520;
        const pts = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < n; i += 1) {
            const y = 1 - (i / (n - 1)) * 2;
            const rr = Math.sqrt(1 - y * y);
            const th = golden * i;
            pts.push([Math.cos(th) * rr, y, Math.sin(th) * rr]);
        }
        return pts;
    })();

    function objectCenter(o) {
        const r = small ? o.size * 0.58 : o.size;
        const baseY = height * o.y + o.at * scrollMax * o.speed;
        return { cx: o.x * width, cy: baseY - scrollY * o.speed, r };
    }

    function drawGlobe(o, time) {
        const { cx, cy, r } = objectCenter(o);
        if (cy < -r * 1.6 || cy > height + r * 1.6) return;
        const spin = (reduceMotion ? 0 : time * 0.08) + scrollY * 0.0009;
        const cosS = Math.cos(spin);
        const sinS = Math.sin(spin);
        const cosT = Math.cos(o.tilt);
        const sinT = Math.sin(o.tilt);

        /* halo */
        const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.5);
        halo.addColorStop(0, rgba(o.color, 0.07));
        halo.addColorStop(1, rgba(o.color, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        /* contorno */
        ctx.strokeStyle = rgba(o.color, 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        for (const [px, py, pz] of SPHERE) {
            /* gira no eixo Y e inclina no eixo X */
            const x1 = px * cosS + pz * sinS;
            const z1 = -px * sinS + pz * cosS;
            const y2 = py * cosT - z1 * sinT;
            const z2 = py * sinT + z1 * cosT;
            const depth = (z2 + 1) / 2;
            if (depth < 0.08) continue;
            const a = 0.12 + depth * depth * 0.78;
            ctx.fillStyle = rgba(depth > 0.85 ? ICE : o.color, a);
            const s = 0.9 + depth * 1.5;
            ctx.fillRect(cx + x1 * r - s / 2, cy + y2 * r - s / 2, s, s);
        }
    }

    function drawOrbits(o, time) {
        const { cx, cy, r } = objectCenter(o);
        if (cy < -r * 1.6 || cy > height + r * 1.6) return;
        const turn = scrollY * 0.00035;
        const rings = [
            { k: 1.0, tilt: o.tilt + turn, sp: 0.22, color: CYAN },
            { k: 0.74, tilt: o.tilt + 1.05 - turn * 0.7, sp: -0.3, color: BLUE },
            { k: 0.5, tilt: o.tilt + 2.1 + turn * 1.3, sp: 0.42, color: ICE }
        ];

        /* núcleo discreto */
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.22);
        core.addColorStop(0, rgba(ICE, 0.22));
        core.addColorStop(0.35, rgba(CYAN, 0.07));
        core.addColorStop(1, rgba(CYAN, 0));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
        ctx.fill();

        for (const ring of rings) {
            const rx = r * ring.k;
            const ry = rx * 0.3;
            /* traço que some num dos lados: dá profundidade sem desenhar a elipse inteira igual */
            const grad = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
            grad.addColorStop(0, rgba(ring.color, 0.02));
            grad.addColorStop(0.5, rgba(ring.color, 0.22));
            grad.addColorStop(1, rgba(ring.color, 0.05));
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ring.tilt);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            /* ponto de luz com rastro */
            const t0 = (reduceMotion ? 0.6 : time * ring.sp) + scrollY * 0.0012 * Math.sign(ring.sp);
            for (let k = 0; k < 14; k += 1) {
                const t = t0 - k * 0.035 * Math.sign(ring.sp);
                const x = Math.cos(t) * rx;
                const y = Math.sin(t) * ry;
                const fade = 1 - k / 14;
                ctx.fillStyle = rgba(k === 0 ? [255, 255, 255] : ring.color, (k === 0 ? 0.95 : 0.35) * fade);
                ctx.beginPath();
                ctx.arc(x, y, k === 0 ? 2.2 : 1.6 * fade + 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            const glow = ctx.createRadialGradient(Math.cos(t0) * rx, Math.sin(t0) * ry, 0, Math.cos(t0) * rx, Math.sin(t0) * ry, 12);
            glow.addColorStop(0, rgba(ring.color, 0.45));
            glow.addColorStop(1, rgba(ring.color, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(Math.cos(t0) * rx, Math.sin(t0) * ry, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* ---------- Ciclo ---------- */
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        small = width < 720;
        scrollMax = Math.max(1, document.documentElement.scrollHeight - height);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        buildNetwork();
    }

    let last = 0;
    function draw(now) {
        const time = now / 1000;
        const dt = last ? Math.min(3, (now - last) / 16.7) : 1;
        last = now;
        ctx.clearRect(0, 0, width, height);
        drawStars(time);
        drawNetwork(dt);
        for (const o of OBJECTS) {
            if (o.kind === 'globe') drawGlobe(o, time);
            else drawOrbits(o, time);
        }
    }

    let lastFrame = 0;
    function frame(now) {
        /* ~30 fps: suficiente para movimento lento e economiza bateria */
        if (now - lastFrame >= 33) {
            lastFrame = now;
            draw(now);
        }
        requestAnimationFrame(frame);
    }

    let ticking = false;
    function onScroll() {
        scrollY = window.scrollY;
        root.style.setProperty('--sy', scrollY.toFixed(0));
        if (!reduceMotion || ticking) return;
        ticking = true;
        requestAnimationFrame(() => { draw(performance.now()); ticking = false; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(() => { resize(); if (reduceMotion) draw(performance.now()); }));
    /* a altura da página muda quando o catálogo renderiza ou a busca filtra */
    document.addEventListener('str:rendered', () => requestAnimationFrame(() => {
        scrollMax = Math.max(1, document.documentElement.scrollHeight - height);
        if (reduceMotion) draw(performance.now());
    }));

    resize();
    onScroll();
    if (reduceMotion) draw(performance.now());
    else requestAnimationFrame(frame);
})();
