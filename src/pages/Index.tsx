import Header from "../components/Header.tsx";
import HeroSection from "../components/HeroSection.tsx";
import AboutSection from "../components/AboutSection.tsx";
import PortfolioSection from "../components/PortfolioSection.tsx";
import ServicesSection from "../components/ServicesSection.tsx";
import TestimonialsSection from "../components/TestimonialsSection.tsx";
import Footer from "../components/Footer.tsx";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
          <HeroSection />
          <AboutSection />
          <PortfolioSection />
          <ServicesSection />
          <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
