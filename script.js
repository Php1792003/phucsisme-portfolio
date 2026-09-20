/* ==========================================================
   Portfolio – Phạm Hoàng Phúc
   GSAP + ScrollTrigger. Toàn bộ hiệu ứng có fallback:
   - Không tải được GSAP  -> trang vẫn hiển thị đầy đủ nội dung
   - prefers-reduced-motion -> tắt hiệu ứng, giữ chức năng
   ========================================================== */
(() => {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const animate = hasGsap && !reduce;

    if (!animate) {
        document.documentElement.classList.remove('js');
        document.body.classList.remove('loading');
    }

    const EMAIL = 'psaigon179@gmail.com';
    let menuOpen = false;

    /* ------------------------------------------------------
       Helpers
       ------------------------------------------------------ */
    function splitChars(el) {
        const text = el.textContent.trim().replace(/\s+/g, ' ').normalize('NFC');
        el.setAttribute('aria-label', text);
        el.textContent = '';
        const chars = [];
        const words = text.split(' ');
        words.forEach((word, wi) => {
            const w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            Array.from(word).forEach(letter => {
                const mask = document.createElement('span');
                mask.className = 'cm';
                const c = document.createElement('span');
                c.className = 'ch';
                c.textContent = letter;
                mask.appendChild(c);
                w.appendChild(mask);
                chars.push(c);
            });
            el.appendChild(w);
            if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        return chars;
    }

    function splitWords(el) {
        const text = el.textContent.trim().replace(/\s+/g, ' ').normalize('NFC');
        el.setAttribute('aria-label', text);
        el.textContent = '';
        const spans = [];
        text.split(' ').forEach((word, i, arr) => {
            const s = document.createElement('span');
            s.className = 'wd';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = word;
            el.appendChild(s);
            if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
            spans.push(s);
        });
        return spans;
    }

    let toastTimer;
    function toast(msg) {
        const el = $('#toast');
        if (!el) return;
        el.textContent = msg;
        clearTimeout(toastTimer);
        if (animate) {
            gsap.killTweensOf(el);
            gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .4, ease: 'power3.out' });
            toastTimer = setTimeout(() => gsap.to(el, { autoAlpha: 0, y: 20, duration: .4 }), 2600);
        } else {
            el.style.opacity = 1; el.style.visibility = 'visible';
            toastTimer = setTimeout(() => { el.style.opacity = 0; el.style.visibility = 'hidden'; }, 2600);
        }
    }

    /* ------------------------------------------------------
       Chức năng cơ bản (chạy cả khi tắt hiệu ứng)
       ------------------------------------------------------ */
    function initTheme() {
        const btn = $('#themeToggle');
        const icon = btn && $('i', btn);
        if (!btn || !icon) return;
        const root = document.documentElement;
        const paint = theme => {
            root.setAttribute('data-theme', theme);
            try { localStorage.setItem('theme', theme); } catch (e) { }
            icon.className = theme === 'light' ? 'ri-sun-line' : 'ri-moon-line';
        };
        icon.className = root.getAttribute('data-theme') === 'light' ? 'ri-sun-line' : 'ri-moon-line';
        btn.addEventListener('click', () => {
            root.classList.add('theme-anim');
            paint(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
            if (animate) gsap.fromTo(icon, { rotation: -90, scale: .4 }, { rotation: 0, scale: 1, duration: .5, ease: 'back.out(2)' });
            setTimeout(() => root.classList.remove('theme-anim'), 650);
        });
    }

    function setMenu(open) {
        const menu = $('#mobileMenu');
        const toggle = $('#navToggle');
        if (!menu || !toggle) return;
        menuOpen = open;
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
        menu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';

        if (!animate) { menu.classList.toggle('open', open); return; }

        const from = 'circle(0% at calc(100% - 40px) 40px)';
        const to = 'circle(150% at calc(100% - 40px) 40px)';
        if (open) {
            menu.classList.add('open');
            gsap.fromTo(menu, { clipPath: from }, { clipPath: to, duration: .7, ease: 'power3.inOut' });
            gsap.fromTo($$('li', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, delay: .25, ease: 'power3.out' });
        } else {
            gsap.to(menu, { clipPath: from, duration: .5, ease: 'power3.inOut', onComplete: () => menu.classList.remove('open') });
        }
    }

    function initNav() {
        const toggle = $('#navToggle');
        if (toggle) toggle.addEventListener('click', () => setMenu(!menuOpen));

        $$('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const href = a.getAttribute('href');
                const target = href.length > 1 ? $(href) : null;
                if (!target) return;
                e.preventDefault();
                if (menuOpen) setMenu(false);
                const y = target.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
            });
        });

        const toTop = $('#toTop');
        if (toTop) {
            toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
            if (!animate) {
                window.addEventListener('scroll', () => {
                    const on = window.scrollY > 700;
                    toTop.style.opacity = on ? 1 : 0;
                    toTop.style.visibility = on ? 'visible' : 'hidden';
                }, { passive: true });
            }
        }
    }

    function initForm() {
        const form = $('#contactForm');
        if (form) {
            form.addEventListener('submit', async e => {
                e.preventDefault();
                const btn = $('button[type="submit"]', form);
                const originalText = btn.innerHTML;

                const name = $('#name').value.trim();
                const email = $('#email').value.trim();
                const subject = $('#subject').value.trim() || `Liên hệ từ portfolio – ${name}`;
                const body = `${$('#message').value.trim()}\n\n— ${name} (${email})`;

                // Hiển thị trạng thái loading
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span> Đang gửi...</span>';
                btn.style.pointerEvents = 'none';

                try {
                    // Thay thế bằng formspree URL của bạn
                    const API_URL = 'https://formspree.io/f/mqpaeaap';

                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ name, email, subject, message: body })
                    });

                    if (response.ok) {
                        toast('Gửi tin nhắn thành công! Tôi sẽ phản hồi sớm nhất.');
                        form.reset();
                    } else {
                        throw new Error('Lỗi từ server');
                    }
                } catch (error) {
                    toast('Chưa cấu hình API hoặc có lỗi mạng. Đang chuyển sang email mặc định...');
                    // Fallback to mailto nếu lỗi hoặc chưa có formspree
                    setTimeout(() => {
                        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }, 2000);
                } finally {
                    // Phục hồi nút bấm
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                }
            });
        }

        const copy = $('#copyMail');
        if (copy) {
            copy.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(EMAIL);
                    toast('Đã sao chép email vào clipboard');
                } catch (e) {
                    toast('Không thể sao chép tự động. Hãy chọn và sao chép email thủ công.');
                }
            });
        }
    }

    function initSpot() {
        $$('[data-spot]').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                el.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* ------------------------------------------------------
       Hoa văn trống đồng (sinh bằng JS cho gọn markup)
       ------------------------------------------------------ */
    function buildDrum() {
        const ns = 'http://www.w3.org/2000/svg';
        const make = (group, count, r0, r1, half) => {
            if (!group) return;
            for (let i = 0; i < count; i++) {
                const p = document.createElementNS(ns, 'polygon');
                p.setAttribute('points', `${200 - half},${200 - r0} ${200 + half},${200 - r0} 200,${200 - r1}`);
                p.setAttribute('transform', `rotate(${(i * 360) / count} 200 200)`);
                group.appendChild(p);
            }
        };
        make($('#drumRays'), 24, 170, 196, 9);
        make($('#drumRays2'), 16, 138, 154, 7);
    }

    /* ------------------------------------------------------
       Preloader: Quantum Orbit Core & Motion Path Animation
       ------------------------------------------------------ */
    function runPreloader(onDone) {
        const pre = $('#preloader');
        let seen = false;
        try { seen = sessionStorage.getItem('seen') === '1'; sessionStorage.setItem('seen', '1'); } catch (e) { }

        let called = false;
        // Mở khoá trang: bỏ khoá cuộn, cho phép click xuyên qua preloader, rồi chạy hero
        const unlock = () => {
            if (pre) pre.style.pointerEvents = 'none';
            document.body.classList.remove('loading');
            if (!called) { called = true; onDone(); }
        };
        // Luôn gỡ hẳn preloader khỏi trang khi kết thúc (tránh chặn chuột)
        const remove = () => { unlock(); if (pre) pre.style.display = 'none'; };
        setTimeout(remove, 7000); // chốt an toàn

        const num = $('#plNum');
        const bar = $('#plBar');
        const statusEl = $('#plStatus');
        const isEn = document.documentElement.lang === 'en';

        const orbit1 = $('#plOrbit1');
        const orbit2 = $('#plOrbit2');
        const orb1 = $('#plOrb1');
        const orb2 = $('#plOrb2');
        const core = $('#plCore');

        let len1 = 320, len2 = 320;
        try {
            if (orbit1 && orbit1.getTotalLength) len1 = orbit1.getTotalLength();
            if (orbit2 && orbit2.getTotalLength) len2 = orbit2.getTotalLength();
        } catch (e) { }

        if (orbit1) gsap.set(orbit1, { strokeDasharray: len1, strokeDashoffset: len1 });
        if (orbit2) gsap.set(orbit2, { strokeDasharray: len2, strokeDashoffset: len2 });

        const tl = gsap.timeline({ onComplete: remove });
        const counter = { v: 0 };

        const updateStatus = (val) => {
            if (!statusEl) return;
            if (isEn) {
                if (val < 32) statusEl.textContent = 'INITIALIZING SYSTEM...';
                else if (val < 72) statusEl.textContent = 'LOADING MODULES...';
                else if (val < 98) statusEl.textContent = 'PREPARING INTERFACE...';
                else statusEl.textContent = 'SYSTEM READY';
            } else {
                if (val < 32) statusEl.textContent = 'ĐANG KHỞI TẠO HỆ THỐNG...';
                else if (val < 72) statusEl.textContent = 'TẢI TÀI NGUYÊN & MODULES...';
                else if (val < 98) statusEl.textContent = 'THIẾT LẬP GIAO DIỆN...';
                else statusEl.textContent = 'HỆ THỐNG SẴN SÀNG';
            }
        };

        tl.to(counter, {
            v: 100,
            duration: 3.5,
            ease: 'power2.inOut',
            onUpdate() {
                const val = Math.round(counter.v);
                if (num) num.textContent = val;
                if (bar) bar.style.transform = `scaleX(${counter.v / 100})`;
                updateStatus(val);

                const fraction = counter.v / 100;

                // Draw orbit paths
                if (orbit1) orbit1.style.strokeDashoffset = len1 * (1 - fraction);
                if (orbit2) orbit2.style.strokeDashoffset = len2 * (1 - fraction);

                // Animate Orbs along paths (using getPointAtLength)
                if (orbit1 && orb1 && orbit1.getPointAtLength) {
                    const d1 = (fraction * 2.2 * len1) % len1;
                    const p1 = orbit1.getPointAtLength(d1);
                    orb1.setAttribute('transform', `translate(${p1.x}, ${p1.y})`);
                }
                if (orbit2 && orb2 && orbit2.getPointAtLength) {
                    const d2 = ((1 - fraction * 2.2) * len2 % len2 + len2) % len2;
                    const p2 = orbit2.getPointAtLength(d2);
                    orb2.setAttribute('transform', `translate(${p2.x}, ${p2.y})`);
                }
            }
        }, 0)
            .to(core, { scale: 1.15, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }, '>-0.1')
            .to('.pl-center', { opacity: 0, y: -24, scale: 0.95, duration: 0.45, ease: 'power2.in' }, '+=0.08')
            .to('.pl-top', { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '>-0.05')
            .to('.pl-bot', { yPercent: 100, duration: 0.85, ease: 'power4.inOut' }, '<')
            .add(unlock, '<0.3');

        if (seen) tl.timeScale(1.4);
    }

    /* ------------------------------------------------------
       Hero
       ------------------------------------------------------ */
    function buildHero() {
        const chars = $$('.hero-name').flatMap(splitChars);
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });

        tl.from('.nav-pill', { yPercent: -170, opacity: 0, duration: 1 }, 0)
            .from(chars, { yPercent: 118, rotate: 6, duration: 1.1, stagger: .045 }, .05)
            .from('[data-h]', { y: 28, opacity: 0, duration: .9, stagger: .09 }, .15)
            .from('.drum', { scale: .6, opacity: 0, rotation: -40, duration: 1.6, ease: 'power3.out' }, 0)
            .fromTo('.profile-img-wrap',
                { clipPath: 'polygon(50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%)' },
                { clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', duration: 1.4, ease: 'power4.inOut' }, .1)
            .from('.mp', { scale: 0, opacity: 0, duration: .8, stagger: .1, ease: 'back.out(2.4)' }, .8)
            .from('.profile-status', { y: 20, opacity: 0, duration: .8 }, 1.2)
            .from('.scroll-hint', { opacity: 0, duration: .8 }, 1.5)
            .add(() => { startRoles(); startFloats(); }, 1.2);

        return tl;
    }

    function startRoles() {
        const el = $('#roleText');
        if (!el) return;
        const roles = ['Software Developer', 'Backend Engineer', 'Full-stack Developer', 'Cloud & DevOps', 'Data Reviewer'];
        let i = 0;

        const type = (text, cb) => {
            el.textContent = '';
            let charIndex = 0;
            const interval = setInterval(() => {
                el.textContent += text[charIndex];
                charIndex++;
                if (charIndex === text.length) {
                    clearInterval(interval);
                    if (cb) cb();
                }
            }, 80);
        };

        const erase = (cb) => {
            let text = el.textContent;
            const interval = setInterval(() => {
                text = text.slice(0, -1);
                el.textContent = text;
                if (text.length === 0) {
                    clearInterval(interval);
                    if (cb) cb();
                }
            }, 40);
        };

        const cycle = () => {
            setTimeout(() => {
                erase(() => {
                    i = (i + 1) % roles.length;
                    setTimeout(() => {
                        type(roles[i], cycle);
                    }, 300);
                });
            }, 2500);
        };

        // Bắt đầu chu kỳ gõ từ chữ đầu tiên ngay khi tải
        el.textContent = '';
        setTimeout(() => {
            type(roles[i], cycle);
        }, 500);
    }

    function startFloats() {
        gsap.to('.mp', {
            y: 'random(-14, 14)', x: 'random(-8, 8)', rotation: 'random(-25, 25)',
            duration: 'random(2.4, 4)', yoyo: true, repeat: -1, ease: 'sine.inOut',
            stagger: { each: .3, from: 'random' }
        });
    }

    function initHeroMotion() {
        gsap.to('#drumRays', { rotation: 360, svgOrigin: '200 200', duration: 90, repeat: -1, ease: 'none' });
        gsap.to('#drumRays2', { rotation: -360, svgOrigin: '200 200', duration: 60, repeat: -1, ease: 'none' });

        gsap.to('.hero-container', {
            yPercent: -8, opacity: .15, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero-glow', {
            yPercent: 40, ease: 'none', stagger: .1,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });

        if (!fine) return;
        const hero = $('#hero');
        const layers = $$('[data-depth]').map(el => ({
            d: +el.dataset.depth,
            x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3.out' })
        }));
        hero.addEventListener('mousemove', e => {
            const nx = e.clientX / window.innerWidth - .5;
            const ny = e.clientY / window.innerHeight - .5;
            layers.forEach(l => { l.x(-nx * l.d * 2); l.y(-ny * l.d * 2); });
        });
        hero.addEventListener('mouseleave', () => layers.forEach(l => { l.x(0); l.y(0); }));
    }

    /* ------------------------------------------------------
       Tương tác: con trỏ, nam châm, nghiêng 3D
       ------------------------------------------------------ */
    function initCursor() {
        if (!fine) return;
        document.body.classList.add('has-cursor');
        const dot = $('.cursor-dot'), ring = $('.cursor-ring');

        // Set up the standard cursor movement
        const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
        const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });

        // Setup text trail pool
        const trailText = "PHAM HOANG PHUC ";
        const poolSize = 40;
        const pool = [];
        for (let i = 0; i < poolSize; i++) {
            const span = document.createElement('span');
            span.className = 'trail-char';
            span.textContent = trailText[i % trailText.length];
            span.style.opacity = 0;
            document.body.appendChild(span);
            pool.push({ el: span });
        }
        let poolIdx = 0;
        let lastX = 0, lastY = 0;
        const distanceThreshold = 18;

        window.addEventListener('mousemove', e => {
            dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);

            // Text trail logic
            const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
            if (dist > distanceThreshold) {
                lastX = e.clientX;
                lastY = e.clientY;

                const p = pool[poolIdx];
                poolIdx = (poolIdx + 1) % poolSize;

                gsap.killTweensOf(p.el);
                gsap.set(p.el, { x: e.clientX + 8, y: e.clientY + 8, autoAlpha: 1, scale: 1 });
                gsap.to(p.el, {
                    y: e.clientY + 25,
                    autoAlpha: 0,
                    scale: 0.6,
                    duration: 1.2,
                    ease: "power2.out"
                });
            }
        });
        document.addEventListener('mouseover', e => {
            ring.classList.toggle('hover', !!e.target.closest('a, button, .magnetic, [data-cursor]'));
        });
    }

    function initMagnetic() {
        if (!fine) return;
        $$('.magnetic').forEach(el => {
            const xTo = gsap.quickTo(el, 'x', { duration: .7, ease: 'elastic.out(1, .45)' });
            const yTo = gsap.quickTo(el, 'y', { duration: .7, ease: 'elastic.out(1, .45)' });
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * .35);
                yTo((e.clientY - r.top - r.height / 2) * .35);
            });
            el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
        });
    }

    function initTilt() {
        if (!fine) return;
        $$('[data-tilt]').forEach(wrap => {
            const el = $('.radar, .jh-stack', wrap);
            if (!el) return;
            gsap.set(el, { transformPerspective: 900 });
            const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3.out' });
            const ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3.out' });
            wrap.addEventListener('mousemove', e => {
                const r = wrap.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - .5) * 22);
                rx(-((e.clientY - r.top) / r.height - .5) * 22);
            });
            wrap.addEventListener('mouseleave', () => { rx(0); ry(0); });
        });

        const logo = $('#navLogo');
        if (logo) logo.addEventListener('mouseenter', () =>
            gsap.fromTo('.nav-bird', { rotation: 0 }, { rotation: 360, duration: .9, ease: 'back.out(1.6)' }));
    }

    /* macOS Dock: icon phóng to theo khoảng cách tới con trỏ, đẩy các icon bên cạnh ra xa */
    function initDock() {
        const dock = $('#dock');
        if (!dock || !fine) return;
        const items = $$('.nav-link', dock);
        const n = items.length;
        const size = 40, gap = 10, maxScale = 1.7, sigma = 62, padX = 6;
        const setters = items.map(el => ({
            s: gsap.quickTo(el, 'scale', { duration: .28, ease: 'power3.out' }),
            x: gsap.quickTo(el, 'x', { duration: .28, ease: 'power3.out' })
        }));
        const baseCenter = i => padX + i * (size + gap) + size / 2;
        const dockW = padX * 2 + n * size + (n - 1) * gap;

        dock.addEventListener('mousemove', e => {
            const mx = e.clientX - dock.getBoundingClientRect().left;
            const scales = items.map((_, i) => 1 + (maxScale - 1) * Math.exp(-Math.pow(mx - baseCenter(i), 2) / (2 * sigma * sigma)));
            const total = scales.reduce((a, s) => a + size * s, 0) + gap * (n - 1);
            let left = dockW / 2 - total / 2;
            scales.forEach((s, i) => {
                const w = size * s;
                setters[i].s(s);
                setters[i].x(left + w / 2 - baseCenter(i));
                left += w + gap;
            });
        });
        dock.addEventListener('mouseleave', () => setters.forEach(t => { t.s(1); t.x(0); }));
    }

    /* Cursor trail: chuỗi chấm bám theo chuột, nhỏ và mờ dần về đuôi */
    function initTrail() {
        if (!fine) return;
        const N = 16;
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const dots = [];
        for (let i = 0; i < N; i++) {
            const el = document.createElement('div');
            const size = Math.max(3, 14 - i * .72);
            el.className = 'trail-dot';
            el.setAttribute('aria-hidden', 'true');
            el.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;opacity:${(1 - i / N) * .75};background:${gsap.utils.interpolate('#2fbf8f', '#d9a441', i / N)}`;
            document.body.appendChild(el);
            dots.push({ el, x: mouse.x, y: mouse.y, sx: gsap.quickSetter(el, 'x', 'px'), sy: gsap.quickSetter(el, 'y', 'px') });
        }
        let shown = false;
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX; mouse.y = e.clientY;
            if (!shown) { shown = true; dots.forEach(d => { d.x = mouse.x; d.y = mouse.y; d.el.style.visibility = 'visible'; }); }
        });
        document.documentElement.addEventListener('mouseleave', () => { shown = false; dots.forEach(d => { d.el.style.visibility = 'hidden'; }); });
        gsap.ticker.add(() => {
            if (!shown) return;
            let px = mouse.x, py = mouse.y;
            dots.forEach((d, i) => {
                const k = i === 0 ? .55 : .4;
                d.x += (px - d.x) * k; d.y += (py - d.y) * k;
                d.sx(d.x); d.sy(d.y);
                px = d.x; py = d.y;
            });
        });
    }

    /* ------------------------------------------------------
       Cuộn trang
       ------------------------------------------------------ */
    function initNavScroll() {
        gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });

        const pill = $('.nav-pill');
        const toTop = $('#toTop');
        let hidden = false, topShown = false;

        ScrollTrigger.create({
            start: 0, end: 'max',
            onUpdate: self => {
                const y = self.scroll();
                const shouldHide = self.direction === 1 && y > 320 && !menuOpen;
                if (shouldHide !== hidden) {
                    hidden = shouldHide;
                    gsap.to(pill, { yPercent: hidden ? -170 : 0, duration: .5, ease: 'power3.out', overwrite: 'auto' });
                }
                const showTop = y > 700;
                if (showTop !== topShown) {
                    topShown = showTop;
                    gsap.to(toTop, { autoAlpha: showTop ? 1 : 0, y: showTop ? 0 : 12, duration: .4 });
                }
            }
        });

        const links = $$('.nav-link');
        $$('main section[id]').forEach(sec => {
            ScrollTrigger.create({
                trigger: sec, start: 'top 50%', end: 'bottom 50%',
                onToggle: s => {
                    if (s.isActive) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id));
                }
            });
        });
    }

    function initMarquee() {
        const tweens = [];
        $$('.marquee-row').forEach(row => {
            const track = $('.marquee-track', row);
            track.innerHTML += track.innerHTML;
            const dir = +row.dataset.dir;
            tweens.push(dir > 0
                ? gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
                : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 40, ease: 'none', repeat: -1 }));
        });
        // Cuộn càng nhanh, chữ chạy càng nhanh rồi tự giảm về tốc độ thường
        ScrollTrigger.create({
            start: 0, end: 'max',
            onUpdate: s => {
                const k = 1 + Math.min(Math.abs(s.getVelocity()) / 180, 10);
                tweens.forEach(t => t.timeScale(Math.max(t.timeScale(), k)));
            }
        });
        gsap.ticker.add(() => tweens.forEach(t => {
            const c = t.timeScale();
            if (c > 1.001) t.timeScale(c + (1 - c) * .06);
        }));
    }

    function initTitles() {
        $$('[data-split]').forEach(el => {
            if (el.closest('.hero-title')) return;
            const chars = splitChars(el);
            gsap.from(chars, {
                yPercent: 118, rotate: 5, duration: 1, stagger: .025, ease: 'power4.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true }
            });
        });
    }

    function initReveal() {
        const els = $$('[data-reveal]');
        els.forEach(el => {
            const v = el.dataset.reveal;
            gsap.set(el, { opacity: 0, y: (v === 'left' || v === 'right') ? 0 : 36, x: v === 'left' ? -50 : v === 'right' ? 50 : 0 });
        });
        ScrollTrigger.batch(els, {
            start: 'top 90%', once: true,
            onEnter: batch => gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: .9, stagger: .12, ease: 'power3.out' })
        });
    }

    function initAbout() {
        const lead = $('#aboutLead');
        if (lead) {
            const words = splitWords(lead);
            gsap.fromTo(words, { opacity: .14 }, {
                opacity: 1, stagger: .06, ease: 'none',
                scrollTrigger: { trigger: lead, start: 'top 82%', end: 'bottom 48%', scrub: true }
            });
        }
        $$('[data-count]').forEach(el => {
            const target = +el.dataset.count;
            const o = { v: 0 };
            ScrollTrigger.create({
                trigger: el, start: 'top 92%', once: true,
                onEnter: () => gsap.to(o, { v: target, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } })
            });
        });
    }

    function initTimeline() {
        gsap.fromTo('.tl-progress', { scaleY: 0 }, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 70%', scrub: .4 }
        });

        $$('.tl-item').forEach(item => {
            ScrollTrigger.create({ trigger: item, start: 'top 62%', toggleClass: { targets: item, className: 'is-active' } });

            const card = $('.tl-card', item);
            gsap.from(card, {
                clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 1.1, ease: 'power4.out',
                scrollTrigger: { trigger: item, start: 'top 84%', once: true }
            });
            gsap.from($$('.tl-company h3, .tl-date, .role-title, .role-project, .role-list li, .tags span', card), {
                x: -22, opacity: 0, duration: .7, stagger: .045, delay: .25, ease: 'power3.out',
                scrollTrigger: { trigger: item, start: 'top 80%', once: true }
            });
        });
    }

    function initProjects() {
        // Xuất hiện trước, sau đó mới tạo hiệu ứng xếp chồng để không lấy sai giá trị đầu
        const cards = $$('.proj');
        cards.forEach(c => gsap.from(c, {
            y: 90, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: c, start: 'top 92%', once: true }
        }));

        gsap.matchMedia().add('(min-width: 861px)', () => {
            cards.forEach((c, i) => {
                const next = cards[i + 1];
                if (!next) return;
                gsap.fromTo(c, { scale: 1, opacity: 1 }, {
                    scale: .93, opacity: .4, ease: 'none', immediateRender: false,
                    scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 130px', scrub: true }
                });
            });
        });

        gsap.to('.radar-sweep', { rotation: 360, duration: 4, repeat: -1, ease: 'none' });
        gsap.to('.blip', { scale: 1.7, opacity: .35, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: { each: .35, from: 'random' } });
        gsap.to('.jh-card', { y: 'random(-10, 10)', duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: .3 });
        gsap.to('.jh-lens', { x: -18, y: 14, rotation: -14, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    function initSkillsEdu() {
        $$('.skill-row').forEach(row => {
            gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%', once: true } })
                .from($('h3', row), { x: -40, opacity: 0, duration: .8, ease: 'power3.out' })
                .from($$('li', row), { scale: .6, opacity: 0, y: 14, duration: .55, stagger: .05, ease: 'back.out(2)' }, '-=.5');
        });
        $$('.edu').forEach(row => {
            gsap.from(row, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } });
        });
    }

    /* ------------------------------------------------------
       Khởi tạo
       ------------------------------------------------------ */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNav();
        initForm();
        initSpot();

        if (!animate) return;

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        buildDrum();
        initCursor();
        initMagnetic();
        initTilt();
        initDock();
        initTrail();

        const heroTl = buildHero();
        initHeroMotion();
        initNavScroll();
        initMarquee();
        initTitles();
        initReveal();
        initAbout();
        initTimeline();
        initProjects();
        initSkillsEdu();

        runPreloader(() => heroTl.play());
        window.addEventListener('load', () => ScrollTrigger.refresh());
    });
})();