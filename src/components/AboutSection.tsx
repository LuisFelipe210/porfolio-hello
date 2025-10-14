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
              Olá! Sou Hellô Borges, fotógrafa do Nordeste brasileiro, com base em Piatã, 
              Salvador, Bahia. Especializo-me em eventos, retratos e fotografia gastronômica, 
              transformando cada momento em "sentimento em forma de foto".
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Além da fotografia, sou enfermeira formada pela UPE e aprimoranda em UTI, 
              o que me dá uma sensibilidade especial para capturar emoções genuínas e 
              cuidar de cada detalhe dos seus momentos mais importantes.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">1+</div>
                <div className="text-sm text-muted-foreground">Casamentos</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-light text-foreground">3+</div>
                <div className="text-sm text-muted-foreground">Famílias</div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-in-right">
            <div className="space-y-4">
              <div className="elegant-border overflow-hidden photo-hover">
                <img 
                  src="https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400"
                  alt="Fotografia de retrato"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="elegant-border overflow-hidden photo-hover">
                <img
                  src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=entropy&cs=tinysrgb&fit=max&h=250&w=300"
                  alt="Fotografia de família"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="elegant-border overflow-hidden photo-hover">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&h=350&w=300"
                  alt="Fotografia de casamento"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="elegant-border overflow-hidden photo-hover">
                <img
                  src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&h=280&w=300"
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