'use strict';

/* Fundo espacial com parallax: estrelas em 3 profundidades (canvas), átomos e planetas (SVG)
   que se deslocam e giram conforme a rolagem, estrelas cadentes ocasionais. */
(function () {
    const layer = document.querySelector('.bg-fx');
    if (!layer) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;

    /* ---------- Canvas de estrelas ---------- */
    const canvas = document.createElement('canvas');
    canvas.className = 'bg-space';
    layer.insertBefore(canvas, layer.querySelector('.bg-grid'));
    const ctx = canvas.getContext('2d');

    /* speed: fração da rolagem que a camada acompanha (menor = mais distante). */
    const STAR_LAYERS = [
        { speed: 0.05, density: 1 / 5200, size: [0.4, 0.9], alpha: [0.25, 0.55] },
        { speed: 0.15, density: 1 / 11000, size: [0.8, 1.4], alpha: [0.35, 0.75] },
        { speed: 0.32, density: 1 / 26000, size: [1.2, 2.1], alpha: [0.55, 0.95] }
    ];
    const STAR_COLORS = ['#ffffff', '#ffffff', '#b8f8ff', '#c7d2fe', '#a5f3fc'];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let shooting = [];
    let scrollY = window.scrollY;

    const rand = (a, b) => a + Math.random() * (b - a);

    function buildStars() {
        stars = [];
        STAR_LAYERS.forEach((cfg, li) => {
            const count = Math.round(width * height * cfg.density * 2.2);
            for (let i = 0; i < count; i += 1) {
                stars.push({
                    layer: li,
                    x: Math.random() * width,
                    /* espaço vertical maior que a tela, para o laço da rolagem */
                    y: Math.random() * height * 2,
                    r: rand(cfg.size[0], cfg.size[1]),
                    a: rand(cfg.alpha[0], cfg.alpha[1]),
                    tw: rand(0.6, 2.2),
                    ph: Math.random() * Math.PI * 2,
                    c: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
                });
            }
        });
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        placeObjects();
    }

    function spawnShootingStar() {
        const fromLeft = Math.random() < 0.5;
        const angle = rand(0.25, 0.55);
        const speed = rand(9, 14);
        shooting.push({
            x: fromLeft ? rand(-50, width * 0.4) : rand(width * 0.6, width + 50),
            y: rand(-30, height * 0.45),
            vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            max: rand(45, 70)
        });
    }

    let lastFrame = 0;
    function draw(now) {
        ctx.clearRect(0, 0, width, height);
        const time = now / 1000;
        const loop = height * 2;
        for (const s of stars) {
            const cfg = STAR_LAYERS[s.layer];
            let y = (s.y - scrollY * cfg.speed) % loop;
            if (y < 0) y += loop;
            if (y > height + 4) continue;
            const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time * s.tw + s.ph);
            ctx.globalAlpha = s.a * twinkle;
            ctx.fillStyle = s.c;
            ctx.beginPath();
            ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
            if (s.r > 1.6) {
                /* brilho em cruz nas estrelas mais próximas */
                ctx.globalAlpha = s.a * twinkle * 0.35;
                ctx.fillRect(s.x - s.r * 3, y - 0.3, s.r * 6, 0.6);
                ctx.fillRect(s.x - 0.3, y - s.r * 3, 0.6, s.r * 6);
            }
        }
        for (const m of shooting) {
            m.life += 1;
            m.x += m.vx;
            m.y += m.vy;
            const fade = Math.sin((m.life / m.max) * Math.PI);
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
            grad.addColorStop(0, `rgba(184, 248, 255, ${0.9 * fade})`);
            grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.globalAlpha = 1;
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
            ctx.stroke();
        }
        shooting = shooting.filter((m) => m.life < m.max);
        ctx.globalAlpha = 1;
    }

    function frame(now) {
        /* ~30 fps é suficiente para o piscar e economiza bateria */
        if (now - lastFrame >= 33) {
            lastFrame = now;
            if (!reduceMotion && Math.random() < 0.004 && shooting.length < 2) spawnShootingStar();
            draw(now);
        }
        requestAnimationFrame(frame);
    }

    /* ---------- Átomos e planetas (SVG) ---------- */
    const objects = document.createElement('div');
    objects.className = 'bg-objects';
    objects.setAttribute('aria-hidden', 'true');
    layer.appendChild(objects);

    function orbit(rx, ry, angle, color, dur, reverse) {
        const path = `M${rx},0 A${rx},${ry} 0 1,1 ${-rx},0 A${rx},${ry} 0 1,1 ${rx},0`;
        const motion = reduceMotion ? '' : `<animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}"${reverse ? ' keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}/>`;
        return `<g transform="rotate(${angle})">
            <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-opacity=".45" stroke-width="1"/>
            <circle r="3.2" fill="#fff">${motion}</circle>
            <circle r="7" fill="${color}" opacity=".35">${motion}</circle>
        </g>`;
    }

    function atomSvg(hue) {
        const colors = hue === 'indigo' ? ['#818cf8', '#00e5ff', '#a5b4fc'] : hue === 'green' ? ['#10b981', '#00e5ff', '#6ee7b7'] : ['#00e5ff', '#818cf8', '#67e8f9'];
        return `<svg viewBox="-70 -70 140 140" class="atom-svg">
            <defs><radialGradient id="nuc-${hue}" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[0]}" stop-opacity=".2"/></radialGradient></defs>
            ${orbit(58, 20, 0, colors[0], 3.6, false)}
            ${orbit(58, 20, 60, colors[1], 4.4, true)}
            ${orbit(58, 20, 120, colors[2], 5.2, false)}
            <circle r="16" fill="url(#nuc-${hue})" opacity=".35"/>
            <circle r="9" fill="url(#nuc-${hue})"/>
        </svg>`;
    }

    function planetSvg(color, ring) {
        return `<svg viewBox="-80 -80 160 160" class="planet-svg">
            <defs>
                <radialGradient id="pl-${color.slice(1)}" cx="32%" cy="30%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${color}"/><stop offset="1" stop-color="#05070c"/></radialGradient>
                <clipPath id="front-${color.slice(1)}"><rect x="-80" y="0" width="160" height="80"/></clipPath>
            </defs>
            ${ring ? `<ellipse rx="70" ry="16" fill="none" stroke="${color}" stroke-opacity=".35" stroke-width="5" transform="rotate(-18)"/>` : ''}
            <circle r="38" fill="url(#pl-${color.slice(1)})"/>
            ${ring ? `<g transform="rotate(-18)" clip-path="url(#front-${color.slice(1)})"><ellipse rx="70" ry="16" fill="none" stroke="${color}" stroke-opacity=".55" stroke-width="5"/></g>` : ''}
        </svg>`;
    }

    /* x/top em fração da largura/altura do "mundo"; speed = profundidade; spin = graus por 1000px rolados */
    const OBJECTS = [
        { kind: 'atom', hue: 'cyan', x: 0.975, top: 0.04, size: 130, speed: 0.22, spin: 40, opacity: 0.5 },
        { kind: 'planet', color: '#6366f1', ring: true, x: 0.05, top: 0.16, size: 190, speed: 0.12, spin: -10, opacity: 0.45 },
        { kind: 'atom', hue: 'indigo', x: 0.1, top: 0.38, size: 110, speed: 0.35, spin: -60, opacity: 0.5 },
        { kind: 'atom', hue: 'green', x: 0.9, top: 0.5, size: 90, speed: 0.18, spin: 70, opacity: 0.4 },
        { kind: 'planet', color: '#00b8d4', ring: false, x: 0.78, top: 0.7, size: 120, speed: 0.08, spin: 6, opacity: 0.35 },
        { kind: 'atom', hue: 'cyan', x: 0.18, top: 0.78, size: 170, speed: 0.28, spin: 35, opacity: 0.45 },
        { kind: 'planet', color: '#10b981', ring: true, x: 0.92, top: 0.92, size: 140, speed: 0.15, spin: -12, opacity: 0.35 },
        { kind: 'atom', hue: 'indigo', x: 0.5, top: 0.98, size: 120, speed: 0.4, spin: -45, opacity: 0.4 }
    ];

    const nodes = OBJECTS.map((cfg) => {
        const el = document.createElement('div');
        el.className = `bg-object bg-${cfg.kind}`;
        el.innerHTML = cfg.kind === 'atom' ? atomSvg(cfg.hue) : planetSvg(cfg.color, cfg.ring);
        el.style.setProperty('--size', `${cfg.size}px`);
        el.style.setProperty('--op', cfg.opacity);
        el.style.setProperty('--blur', `${Math.max(0, (0.3 - cfg.speed) * 6).toFixed(1)}px`);
        objects.appendChild(el);
        return { el, cfg, baseY: 0 };
    });

    /* Distribui os objetos ao longo da rolagem que cada camada percorre. */
    function placeObjects() {
        const scrollMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const small = window.innerWidth < 720;
        nodes.forEach((n) => {
            /* passa pelo meio da tela quando a rolagem chega a top × total */
            n.baseY = window.innerHeight * 0.5 + n.cfg.top * scrollMax * n.cfg.speed - (n.cfg.top < 0.1 ? window.innerHeight * 0.32 : 0);
            const size = small ? n.cfg.size * 0.6 : n.cfg.size;
            n.el.style.setProperty('--size', `${size}px`);
            n.el.style.left = `calc(${(n.cfg.x * 100).toFixed(1)}% - ${size / 2}px)`;
        });
        updateObjects();
    }

    function updateObjects() {
        nodes.forEach((n) => {
            const y = n.baseY - scrollY * n.cfg.speed;
            const rot = reduceMotion ? 0 : (scrollY / 1000) * n.cfg.spin;
            n.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        });
    }

    /* ---------- Rolagem ---------- */
    let ticking = false;
    function onScroll() {
        scrollY = window.scrollY;
        root.style.setProperty('--sy', scrollY.toFixed(0));
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateObjects();
            if (reduceMotion) draw(performance.now());
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(resize));
    /* a altura da página muda quando o catálogo renderiza ou a busca filtra */
    document.addEventListener('str:rendered', () => requestAnimationFrame(placeObjects));

    resize();
    onScroll();
    if (reduceMotion) draw(performance.now());
    else requestAnimationFrame(frame);
})();
