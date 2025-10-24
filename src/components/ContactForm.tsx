import { Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// Definimos os tipos das props que o formulário vai receber
type ContactFormProps = {
    formData: { name: string; email: string; phone: string; service: string; message: string; };
    isSubmitting: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleServiceChange: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
};

export function ContactForm({
                                formData,
                                isSubmitting,
                                handleChange,
                                handleServiceChange,
                                handleSubmit
                            }: ContactFormProps) {
    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Campo Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    Nome
                </Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="col-span-3"
                />
            </div>

            {/* Campo Email */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="col-span-3"
                />
            </div>

            {/* Campo Telefone */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                    Telefone
                </Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(Opcional)"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="col-span-3"
                />
            </div>

            {/* Campo Tipo de Sessão (agora com componente temático) */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service" className="text-right">
                    Sessão
                </Label>
                <Select
                    name="service"
                    value={formData.service}
                    onValueChange={handleServiceChange}
                    required
                    disabled={isSubmitting}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione o tipo de sessão" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="retrato">Ensaio/Retrato</SelectItem>
                        <SelectItem value="casamento">Casamento</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="maternidade">Maternidade</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Campo Mensagem */}
            <div className="grid gap-2">
                <Label htmlFor="message">
                    Sua Mensagem
                </Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Conte-me sobre sua ideia e expectativas..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    disabled={isSubmitting}
                />
            </div>

            {/* Botão de Envio com indicador de carregamento */}
            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                    </>
                )}
            </Button>
        </form>
    );
}