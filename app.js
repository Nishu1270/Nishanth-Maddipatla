/**
 * Maddipatla Venkat Nishanth — Portfolio Core Interactive Logic
 * High-performance, zero-dependency, clean modern script
 */

// Force fresh start at top of page on load / refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

if (window.location.hash) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
  window.scrollTo(0, 0);
}

window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  initIntroCanvasAnimation();
  initModalsSystem();
  initCinematicStoryGallery();
  initScrollReveal();
  initScrollSpyAndNavigation();
  initVerticalScrollTracker();
  initClipboardAndToasts();
});

/* ============================================================
   1. INTRO 3D PARTICLE & LIQUID CANVAS ANIMATION
   ============================================================ */
function initIntroCanvasAnimation() {
  const overlay = document.getElementById("intro-overlay");
  const canvas = document.getElementById("intro-canvas");
  const skipBtn = document.getElementById("skip-intro-btn");

  if (!canvas || !overlay) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  });

  const burstParticles = [];
  const ripples = [];
  const bgColors = ["#FF8A65", "#FFA07A", "#FF7043", "#8B1E2F", "#6B1724", "#FFFFFF", "#FFE0B2"];
  const fov = 400;

  function addBurst(x, y) {
    const clickX = x - width / 2;
    const clickY = y - height / 2;
    const color = bgColors[Math.floor(Math.random() * bgColors.length)];

    // Add ripple
    ripples.push({
      x,
      y,
      radius: 10,
      maxRadius: 280,
      alpha: 0.85,
      color
    });

    // Add 3D burst particles
    for (let i = 0; i < 55; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 11 + 4;
      const pColor = bgColors[Math.floor(Math.random() * bgColors.length)];

      burstParticles.push({
        x: clickX,
        y: clickY,
        z: Math.random() * 200 - 100,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 25,
        color: pColor,
        size: Math.random() * 3.5 + 2
      });
    }
  }

  overlay.addEventListener("click", (e) => {
    addBurst(e.clientX, e.clientY);
  });

  let animId;
  function render() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;

    // Render ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.radius += 6.5;
      rp.alpha *= 0.94;
      if (rp.radius > rp.maxRadius || rp.alpha < 0.01) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = rp.alpha;
      ctx.stroke();
    }

    // Render 3D burst particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.z += bp.vz;
      bp.vx *= 0.96;
      bp.vy *= 0.96;
      bp.vz *= 0.96;
      bp.life++;

      const zOffset = bp.z + 450;
      const scale = fov / zOffset;
      const px = cx + bp.x * scale;
      const py = cy + bp.y * scale;
      const progress = bp.life / bp.maxLife;
      const alpha = Math.max(0, 1 - progress);

      if (progress >= 1 || px < -50 || px > width + 50 || py < -50 || py > height + 50) {
        burstParticles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(px, py, bp.size * scale * (1 - progress * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = bp.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(render);
  }
  render();

  function dismissIntro() {
    if (overlay.classList.contains("fade-out")) return;
    overlay.classList.add("fade-out");

    // Force scroll position to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.classList.remove("intro-active");
    document.body.classList.remove("intro-active");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    setTimeout(() => {
      overlay.style.display = "none";
      cancelAnimationFrame(animId);
      triggerHeroEntrance();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 450);
  }

  // Auto transition after 2.4 seconds or tap anywhere
  const autoTimer = setTimeout(dismissIntro, 2400);

  overlay.addEventListener("click", () => {
    clearTimeout(autoTimer);
    dismissIntro();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      clearTimeout(autoTimer);
      dismissIntro();
    }
  }, { once: true });

  // Safety fallback for hero animation
  setTimeout(triggerHeroEntrance, 3200);
}

function triggerHeroEntrance() {
  const hero = document.getElementById("hero");
  if (hero && !hero.classList.contains("hero-animated")) {
    hero.classList.add("hero-animated");
  }
}

/* ============================================================
   2. MODALS SYSTEM CONTROLLER
   ============================================================ */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  
  const closeBtn = modal.querySelector(".modal-close-btn");
  if (closeBtn) closeBtn.focus();
}

