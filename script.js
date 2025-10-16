// NAVBAR

const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });
}

     const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
        const reveals = document.querySelectorAll('.reveal');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.transitionTimingFunction = EASE;
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
        reveals.forEach(el => io.observe(el));

        // Parallax with mobile disable
        const mq = window.matchMedia('(max-width: 900px)');
        let parallaxActive = !mq.matches;
        const parallaxEls = [...document.querySelectorAll('.parallax, .blur, .layer')];

        function rafParallax() {
            if (!parallaxActive) return;
            const y = window.scrollY;
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.dataset.speed || 0);
                el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
            });
            ticking = false;
        }

        function applyParallaxMode() {
            parallaxActive = !mq.matches;
            if (!parallaxActive) {
                parallaxEls.forEach(el => { el.style.transform = 'translate3d(0,0,0)'; });
            } else {
                rafParallax();
            }
        }

        mq.addEventListener('change', applyParallaxMode);
        window.addEventListener('resize', applyParallaxMode);

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!parallaxActive) return;
            if (!ticking) { window.requestAnimationFrame(rafParallax); ticking = true; }
        });

        // first paint
        applyParallaxMode();

        // FAQ toggling 
        document.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                item.classList.toggle('open');
            });
        });

        /* ===== Liquid glass WebGL setup ===== */
        (() => {
            const canvas = document.getElementById('canvas');
            const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: false });
            const img = document.getElementById('sourceImage');
            if (!gl) return;

            const dpr = Math.max(1, window.devicePixelRatio || 1);
            function setCanvasSize() {
                canvas.width = Math.floor(window.innerWidth * dpr);
                canvas.height = Math.floor(window.innerHeight * dpr);
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
            setCanvasSize();
            window.addEventListener('resize', setCanvasSize, { passive: true });

            const vsSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
            const fsSource = document.getElementById('fragShader').textContent;

            const createShader = (type, source) => {
                const s = gl.createShader(type);
                gl.shaderSource(s, source);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    console.error('Shader error:', gl.getShaderInfoLog(s));
                    gl.deleteShader(s);
                    return null;
                }
                return s;
            };

            const vs = createShader(gl.VERTEX_SHADER, vsSource);
            const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
            const program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            gl.useProgram(program);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

            const uniforms = {
                resolution: gl.getUniformLocation(program, 'iResolution'),
                time: gl.getUniformLocation(program, 'iTime'),
                mouse: gl.getUniformLocation(program, 'iMouse'),
                texture: gl.getUniformLocation(program, 'iChannel0'),
            };

            // Mouse
            let mouse = [0, 0];
            const updateMouse = (x, y) => {
                mouse[0] = x * dpr;
                mouse[1] = (window.innerHeight - y) * dpr;
            };
            window.addEventListener('mousemove', e => updateMouse(e.clientX, e.clientY), { passive: true });
            window.addEventListener('touchmove', e => {
                const t = e.touches[0];
                if (t) updateMouse(t.clientX, t.clientY);
            }, { passive: true });

            // Texture
            const texture = gl.createTexture();
            function setupTexture() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            if (img.complete) setupTexture(); else img.onload = setupTexture;

            const start = performance.now();
            function render() {
                const t = (performance.now() - start) / 1000;
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
                gl.uniform1f(uniforms.time, t);
                gl.uniform4f(uniforms.mouse, mouse[0], mouse[1], 0, 0);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.uniform1i(uniforms.texture, 0);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(render);
            }
            render();
        })();

        /* ===== Reveal on view ===== */
        (() => {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const reveals = document.querySelectorAll('.reveal');
            const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
            if (prefersReduced) { reveals.forEach(el => el.classList.add('in')); return; }

            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.style.transitionTimingFunction = EASE;
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
            reveals.forEach(el => io.observe(el));
        })();

        /* ===== Parallax (disabled on <=900px) ===== */
        (() => {
            const els = [...document.querySelectorAll('.parallax, .blur, .layer')];
            const mq = window.matchMedia('(max-width: 900px)');
            let active = !mq.matches, ticking = false;

            function applyMode() {
                active = !mq.matches;
                if (!active) els.forEach(el => el.style.transform = 'translate3d(0,0,0)');
            }
            mq.addEventListener('change', applyMode);
            window.addEventListener('resize', applyMode);
            applyMode();

            function step() {
                const y = window.scrollY;
                els.forEach(el => {
                    const speed = parseFloat(el.dataset.speed || 0);
                    el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
                });
                ticking = false;
            }
            window.addEventListener('scroll', () => {
                if (!active || ticking) return;
                ticking = true; requestAnimationFrame(step);
            }, { passive: true });
            step();
        })();

        /* ===== FAQ accordion ===== */
        (() => {
            const items = document.querySelectorAll('.faq-item');
            items.forEach(item => {
                const btn = item.querySelector('.faq-question');
                btn.addEventListener('click', () => {
                    // close others
                    items.forEach(it => { if (it !== item) it.classList.remove('open'); });
                    item.classList.toggle('open');
                });
            });
        })();

        /* ===== Scroll-reactive SVG Curve ===== */
(() => {
  const curve = document.getElementById("curve");
  if (!curve) return; // skip if curve SVG not present

  let lastY = 0;
  const defaultCurveValue = 350;
  const curveRate = 3;
  let ticking = false;

  function scrollEvent(scrollY) {
    if (scrollY >= 0 && scrollY < defaultCurveValue) {
      const curveValue = defaultCurveValue - scrollY / curveRate;
      curve.setAttribute(
        "d",
        `M 800 300 Q 400 ${curveValue} 0 300 L 0 0 L 800 0 L 800 300 Z`
      );
    }
  }

  window.addEventListener("scroll", () => {
    lastY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        scrollEvent(lastY);
        ticking = false;
      });
      ticking = true;
    }
  });
})();


