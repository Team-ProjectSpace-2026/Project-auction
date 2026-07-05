import NavBar from '../../components/landing/NavBar';
import HeroSection from '../../components/landing/HeroSection';
import RecentAuctions from '../../components/landing/RecentAuctions';
import OurAuctions from '../../components/landing/OurAuctions';
import AboutSection from '../../components/landing/AboutSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import Footer from '../../components/landing/Footer';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      <NavBar />
      <main>
        <HeroSection />
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