function closeModal(modalId) {
  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.setAttribute("hidden", "true");
  } else {
    document.querySelectorAll(".modal-backdrop").forEach(m => m.setAttribute("hidden", "true"));
  }
  
  const anyOpen = document.querySelector(".modal-backdrop:not([hidden])");
  if (!anyOpen) {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}

function initModalsSystem() {
  // Close buttons
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = btn.getAttribute("data-close-modal");
      closeModal(target);
    });
  });

  // Backdrop click (closes when clicking anywhere outside the modal card)
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // Escape key safety
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // About In-Section View Switcher (Summary View vs Detailed Story View)
  const summaryView = document.getElementById("about-summary-view");
  const detailedView = document.getElementById("about-detailed-view");
  const readMoreBtn = document.getElementById("about-toggle-more-btn");
  const backToSummaryBtn = document.getElementById("about-back-to-summary-btn");

  if (readMoreBtn && summaryView && detailedView) {
    readMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      summaryView.classList.remove("active-panel");
      summaryView.classList.add("sliding-out-left");
      
      setTimeout(() => {
        summaryView.setAttribute("hidden", "true");
        summaryView.classList.remove("sliding-out-left");
        
        detailedView.removeAttribute("hidden");
        detailedView.classList.add("sliding-in-right", "active-panel");
        
        setTimeout(() => {
          detailedView.classList.remove("sliding-in-right");
        }, 350);

        const aboutSec = document.getElementById("about");
        if (aboutSec) {
          const rect = aboutSec.getBoundingClientRect();
          if (rect.top < -50 || rect.top > 150) {
            aboutSec.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 180);
    });
  }

  if (backToSummaryBtn && summaryView && detailedView) {
    backToSummaryBtn.addEventListener("click", (e) => {
      e.preventDefault();
      detailedView.classList.remove("active-panel");
      detailedView.classList.add("sliding-out-right");
      
      setTimeout(() => {
        detailedView.setAttribute("hidden", "true");
        detailedView.classList.remove("sliding-out-right");
        
        summaryView.removeAttribute("hidden");
        summaryView.classList.add("sliding-in-left", "active-panel");
        
        setTimeout(() => {
          summaryView.classList.remove("sliding-in-left");
        }, 350);

        const aboutSec = document.getElementById("about");
        if (aboutSec) {
          aboutSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
    });
  }

  // Vision & Mission Links (opens detailed story & vision)
  const capsuleAcademic = document.getElementById("capsule-academic-link");
  const mobileAcademic = document.getElementById("mobile-academic-link");
  [capsuleAcademic, mobileAcademic].forEach(link => {
    link?.addEventListener("click", (e) => {
      e.preventDefault();
      if (summaryView && detailedView && summaryView.classList.contains("active-panel")) {
        readMoreBtn?.click();
      } else {
        const aboutSec = document.getElementById("about");
        aboutSec?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Resume Download Button Trigger
  const resumeBtn = document.getElementById("open-resume-btn");
  if (resumeBtn) {
    const handleResumeDownload = () => {
      const link = document.createElement("a");
      link.href = "assets/docs/Maddipatla_Venkat_Nishanth_Resume.pdf?v=2.0";
      link.download = "Maddipatla_Venkat_Nishanth_Resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    resumeBtn.addEventListener("click", handleResumeDownload);
    resumeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleResumeDownload();
      }
    });
  }

  // CodeChef Details Modal Trigger
  const codechefBtn = document.getElementById("open-codechef-btn");
  codechefBtn?.addEventListener("click", () => openModal("codechef-modal"));
  codechefBtn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal("codechef-modal");
    }
  });

  // Hackathons Details Modal Trigger
  const hackathonsBtn = document.getElementById("open-hackathons-btn");
  hackathonsBtn?.addEventListener("click", () => openModal("hackathons-modal"));
  hackathonsBtn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal("hackathons-modal");
    }
  });

  // Certificate Viewer Modal Trigger
  const certModal = document.getElementById("certificate-modal");
  const certImg = document.getElementById("cert-display-img");
  const certIframe = document.getElementById("cert-display-iframe");
  const certTitle = document.getElementById("cert-modal-title");
  const certSubtitle = document.getElementById("cert-modal-subtitle");
  const certDownload = document.getElementById("cert-download-link");

  document.querySelectorAll(".view-cert-trigger-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const certType = btn.getAttribute("data-cert");

      if (certType === "prayatna") {
        if (certTitle) certTitle.textContent = "PRAYATNA 2.0 — Certificate of Participation";
        if (certSubtitle) certSubtitle.textContent = "SITE ACM Student Chapter & AITR ACM Chapter (07-02-2025)";
        if (certImg) {
          certImg.src = "assets/images/certificate_prayatna_2.png";
          certImg.hidden = false;
        }
        if (certIframe) {
          certIframe.src = "";
          certIframe.hidden = true;
        }
        if (certDownload) certDownload.href = "assets/images/certificate_prayatna_2.png";
      } else if (certType === "google") {
        if (certTitle) certTitle.textContent = "Google Solution Challenge 2026: Build with AI";
        if (certSubtitle) certSubtitle.textContent = "Conducted by Hack2Skill (22/07/2026) · ID: 2026H2S07SCBWAI-PS00798";
        if (certImg) {
          certImg.src = "assets/images/certificate_google_solution_challenge_2026.png";
          certImg.hidden = false;
        }
        if (certIframe) {
          certIframe.src = "";
          certIframe.hidden = true;
        }
        if (certDownload) certDownload.href = "assets/images/certificate_google_solution_challenge_2026.png";
      }

      openModal("certificate-modal");
    });
  });

  // Header Resume Trigger
  document.getElementById("header-resume-btn")?.addEventListener("click", () => openModal("resume-modal"));
  document.getElementById("mobile-resume-btn")?.addEventListener("click", () => {
    toggleMobileMenu(false);
    openModal("resume-modal");
  });

  // Dropdown Menu Toggle (Header Circular Menu Button)
  const circleMenuBtn = document.getElementById("header-circle-menu-btn");
  const mobileDropdown = document.getElementById("mobile-dropdown");
  
  function setDropdownState(isOpen) {
    if (isOpen) {
      mobileDropdown?.classList.add("open");
      circleMenuBtn?.setAttribute("aria-expanded", "true");
    } else {
      mobileDropdown?.classList.remove("open");
      circleMenuBtn?.setAttribute("aria-expanded", "false");
    }
  }

  circleMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !mobileDropdown?.classList.contains("open");
    setDropdownState(willOpen);
  });

  document.addEventListener("click", (e) => {
    if (!circleMenuBtn?.contains(e.target) && !mobileDropdown?.contains(e.target)) {
      setDropdownState(false);
    }
  });

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      setDropdownState(false);
      if (href && href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // Print Resume Trigger
  document.getElementById("print-resume-btn")?.addEventListener("click", () => {
    window.print();
  });
}

