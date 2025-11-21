import { Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type ContactFormProps = {
    formData: { name: string; email: string; phone: string; service: string; message: string; };
    isSubmitting: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleServiceChange: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
};

type FormFieldProps = {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    disabled?: boolean;
    textarea?: boolean;
    rows?: number;
    className?: string;
};

function FormField({
    id,
    name,
    label,
    placeholder,
    type = "text",
    value,
    onChange,
    required = false,
    disabled = false,
    textarea = false,
    rows,
    className
}: FormFieldProps) {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={id} className="text-right">
                {label}
            </Label>
            {textarea ? (
                <Textarea
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                    className={className || "col-span-3"}
                />
            ) : (
                <Input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={className || "col-span-3"}
                />
            )}
        </div>
    );
}

const serviceOptions = [
    { value: "retrato", label: "Ensaio/Retrato" },
    { value: "casamento", label: "Casamento" },
    { value: "evento", label: "Evento" },
    { value: "maternidade", label: "Maternidade" },
    { value: "outro", label: "Outro" }
];

export function ContactForm({
                                formData,
                                isSubmitting,
                                handleChange,
                                handleServiceChange,
                                handleSubmit
                            }: ContactFormProps) {

    function renderButtonContent() {
        if (isSubmitting) {
            return (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                </>
            );
        }
        return (
            <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
            </>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <FormField
                id="name"
                name="name"
                label="Nome"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
            />

            <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
            />

            <FormField
                id="phone"
                name="phone"
                label="Telefone"
                type="tel"
                placeholder="(Opcional)"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
            />

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
                        {serviceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <FormField
                id="message"
                name="message"
                label="Sua Mensagem"
                placeholder="Conte-me sobre sua ideia e expectativas..."
                value={formData.message}
                onChange={handleChange}
                required
                textarea
                rows={4}
                disabled={isSubmitting}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {renderButtonContent()}
            </Button>
        </form>
    );
}