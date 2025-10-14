import { Camera, Heart, Baby, Users, Clock, MapPin, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const services = [
  {
    icon: Camera,
    title: "Ensaios e Retratos",
    description: "Retratos profissionais que capturam sua personalidade única",
    features: ["Direção de pose", "Edição profissional", "Galeria online"],
    price: "Consultar valores"
  },
  {
    icon: Heart,
    title: "Casamentos",
    description: "Cobertura completa do seu grande dia com estilo documental",
    features: ["Pre-wedding", "Cerimônia e festa", "Álbum personalizado"],
    price: "Consultar valores"
  },
  {
    icon: UtensilsCrossed,
    title: "Fotografia Gastronômica",
    description: "Imagens que despertam o apetite e valorizam seus pratos",
    features: ["Cardápios", "Redes sociais", "Material publicitário"],
    price: "Consultar valores"
  },
  {
    icon: Users,
    title: "Eventos",
    description: "Cobertura completa de eventos corporativos e sociais",
    features: ["Todas as idades", "Momentos espontâneos", "Entrega rápida"],
    price: "Consultar valores"
  }
];

const ServicesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLeftArrowDesktop, setShowLeftArrowDesktop] = useState(false);
  const [showRightArrowDesktop, setShowRightArrowDesktop] = useState(false);
  const [showLeftArrowMobile, setShowLeftArrowMobile] = useState(false);
  const [showRightArrowMobile, setShowRightArrowMobile] = useState(false);
  const desktopCarouselRef = useRef<HTMLDivElement | null>(null);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  // Handler for scroll event to update activeIndex (mobile)
  const onScrollMobile = () => {
    if (!mobileCarouselRef.current) return;
    const el = mobileCarouselRef.current;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstElementChild?.clientWidth || 1;
    const gap = 24; // 24 is the margin-right (mr-6)
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(index);
    // Update mobile arrows
    setShowLeftArrowMobile(scrollLeft > 5);
    setShowRightArrowMobile(scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  // Handler for scroll event to update arrows (desktop)
  const onScrollDesktop = () => {
    if (!desktopCarouselRef.current) return;
    const el = desktopCarouselRef.current;
    setShowLeftArrowDesktop(el.scrollLeft > 5);
    setShowRightArrowDesktop(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  // Scroll to card when clicking dots
  const scrollToIndex = (index: number) => {
    if (!mobileCarouselRef.current) return;
    const cardWidth = mobileCarouselRef.current.firstElementChild?.clientWidth || 1;
    const gap = 24;
    mobileCarouselRef.current.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth"
    });
  };

  useEffect(() => {
    // Mobile carousel scroll listeners and arrow state
    const refMobile = mobileCarouselRef.current;
    if (refMobile) {
      refMobile.addEventListener("scroll", onScrollMobile, { passive: true });
      // Initial check for arrows
      setTimeout(() => {
        onScrollMobile();
      }, 0);
    }
    return () => {
      if (refMobile) {
        refMobile.removeEventListener("scroll", onScrollMobile);
      }
    };
  }, []);

  useEffect(() => {
    // Desktop carousel scroll listeners and arrow state
    const refDesktop = desktopCarouselRef.current;
    if (refDesktop) {
      refDesktop.addEventListener("scroll", onScrollDesktop, { passive: true });
      // Initial check for arrows
      setTimeout(() => {
        onScrollDesktop();
      }, 0);
    }
    return () => {
      if (refDesktop) {
        refDesktop.removeEventListener("scroll", onScrollDesktop);
      }
    };
  }, []);

  const handlePriceClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const section = document.querySelector("#contact");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollLeftDesktop = () => {
    if (!desktopCarouselRef.current) return;
    const cardWidth = desktopCarouselRef.current.firstElementChild?.clientWidth || 320;
    const gap = 24; // gap-6 = 24px
    desktopCarouselRef.current.scrollBy({ left: -((cardWidth + gap) * 1.05), behavior: "smooth" });
  };

  const scrollRightDesktop = () => {
    if (!desktopCarouselRef.current) return;
    const cardWidth = desktopCarouselRef.current.firstElementChild?.clientWidth || 320;
    const gap = 24; // gap-6 = 24px
    desktopCarouselRef.current.scrollBy({ left: (cardWidth + gap) * 1.05, behavior: "smooth" });
  };

  const scrollLeftMobile = () => {
    if (!mobileCarouselRef.current) return;
    const cardWidth = mobileCarouselRef.current.firstElementChild?.clientWidth || 1;
    const gap = 24;
    mobileCarouselRef.current.scrollBy({ left: -((cardWidth + gap) + 16), behavior: "smooth" });
  };

  const scrollRightMobile = () => {
    if (!mobileCarouselRef.current) return;
    const cardWidth = mobileCarouselRef.current.firstElementChild?.clientWidth || 1;
    const gap = 24;
    mobileCarouselRef.current.scrollBy({ left: (cardWidth + gap) + 16, behavior: "smooth" });
  };

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 animate-fade-in">
            Serviços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Oferecendo diferentes tipos de sessões fotográficas,
            cada uma pensada para capturar o que há de mais especial em cada momento.
          </p>
        </div>

        {/* Services Grid */}
        <div className="relative">
          {showLeftArrowDesktop && (
            <button
              onClick={scrollLeftDesktop}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-orange-500 hover:text-orange-400 z-10 hidden md:block"
              aria-label="Scroll left"
              type="button"
            >
              <span aria-hidden="true">❮</span>
            </button>
          )}
          {showRightArrowDesktop && (
            <button
              onClick={scrollRightDesktop}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl text-orange-500 hover:text-orange-400 z-10 hidden md:block"
              aria-label="Scroll right"
              type="button"
            >
              <span aria-hidden="true">❯</span>
            </button>
          )}
          <div className="overflow-x-auto flex gap-6 no-scrollbar snap-x snap-mandatory px-4 mb-16" ref={desktopCarouselRef}>
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="flex-shrink-0 w-80 lg:w-96 elegant-border p-8 lg:p-10 min-h-[400px] hover:shadow-[var(--elegant-shadow)] hover:scale-105 transition-transform duration-300 flex flex-col justify-between animate-fade-in snap-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 md:w-10 md:h-10 bg-accent/10 rounded-full flex items-center justify-center mr-4`}>
                        <Icon className={`w-6 h-6 md:w-10 md:h-10 text-orange-500`} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-light">{service.title}</h3>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-loose">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <a
                      href="#contact"
                      className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/80 transition-colors inline-block"
                      onClick={handlePriceClick}
                    >
                      {service.price}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative md:hidden">
          {showLeftArrowMobile && (
            <button
              onClick={scrollLeftMobile}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-orange-500 hover:text-orange-400 z-10 flex md:hidden"
              aria-label="Scroll left"
              type="button"
            >
              <span aria-hidden="true">❮</span>
            </button>
          )}
          {showRightArrowMobile && (
            <button
              onClick={scrollRightMobile}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl text-orange-500 hover:text-orange-400 z-10 flex md:hidden"
              aria-label="Scroll right"
              type="button"
            >
              <span aria-hidden="true">❯</span>
            </button>
          )}
          <div
            ref={mobileCarouselRef}
            className="flex overflow-x-auto px-4 no-scrollbar mb-4 snap-x snap-mandatory relative"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="flex-shrink-0 w-64 elegant-border p-6 hover:shadow-[var(--elegant-shadow)] hover:scale-105 transition-transform duration-300 animate-fade-in mr-6 last:mr-0 snap-center flex flex-col justify-between"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                        <Icon className={`w-6 h-6 text-orange-500`} />
                      </div>
                      <h3 className="text-2xl font-light">{service.title}</h3>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <a
                      href="#contact"
                      className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/80 transition-colors inline-block"
                      onClick={handlePriceClick}
                    >
                      {service.price}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pontinhos abaixo do carrossel */}
          <div className="flex justify-center space-x-2 mt-3">
            {services.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? "bg-orange-500" : "bg-orange-300"
                }`}
                onClick={() => scrollToIndex(index)}
                aria-label={`Ir para o serviço ${services[index].title}`}
              >
                <span className="sr-only">{index === activeIndex ? "Selecionado" : "Não selecionado"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border/30 space-y-4 md:space-y-0 md:gap-12">
          <div className="elegant-border p-8 lg:p-10 min-h-[350px] hover:shadow-[var(--elegant-shadow)] transition-all duration-300 animate-fade-in py-4 md:py-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-accent mr-3" />
                <h4 className="font-semibold text-lg md:text-xl">Processo</h4>
              </div>
              <ul className="list-disc pl-5">
                <li className="mt-2 leading-relaxed">
                  Consulta inicial para entender suas necessidades
                </li>
                <li className="mt-2 leading-relaxed">
                  Planejamento da sessão e locações
                </li>
                <li className="mt-2 leading-relaxed">
                  Sessão fotográfica relaxada e dirigida
                </li>
                <li className="mt-2 leading-relaxed">
                  Edição cuidadosa de todas as imagens
                </li>
                <li className="mt-2 leading-relaxed">
                  Entrega via galeria online em até 15 dias
                </li>
              </ul>
            </div>
          </div>

          <div className="elegant-border p-8 lg:p-10 min-h-[350px] hover:shadow-[var(--elegant-shadow)] transition-all duration-300 animate-fade-in pt-4 md:pt-0 md:border-l md:border-border/30 md:pl-4 py-4 md:py-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="w-8 h-8 text-accent mr-3" />
                <h4 className="font-semibold text-lg md:text-xl">Atendimento</h4>
              </div>
              <ul className="list-disc pl-5">
                <li className="mt-2 leading-relaxed">
                  Base em Piatã, Salvador, Bahia
                </li>
                <li className="mt-2 leading-relaxed">
                  Atendimento em:
                  <ul className="pl-5">
                    <li className="leading-relaxed">Campo Formoso e região</li>
                    <li className="leading-relaxed">Petrolina/Juazeiro</li>
                    <li className="leading-relaxed">Salvador e Região</li>
                  </ul>
                </li>
                <li className="mt-2 leading-relaxed">
                  Sessões externas em locais especiais
                </li>
                <li className="mt-2 leading-relaxed">
                  Disponibilidade para finais de semana
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;