/* ============================================================
   3. SCROLL REVEAL OBSERVER
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll(".scroll-reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   4. SCROLL SPY & NAVIGATION CONTROLLER (Silky Smooth rAF Loop)
   ============================================================ */
function initScrollSpyAndNavigation() {
  // Back to top button
  const backToTopBtn = document.getElementById("back-to-top-btn");
  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Smooth navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Active section scroll spy & Floating Capsule Navbar visibility
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const capsuleNav = document.querySelector(".floating-capsule-nav-container");
  const capsuleItems = Array.from(document.querySelectorAll(".capsule-nav-item"));
  const heroSection = document.getElementById("hero");

  let ticking = false;

  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show floating capsule navbar smoothly when scrolling down past hero
    const heroHeight = heroSection ? heroSection.offsetHeight : 500;
    if (scrollY > heroHeight * 0.35 || scrollY > 200) {
      capsuleNav?.classList.add("visible");
    } else {
      capsuleNav?.classList.remove("visible");
    }

    // Determine active section
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
      const sectionId = current.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        capsuleItems.forEach(item => {
          const href = item.getAttribute("href");
          if (href === `#${sectionId}`) {
            item.classList.add("active");
          } else if (href && href.startsWith("#") && href !== `#${sectionId}`) {
            item.classList.remove("active");
          }
        });
        break;
      }
    }
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  requestTick(); // initial check
}

