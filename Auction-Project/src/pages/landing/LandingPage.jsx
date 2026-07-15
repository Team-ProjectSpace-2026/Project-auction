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

const LandingPage = () => {
  const heroRef = useRef(null);
  const sectionsRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const sections = sectionsRef.current;

    if (!hero || !sections) return;

    const particles = hero.querySelector('.hero-particles');
    const bgImage = hero.querySelector('.hero-bg-image-wrapper');
    const canvas = hero.querySelector('canvas');

    const parallaxTargets = [particles, bgImage, canvas].filter(Boolean);

    parallaxTargets.forEach((target) => {
      gsap.to(target, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    const revealSections = sections.querySelectorAll(
      '#hero, #recent-auctions, #our-auctions, #about, #features'
    );

    revealSections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleClass: { targets: section, className: 'reveal-visible' },
            once: true,
          },
        }
      );
    });

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