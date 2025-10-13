import { useState } from "react";
import { Mail, Phone, Instagram, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Mensagem enviada!",
      description: "Obrigada pelo seu interesse. Retornarei o contato em breve.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="section-padding bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 animate-fade-in">
            Vamos Conversar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Entre em contato para discutirmos como posso capturar 
            os seus momentos especiais de forma única e inesquecível.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-light mb-8">Entre em Contato</h3>
            
            <div className="space-y-6 mb-8">
              <a 
                href="https://wa.me/5574991248392"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-light">WhatsApp</div>
                  <div className="text-muted-foreground">(74) 99124-8392</div>
                </div>
              </a>
              
              <a 
                href="mailto:contato@helloborges.com.br"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-light">Email</div>
                  <div className="text-muted-foreground">contato@helloborges.com.br</div>
                </div>
              </a>
              
              <a 
                href="https://www.instagram.com/hello.borges.fotografia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                  <Instagram className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-light">Instagram</div>
                  <div className="text-muted-foreground">@hello.borges.fotografia</div>
                </div>
              </a>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-light">Localização</div>
                  <div className="text-muted-foreground">Piatã, Salvador - Bahia</div>
                </div>
              </div>
            </div>

            <div className="elegant-border p-6 bg-background/50">
              <h4 className="font-light mb-3">Horário de Atendimento</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Segunda a Sexta</span>
                  <span>9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados</span>
                  <span>9h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingos</span>
                  <span>Mediante agendamento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-in-right">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="font-light"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Seu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="font-light"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Telefone (opcional)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="font-light"
                  />
                </div>
                <div>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background font-light focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Tipo de sessão</option>
                    <option value="portrait">Ensaio/Retrato</option>
                    <option value="wedding">Casamento</option>
                    <option value="event">Evento</option>
                    <option value="gastronomy">Fotografia Gastronômica</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Textarea
                  name="message"
                  placeholder="Conte-me sobre sua ideia e expectativas para a sessão..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="font-light resize-none"
                />
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-primary font-light tracking-wide"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;