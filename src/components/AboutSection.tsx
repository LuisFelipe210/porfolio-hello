import { Camera, Heart, Users } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-foreground">
              Sobre Mim
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Sou uma fotógrafa apaixonada por capturar a essência de cada momento. 
              Com anos de experiência, especializo-me em retratos, casamentos, ensaios 
              familiares e maternidade, sempre buscando contar histórias únicas através 
              de imagens atemporais.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Minha abordagem combina técnica refinada com sensibilidade artística, 
              criando fotografias que não apenas documentam, mas emocionam e inspiram.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">Casamentos</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">300+</div>
                <div className="text-sm text-muted-foreground">Famílias</div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-in-right">
            <div className="space-y-4">
              <div className="elegant-border overflow-hidden photo-hover">
                <img 
                  src="/api/placeholder/300/400" 
                  alt="Fotografia de retrato" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="elegant-border overflow-hidden photo-hover">
                <img 
                  src="/api/placeholder/300/250" 
                  alt="Fotografia de família" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="elegant-border overflow-hidden photo-hover">
                <img 
                  src="/api/placeholder/300/350" 
                  alt="Fotografia de casamento" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="elegant-border overflow-hidden photo-hover">
                <img 
                  src="/api/placeholder/300/280" 
                  alt="Fotografia de maternidade" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;