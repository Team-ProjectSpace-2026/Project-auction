import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NavBar from '../../components/landing/NavBar';
import HeroSection from '../../components/landing/HeroSection';
import RecentAuctions from '../../components/landing/RecentAuctions';
import OurAuctions from '../../components/landing/OurAuctions';
import AboutSection from '../../components/landing/AboutSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import Footer from '../../components/landing/Footer';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Helper: split text into <span class="char"> elements ── */
const splitTextToChars = (el) => {
  const text = el.textContent;
  el.innerHTML = '';
  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    el.appendChild(span);
  });
  return el.querySelectorAll('.char');
};

const LandingPage = () => {
  const heroRef = useRef(null);
  const sectionsRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const sections = sectionsRef.current;

    if (!hero || !sections) return;

    /* ──────────────────────────────────────────────
       1. Hero headline SplitText character animation
       ────────────────────────────────────────────── */
    const charSplitEls = hero.querySelectorAll('[data-char-split]');
    const allChars = [];

    charSplitEls.forEach((el) => {
      const chars = splitTextToChars(el);
      allChars.push(...chars);
    });

    if (allChars.length) {
      gsap.set(allChars, { opacity: 0, y: 30, rotateX: -90 });

      gsap.to(allChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: hero,
          start: 'top 90%',
          once: true,
        },
      });
    }

    /* ──────────────────────────────────────────────
       2. Multi-speed parallax depth layers
       ────────────────────────────────────────────── */
    const particles = hero.querySelector('.hero-particles');
    const bgImage = hero.querySelector('.hero-bg-image-wrapper');
    const canvas = hero.querySelector('canvas');

    // Hero background layers — different speeds for depth
    if (particles) {
      gsap.to(particles, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    if (bgImage) {
      gsap.to(bgImage, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    if (canvas) {
      gsap.to(canvas, {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    // Section internal depth — subtle drift for depth feel
    const sectionDepthConfigs = [
      { selector: '#recent-auctions .section-header', y: -25 },
      { selector: '#our-auctions .features-grid', y: 15 },
      { selector: '#about .content-stats', y: -20 },
      { selector: '#features .features-grid', y: 12 },
    ];

    sectionDepthConfigs.forEach(({ selector, y }) => {
      const target = sections.querySelector(selector);
      if (target) {
        gsap.to(target, {
          y,
          ease: 'none',
          scrollTrigger: {
            trigger: target.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        });
      }
    });

    /* ──────────────────────────────────────────────
       3. Enhanced section reveal animations
       ────────────────────────────────────────────── */
    const revealSections = sections.querySelectorAll(
      '#recent-auctions, #our-auctions, #about, #features'
    );

    revealSections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    /* ──────────────────────────────────────────────
       4. Stats counter animation (About section)
       ────────────────────────────────────────────── */
    const statItems = sections.querySelectorAll('#about .stat-item h3');

    statItems.forEach((el) => {
      const rawText = el.textContent.trim();
      // Parse number: "1000+" -> 1000, "50K+" -> 50000, "1500+" -> 1500
      let targetNum = 0;
      let suffix = '';

      if (rawText.includes('K')) {
        targetNum = parseFloat(rawText.replace(/[^0-9.]/g, '')) * 1000;
        suffix = 'K+';
      } else {
        targetNum = parseInt(rawText.replace(/[^0-9]/g, ''), 10);
        suffix = rawText.includes('+') ? '+' : '';
      }

      const counter = { val: 0 };

      gsap.to(counter, {
        val: targetNum,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          const v = Math.round(counter.val);
          if (rawText.includes('K')) {
            el.textContent = `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K+`;
          } else {
            el.textContent = `${v.toLocaleString()}${suffix}`;
          }
        },
      });
    });

    /* ──────────────────────────────────────────────
       Cleanup
       ────────────────────────────────────────────── */
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="landing-page-wrapper">
      <NavBar />
      <main ref={sectionsRef}>
        <HeroSection ref={heroRef} />
        <RecentAuctions />
        <OurAuctions />
        <AboutSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
