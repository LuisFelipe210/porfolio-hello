import { useState } from "react";
import { Mail } from "lucide-react"; // Importado CalendarDays
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "../hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "./ui/dialog";
import { ContactForm } from "./ContactForm";

type FloatingButtonProps = {
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    bgColor: string;
    hoverBgColor: string;
    ariaLabel: string;
};

const FloatingButton = ({ icon, href, onClick, bgColor, hoverBgColor, ariaLabel }: FloatingButtonProps) => {
    const commonClasses = `w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white dark:text-black shadow-lg transition-transform hover:scale-110`;
    const buttonContent = (
        <button
            onClick={onClick}
            className={`${commonClasses} ${bgColor} hover:${hoverBgColor}`}
            aria-label={ariaLabel}
            type={onClick ? "button" : undefined}
        >
            {icon}
        </button>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${commonClasses} ${bgColor} hover:${hoverBgColor}`}
                aria-label={ariaLabel}
            >
                {icon}
            </a>
        );
    }

    return buttonContent;
};

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
                variant: "success",
                description: "Obrigada pelo seu interesse. Retornarei o contato em breve.",
            });

            setFormData({ name: "", email: "", phone: "", service: "", message: "" });
            setIsDialogOpen(false); // Fecha o diálogo após o envio

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

    // Função separada para o componente Select
    const handleServiceChange = (value: string) => {
        setFormData({ ...formData, service: value });
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">

            {/* Botão do WhatsApp */}
            <FloatingButton
                icon={<FaWhatsapp size={24} />}
                href="https://wa.me/5574991248392?text=Olá,%20gostaria%20de%20solicitar%20um%20orçamento."
                bgColor="bg-green-500"
                hoverBgColor="bg-green-600"
                ariaLabel="WhatsApp"
            />

            {/* Botão de Email que abre o diálogo */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <FloatingButton
                        icon={<Mail size={24} />}
                        onClick={() => setIsDialogOpen(true)}
                        bgColor="bg-orange-500"
                        hoverBgColor="bg-orange-600"
                        ariaLabel="Email"
                    />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Vamos Conversar</DialogTitle>
                        <DialogDescription>
                            Preencha o formulário e vamos criar algo incrível juntos.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Renderiza o componente de formulário separado */}
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