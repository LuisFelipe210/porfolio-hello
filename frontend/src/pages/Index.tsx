import Header from "frontend/src/components/Header";
import HeroSection from "frontend/src/components/HeroSection";
import AboutSection from "frontend/src/components/AboutSection";
import PortfolioSection from "frontend/src/components/PortfolioSection";
import ServicesSection from "frontend/src/components/ServicesSection";
import ContactSection from "frontend/src/components/ContactSection";
import Footer from "frontend/src/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
