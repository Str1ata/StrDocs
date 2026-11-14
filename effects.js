'use strict';

/* Interações visuais: revelar ao rolar, indicadores deslizantes, scrollspy,
   barra de progresso, brilho que segue o mouse, ripple e parallax do átomo. */
(function () {
    window.__strFx = true;
    const html = document.documentElement;
    html.classList.add('fx');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Revelar ao rolar ---------- */
    let io = null;
    if ('IntersectionObserver' in window && !reduceMotion) {
        io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }

    function observeReveals() {
        document.querySelectorAll('.reveal:not(.in)').forEach((node) => {
            if (io) io.observe(node); else node.classList.add('in');
        });
    }

    /* ---------- Indicadores deslizantes (abas, segmented) ---------- */
    function moveThumb(container, thumbSel, activeSel) {
        if (!container) return;
        const thumb = container.querySelector(thumbSel);
        const active = container.querySelector(activeSel);
        if (!thumb || !active) return;
        thumb.style.setProperty('--tx', `${active.offsetLeft}px`);
        thumb.style.setProperty('--ty', `${active.offsetTop}px`);
        thumb.style.setProperty('--tw', `${active.offsetWidth}px`);
        thumb.style.setProperty('--th', `${active.offsetHeight}px`);
    }

    function syncThumbs() {
        moveThumb(document.querySelector('.tabs'), '.tabs-thumb', '.tab.active');
        moveThumb(document.querySelector('.segmented'), '.seg-thumb', '.seg.active');
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.tab, .seg')) requestAnimationFrame(syncThumbs);
    });

    /* ---------- Contadores animados (primeira renderização) ---------- */
    let countersDone = false;
    function animateCounters() {
        if (countersDone || reduceMotion) return;
        countersDone = true;
        document.querySelectorAll('.tab .count').forEach((node) => {
            const target = Number(node.textContent) || 0;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min(1, (now - start) / 1100);
                const eased = 1 - Math.pow(1 - p, 3);
                node.textContent = String(Math.round(target * eased));
                if (p < 1) requestAnimationFrame(tick);
                else { node.textContent = String(target); syncThumbs(); }
            };
            requestAnimationFrame(tick);
        });
    }

    document.addEventListener('str:rendered', () => {
        observeReveals();
        requestAnimationFrame(syncThumbs);
    });

    /* ---------- Scrollspy da sidebar ---------- */
    const spyLinks = Array.from(document.querySelectorAll('.side-link[data-spy]'));
    const spyTargets = spyLinks.map((link) => document.getElementById(link.dataset.spy)).filter(Boolean);

    function updateSpy() {
        const probe = window.innerHeight * 0.3;
        let current = spyTargets[0];
        spyTargets.forEach((section) => {
            if (section.getBoundingClientRect().top - probe <= 0) current = section;
        });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = spyTargets[spyTargets.length - 1];
        }
        spyLinks.forEach((link) => link.classList.toggle('active', current && link.dataset.spy === current.id));
    }

    /* ---------- Barra de progresso de rolagem ---------- */
    const progress = document.querySelector('.scroll-progress');
    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) progress.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
            updateSpy();
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Brilho que segue o mouse ---------- */
    document.addEventListener('pointermove', (e) => {
        const card = e.target.closest && e.target.closest('.spot');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });

    /* ---------- Ripple nos botões ---------- */
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest && e.target.closest('.button');
        if (!btn || reduceMotion) return;
        const r = btn.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.className = 'ripple';
        dot.style.left = `${e.clientX - r.left}px`;
        dot.style.top = `${e.clientY - r.top}px`;
        btn.appendChild(dot);
        dot.addEventListener('animationend', () => dot.remove());
    });

    /* ---------- Parallax 3D do átomo ---------- */
    const hero = document.querySelector('.hero');
    const art = document.querySelector('.hero-art');
    if (hero && art && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('pointermove', (e) => {
            const r = art.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
            const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
            art.style.transform = `rotateY(${(dx * 22).toFixed(2)}deg) rotateX(${(-dy * 22).toFixed(2)}deg)`;
        });
        hero.addEventListener('pointerleave', () => { art.style.transform = ''; });
        art.style.transition = 'transform .4s ease-out';
    }

    /* A animação de entrada fixa transform; remove a classe ao terminar para liberar o parallax. */
    document.querySelectorAll('.hero-in').forEach((node) => {
        node.addEventListener('animationend', (e) => {
            if (e.target === node) node.classList.remove('hero-in');
        });
    });

    /* ---------- Início ---------- */
    function init() {
        observeReveals();
        syncThumbs();
        updateSpy();
        onScroll();
        animateCounters();
        if (window.StrI18n) window.StrI18n.onChange(() => requestAnimationFrame(syncThumbs));
        window.addEventListener('resize', () => requestAnimationFrame(syncThumbs));
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncThumbs);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
