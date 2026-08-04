import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NavBar from '../../components/landing/NavBar';
import HeroSection from '../../components/landing/HeroSection';
import RecentAuctions from '../../components/landing/RecentAuctions';
import OurAuctions from '../../components/landing/OurAuctions';
import AboutSection from '../../components/landing/AboutSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import PricingSection from '../../components/landing/PricingSection';
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
      '#our-auctions, #about, #features'
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
       5. Gavel Slam Section Divider (About → Features)
       ────────────────────────────────────────────── */
    const gavelDivider = sections.querySelector('.gavel-slam-divider');
    if (gavelDivider) {
      const gavel = gavelDivider.querySelector('.gavel-icon-slam');
      const shockwave = gavelDivider.querySelector('.shockwave-ring');
      const dividerLine = gavelDivider.querySelector('.divider-line');

      if (gavel && shockwave && dividerLine) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gavelDivider,
            start: 'top 80%',
            once: true,
          },
        });

        tl.fromTo(gavel,
          { y: -60, opacity: 0, rotation: -30 },
          { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: 'power3.in' }
        )
        .to(gavel, { scale: 1.15, duration: 0.08, ease: 'power2.in' })
        .to(gavel, { scale: 1, duration: 0.15, ease: 'elastic.out(1, 0.3)' })
        .fromTo(shockwave,
          { scale: 0, opacity: 0.8 },
          { scale: 3, opacity: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(dividerLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.6'
        );
      }
    }

    /* ──────────────────────────────────────────────
       6. Floating Parallax Bid Tags (About section)
       ────────────────────────────────────────────── */
    const bidTags = sections.querySelectorAll('.floating-bid-tag');
    bidTags.forEach((tag, i) => {
      const speeds = [-30, 20, -15, 25];
      gsap.to(tag, {
        y: speeds[i % speeds.length],
        ease: 'none',
        scrollTrigger: {
          trigger: tag.closest('section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5 + (i * 0.3),
        },
      });
    });

    /* ──────────────────────────────────────────────
       7. Feature cards enhanced stagger with rotation
       ────────────────────────────────────────────── */
    const featureCards = sections.querySelectorAll('#features .feature-card');
    if (featureCards.length > 0) {
      gsap.fromTo(featureCards,
        { opacity: 0, y: 50, rotateY: -5 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#features .features-grid',
            start: 'top 85%',
            once: true,
          },
        }
      );
    }

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

        {/* ── Gavel Slam Divider ── */}
        <div className="gavel-slam-divider" aria-hidden="true">
          <div className="divider-line" />
          <div className="gavel-slam-center">
            <span className="gavel-icon-slam">🔨</span>
            <div className="shockwave-ring" />
          </div>
          <div className="divider-line" />
        </div>

        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
