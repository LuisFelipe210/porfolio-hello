import { Camera, Heart, Baby, Users, Clock, MapPin } from "lucide-react";

const services = [
  {
    icon: Camera,
    title: "Ensaios Individuais",
    description: "Retratos profissionais que capturam sua personalidade única",
    features: ["Direção de pose", "Edição profissional", "Galeria online"],
    price: "A partir de R$ 350"
  },
  {
    icon: Heart,
    title: "Casamentos",
    description: "Cobertura completa do seu grande dia com estilo documental",
    features: ["Pre-wedding", "Cerimônia e festa", "Álbum personalizado"],
    price: "A partir de R$ 2.500"
  },
  {
    icon: Baby,
    title: "Maternidade",
    description: "Registrando a beleza e expectativa deste momento especial",
    features: ["Studio ou externo", "Figurino incluído", "Sessão relaxada"],
    price: "A partir de R$ 450"
  },
  {
    icon: Users,
    title: "Família",
    description: "Momentos autênticos e conexões familiares genuínas",
    features: ["Todas as idades", "Ambiente natural", "Múltiplas combinações"],
    price: "A partir de R$ 400"
  }
];

const ServicesSection = () => {
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
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="elegant-border p-8 hover:shadow-[var(--elegant-shadow)] transition-all duration-300 animate-fade-in"
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
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="text-lg font-light text-accent">
                {service.price}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border/30">
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-accent mr-3" />
              <h4 className="text-lg font-light">Processo</h4>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Consulta inicial para entender suas necessidades</li>
              <li>• Planejamento da sessão e locações</li>
              <li>• Sessão fotográfica relaxada e dirigida</li>
              <li>• Edição cuidadosa de todas as imagens</li>
              <li>• Entrega via galeria online em até 15 dias</li>
            </ul>
          </div>
          
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-accent mr-3" />
              <h4 className="text-lg font-light">Atendimento</h4>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Região metropolitana de São Paulo</li>
              <li>• Studio próprio disponível</li>
              <li>• Sessões externas em locais especiais</li>
              <li>• Deslocamento para outras cidades (consultar valores)</li>
              <li>• Disponibilidade para finais de semana</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;