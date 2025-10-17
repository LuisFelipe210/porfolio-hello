import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { useToast } from "../hooks/use-toast.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "./ui/dialog.tsx";


const FloatingContact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: ""
    });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar e-mail.');
            }

            toast({
                title: "Mensagem enviada!",
                description: "Obrigada pelo seu interesse. Retornarei o contato em breve.",
            });

            setFormData({
                name: "",
                email: "",
                phone: "",
                service: "",
                message: ""
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Erro!",
                description: "Não foi possível enviar sua mensagem. Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            <a
                href="https://wa.me/5574991248392?text=Olá,%20gostaria%20de%20solicitar%20um%20orçamento%20para%20seus%20serviços%20de%20fotografia."
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
                aria-label="WhatsApp"
            >
                <FaWhatsapp size={28} />
            </a>
            <Dialog>
                <DialogTrigger asChild>
                    <button
                        className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-transform hover:scale-110"
                        aria-label="Email"
                    >
                        <Mail size={28} />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Vamos Conversar</DialogTitle>
                        <DialogDescription>
                            Entre em contato para discutirmos como posso capturar
                            os seus momentos especiais de forma única e inesquecível.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input name="name" placeholder="Seu nome" value={formData.name} onChange={handleChange} required disabled={isSubmitting} />
                            <Input type="email" name="email" placeholder="Seu email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="tel" name="phone" placeholder="Telefone (opcional)" value={formData.phone} onChange={handleChange} disabled={isSubmitting} />
                            <select name="service" value={formData.service} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black" disabled={isSubmitting}>
                                <option value="">Tipo de sessão</option>
                                <option value="retrato">Ensaio/Retrato</option>
                                <option value="casamento">Casamento</option>
                                <option value="evento">Evento</option>
                                <option value="gastronomia">Fotografia Gastronômica</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <Textarea name="message" placeholder="Conte-me sobre sua ideia e expectativas para a sessão..." value={formData.message} onChange={handleChange} required rows={4} disabled={isSubmitting} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FloatingContact;