/* ============================================================
   4B. RIGHT EDGE INTERACTIVE VERTICAL SCROLL TRACKER (rAF Optimized)
   ============================================================ */
function initVerticalScrollTracker() {
  const tracker = document.getElementById("vertical-scroll-indicator");
  const track = tracker?.querySelector(".vertical-scroll-track");
  const fill = tracker?.querySelector(".vertical-scroll-fill");
  const dot = tracker?.querySelector(".vertical-scroll-dot");
  const btn = document.getElementById("vertical-scroll-btn");

  if (!tracker || !dot || !track) return;

  const darkSections = ["hero", "skills", "story", "vision"];
  let ticking = false;

  function updateScrollProgress() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

    const trackHeight = track.clientHeight || 64;
    const dotPos = progress * trackHeight;

    if (fill) fill.style.height = `${progress * 100}%`;
    dot.style.top = `${dotPos}px`;
    tracker.setAttribute("aria-valuenow", Math.round(progress * 100));

    const trackerRect = tracker.getBoundingClientRect();
    const trackerCenterY = trackerRect.top + trackerRect.height / 2;

    let currentSectionId = "hero";
    const allSections = document.querySelectorAll("section[id]");
    allSections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= trackerCenterY && rect.bottom >= trackerCenterY) {
        currentSectionId = sec.getAttribute("id");
      }
    });

    const isOverDarkSection = darkSections.includes(currentSectionId);

    if (isOverDarkSection) {
      tracker.classList.remove("theme-dark");
      tracker.classList.add("theme-light");
    } else {
      tracker.classList.remove("theme-light");
      tracker.classList.add("theme-dark");
    }
  }

  function requestTrackerTick() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Click handler to smoothly scroll to next section
  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    const sections = Array.from(document.querySelectorAll("section[id]"));
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const nextSection = sections.find(sec => sec.offsetTop > scrollY + 120);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  window.addEventListener("scroll", requestTrackerTick, { passive: true });
  window.addEventListener("resize", requestTrackerTick, { passive: true });
  requestTrackerTick();
}

/* ============================================================
   5. CLIPBOARD COPY & TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function initClipboardAndToasts() {
  document.querySelectorAll(".copy-quick-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute("data-copy");
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
        }).catch(() => {
          showToast("Failed to copy to clipboard");
        });
      }
    });
  });
}

/* ============================================================
   6. 3D AUTO-ROTATING ORBITAL FILM GALLERY & PHOTO LIGHTBOX
   ============================================================ */
