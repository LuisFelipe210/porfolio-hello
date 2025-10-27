import { useState } from "react";
import { useLocation } from "react-router-dom"; // Importar useLocation
import { Mail } from "lucide-react";
// 1. Corrigido o import para react-icons (tentando 'fa6' que é mais comum)
//    Se ainda der erro, verifique se 'react-icons' está instalado corretamente.
import { FaWhatsapp } from "react-icons/fa6";
import { useToast } from "../hooks/use-toast.ts"; // 2. Revertido para caminho relativo
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "./ui/dialog.tsx"; // 3. Revertido para caminho relativo
import { ContactForm } from "./ContactForm.tsx"; // 4. Revertido para caminho relativo

const FloatingContact = () => {
    // Obter a localização atual
    const location = useLocation();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: ""
    });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar e-mail.');
            }

            toast({
                title: "Mensagem enviada!",
                description: "Obrigada pelo seu interesse. Retornarei o contato em breve.",
            });

            setFormData({ name: "", email: "", phone: "", service: "", message: "" });
            setIsDialogOpen(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (value: string) => {
        setFormData({ ...formData, service: value });
    };

    // Definir as rotas onde o componente NÃO deve aparecer
    const excludedPrefixes = [
        '/admin', // Exclui /admin/login e /admin/*
        '/portal/login',
        '/portal/forgot-password',
        '/portal/reset-password', // Exclui /portal/reset-password e /portal/reset-password/:token
    ];

    // Verificar se a rota atual começa com algum dos prefixos excluídos
    const shouldHide = excludedPrefixes.some(prefix => location.pathname.startsWith(prefix));

    // Se estiver numa rota excluída, não renderizar nada
    if (shouldHide) {
        return null;
    }

    // Renderizar o componente normalmente
    return (
        <div className="fixed bottom-32 right-6 z-50 flex flex-col items-center gap-3">
            {/*<a*/}
            {/*    href="https://wa.me/5574991248392?text=Olá,%20gostaria%20de%20solicitar%20um%20orçamento."*/}
            {/*    target="_blank"*/}
            {/*    rel="noopener noreferrer"*/}
            {/*    className="w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center text-white dark:text-black shadow-lg hover:bg-green-600 transition-transform hover:scale-110"*/}
            {/*    aria-label="WhatsApp"*/}
            {/*>*/}
            {/*    <FaWhatsapp size={24} />*/}
            {/*/!*</a>*!/*/}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <button
                        className="w-12 h-12 md:w-14 md:h-14 bg-orange-500 rounded-full flex items-center justify-center text-white dark:text-black shadow-lg hover:bg-orange-600 transition-transform hover:scale-110"
                        aria-label="Email"
                    >
                        <Mail size={24} />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Vamos Conversar</DialogTitle>
                        <DialogDescription>
                            Preencha o formulário e vamos criar algo incrível juntos.
                        </DialogDescription>
                    </DialogHeader>
                    <ContactForm
                        formData={formData}
                        isSubmitting={isSubmitting}
                        handleChange={handleChange}
                        handleServiceChange={handleServiceChange}
                        handleSubmit={handleSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FloatingContact;

