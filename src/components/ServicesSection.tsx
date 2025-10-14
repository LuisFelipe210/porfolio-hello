import { Camera, Heart, Baby, Users, Clock, MapPin, UtensilsCrossed } from "lucide-react";
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
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Handler for scroll event to update activeIndex
  const onScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.firstElementChild?.clientWidth || 1;
    const index = Math.round(scrollLeft / (cardWidth + 16)); // 16 is the margin-right (mr-4)
    setActiveIndex(index);
  };

  // Scroll to card when clicking dots
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.firstElementChild?.clientWidth || 1;
    carouselRef.current.scrollTo({
      left: index * (cardWidth + 16),
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const refCurrent = carouselRef.current;
    if (refCurrent) {
      refCurrent.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

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
        <div>
          <div className="hidden md:grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="elegant-border p-6 hover:shadow-[var(--elegant-shadow)] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                    <service.icon className="w-6 h-6 text-accent" />
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

                <div className="text-lg font-light text-accent">
                  <a
                    href="#contact"
                    className="underline hover:text-accent/80 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const section = document.querySelector("#contact");
                      section?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {service.price}
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="relative md:hidden">
            <div
              ref={carouselRef}
              className="flex overflow-x-auto px-4 no-scrollbar mb-4 snap-x snap-mandatory"
            >
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="flex-shrink-0 w-64 elegant-border p-6 hover:shadow-[var(--elegant-shadow)] transition-all duration-300 animate-fade-in mr-4 last:mr-0 snap-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                      <service.icon className="w-6 h-6 text-accent" />
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

                  <div className="text-lg font-light text-accent">
                    <a
                      href="#contact"
                      className="underline hover:text-accent/80 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const section = document.querySelector("#contact");
                        section?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {service.price}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {/* Pontinhos abaixo do carrossel */}
            <div className="flex justify-center space-x-2">
              {services.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? "bg-orange-500" : "bg-orange-300"
                  }`}
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Ir para o serviço ${services[index].title}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border/30 space-y-6 md:space-y-0">
          <div className="animate-fade-in py-4 md:py-0">
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

          <div className="animate-fade-in pt-4 md:pt-0 md:border-l md:border-border/30 md:pl-4 py-4 md:py-0">
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
    </section>
  );
};

export default ServicesSection;