import { useState, useEffect } from "react";
import { Camera, Heart, Users } from "lucide-react";

const imagesColumn1 = [
  {
    src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400",
    alt: "Fotografia de retrato",
  },
  {
    src: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=entropy&cs=tinysrgb&fit=max&h=250&w=300",
    alt: "Fotografia de família",
  },
  {
    src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400",
    alt: "Fotografia de retrato",
  },
  {
    src: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=entropy&cs=tinysrgb&fit=max&h=250&w=300",
    alt: "Fotografia de família",
  },
];

const imagesColumn2 = [
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&h=350&w=300",
    alt: "Fotografia de casamento",
  },
  {
    src: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&h=280&w=300",
    alt: "Fotografia de maternidade",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&h=350&w=300",
    alt: "Fotografia de casamento",
  },
  {
    src: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?crop=entropy&cs=tinysrgb&fit=max&h=280&w=300",
    alt: "Fotografia de maternidade",
  },
];

const AboutSection = () => {
  const [animate, setAnimate] = useState(false);
  const [keyCol1, setKeyCol1] = useState(0);
  const [keyCol2, setKeyCol2] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
      setKeyCol1((prev) => prev + 1);
      setKeyCol2((prev) => prev + 1);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
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
                <div className="text-2xl font-medium text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-medium text-foreground">1+</div>
                <div className="text-sm text-muted-foreground">Casamentos</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-medium text-foreground">3+</div>
                <div className="text-sm text-muted-foreground">Famílias</div>
              </div>
            </div>
          </div>

          {/* Image Grid com rolagem infinita */}
          <div className="flex gap-4">
            {/* Coluna 1 */}
            <div className="w-1/2 md:w-full h-[300px] md:h-[600px] overflow-hidden">
              <div
                key={keyCol1}
                className={`flex flex-col space-y-4 ${
                  animate ? "animate-teleportScroll" : ""
                }`}
              >
                {[...imagesColumn1, ...imagesColumn1].map(({ src, alt }, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg transition-transform duration-500 md:hover:scale-105 md:hover:brightness-90 md:hover:shadow-lg"
                  >
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="w-1/2 md:w-full h-[300px] md:h-[600px] overflow-hidden">
              <div
                key={keyCol2}
                className={`flex flex-col space-y-4 ${
                  animate ? "animate-teleportScroll" : ""
                }`}
              >
                {[...imagesColumn2, ...imagesColumn2].map(({ src, alt }, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg transition-transform duration-500 md:hover:scale-105 md:hover:brightness-90 md:hover:shadow-lg"
                  >
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
