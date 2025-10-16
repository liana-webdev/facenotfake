/* particles-init.js
   Subtle, slow particles over background. Remove this file from HTML to disable. */

(function () {
  const elId = 'fx-particles';
  const el = document.getElementById(elId);
  if (!el || !window.particlesJS) return;

  const CONFIG = {
    particles: {
      number: { value: 40, density: { enable: true, value_area: 900 } }, // fewer
      color: { value: "#ffffff" },
      shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
      opacity: { value: 0.35, random: true },
      size: { value: 2.2, random: true },
      line_linked: { enable: true, distance: 140, color: "#ffffff", opacity: 0.15, width: 1 },
      move: {
        enable: true,
        speed: 0.6,           // slower
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" }, // set to false to make it purely ambient
        onclick: { enable: false, mode: "push" },
        resize: true
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 }
      }
    },
    retina_detect: true
  };

  window.pJSDom = window.pJSDom || [];

  function init() {
    // avoid double init
    if (window.pJSDom.some(d => d.pJS && d.pJS.canvas.el.parentElement?.id === elId)) return;
    particlesJS(elId, CONFIG);
  }

  function destroy() {
    window.pJSDom.forEach((dom, i) => {
      if (dom && dom.pJS && dom.pJS.canvas.el.parentElement?.id === elId) {
        dom.pJS.fn.vendors.destroypJS();
        window.pJSDom.splice(i, 1);
      }
    });
    el.innerHTML = ""; // clear canvas
  }

  // expose a tiny toggle for convenience
  window.toggleParticles = function () {
    const active = window.pJSDom.some(d => d.pJS && d.pJS.canvas.el.parentElement?.id === elId);
    active ? destroy() : init();
  };

  init();
})();