function initCinematicStoryGallery() {
  const canvasContainer = document.getElementById("cinematic-story-canvas");
  const frameItems = document.querySelectorAll(".cinema-frame-item");
  const photoLightboxImg = document.getElementById("photo-lightbox-img");
  const photoLightboxTitle = document.getElementById("photo-lightbox-title");
  const photoLightboxCaption = document.getElementById("photo-lightbox-caption");

  // Open clean enlarged photo preview on click of any photo card
  frameItems.forEach(frame => {
    frame.addEventListener("click", (e) => {
      e.stopPropagation();
      const img = frame.querySelector("img");
      const titleText = frame.getAttribute("data-title") || frame.querySelector(".film-title")?.textContent || "";
      const captionText = frame.getAttribute("data-caption") || "";
      if (img && photoLightboxImg) {
        photoLightboxImg.src = img.src;
        photoLightboxImg.alt = img.alt || "Enlarged Photo";
        if (photoLightboxTitle) {
          photoLightboxTitle.textContent = titleText;
        }
        if (photoLightboxCaption) {
          photoLightboxCaption.textContent = captionText;
        }
        openModal("photo-lightbox-modal");
      }
    });
  });

  // ============================================================
  // 3D AUTO-ROTATING ORBITAL MOTION ENGINE (Medium Speed)
  // ============================================================
  if (!canvasContainer || !frameItems.length) return;

  let currentAngle = 0;
  let cursorSteer = 0;
  let targetSteer = 0;
  let cursorTiltY = 0;
  let targetTiltY = 0;
  let isDragging = false;
  let startX = 0;
  let dragVelocity = 0;

  const MEDIUM_SPEED = 0.0022; // Steady, smooth medium speed with or without cursor

  // Orbit animation loop
  function animateOrbit() {
    cursorSteer += (targetSteer - cursorSteer) * 0.06;
    cursorTiltY += (targetTiltY - cursorTiltY) * 0.06;

    if (!isDragging) {
      currentAngle += (MEDIUM_SPEED + cursorSteer);
    } else {
      currentAngle += dragVelocity;
      dragVelocity *= 0.94; // inertia damping
    }

    const containerWidth = canvasContainer.clientWidth || window.innerWidth;
    const containerHeight = canvasContainer.clientHeight || 840;
    
    // Dynamic elliptical radii reactive to vertical cursor tilt
    const rx = Math.min(containerWidth * 0.42, 540);
    const ry = Math.min(containerHeight * 0.35, 270) + (cursorTiltY * 35);
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const totalFrames = frameItems.length;

    frameItems.forEach((frame, i) => {
      // Angular position for each item evenly distributed around 360 degrees (60 deg each for 6 photos)
      const angle = (i * (2 * Math.PI / totalFrames)) + currentAngle;
      
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Coordinate placement
      const x = centerX + rx * cosA;
      const y = centerY + ry * sinA;

      // 3D Depth calculation: sinA ranges from -1 (top/back) to +1 (bottom/front)
      const depthFactor = (sinA + 1) / 2;
      
      // Dynamic Scale: scales up to 1.28x when in front of text, and down to 0.70x when moving behind
      const scale = 0.70 + 0.58 * depthFactor;
      
      // Dynamic Opacity: 0.48 (back) to 1.0 (front)
      const opacity = 0.48 + 0.52 * depthFactor;
      
      // Z-Index: 5 (back, behind center headline at z=15) to 35 (front, clearly in front of center headline)
      const zIndex = Math.round(5 + 30 * depthFactor);

      // Subtle dynamic angle tilt facing orbit tangent + vertical perspective
      const tiltAngle = (cosA * 8) + (cursorTiltY * 6);

      if (!frame.matches(":hover")) {
        frame.style.left = `${x}px`;
        frame.style.top = `${y}px`;
        frame.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${tiltAngle}deg)`;
        frame.style.opacity = `${opacity}`;
        frame.style.zIndex = `${zIndex}`;
      }
    });

    requestAnimationFrame(animateOrbit);
  }

  // Cursor movement over canvas: gentle medium-speed steering and 3D tilt
  canvasContainer.addEventListener("mousemove", (e) => {
    const rect = canvasContainer.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    targetSteer = relX * 0.0010; // smooth steering adjustment
    targetTiltY = relY;
  });

  // When mouse leaves, smoothly restore natural medium orbit
  canvasContainer.addEventListener("mouseleave", () => {
    targetSteer = 0;
    targetTiltY = 0;
    isDragging = false;
  });

  // Drag / Swipe to rotate manually
  canvasContainer.addEventListener("mousedown", (e) => {
    if (e.target.closest(".cinema-frame-item")) return;
    isDragging = true;
    startX = e.clientX;
    dragVelocity = 0;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    dragVelocity = deltaX * 0.0006;
    startX = e.clientX;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch drag for mobile
  canvasContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && !e.target.closest(".cinema-frame-item")) {
      isDragging = true;
      startX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startX;
    dragVelocity = deltaX * 0.0008;
    startX = e.touches[0].clientX;
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Start the continuous 3D orbital rotation
  animateOrbit();
}

