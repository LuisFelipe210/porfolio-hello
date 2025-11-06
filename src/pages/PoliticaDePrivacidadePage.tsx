import React from 'react';

// Reutilize os componentes de estilo do outro ficheiro
const PageContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto max-w-4xl px-4 py-16 pt-24 md:pt-32">
        {children}
    </div>
);
const H1 = ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mb-3 mt-6">{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 leading-relaxed">{children}</p>
);
const UL = ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-4 pl-4">{children}</ul>
);


const PoliticaDePrivacidadePage: React.FC = () => {
    return (
        <PageContainer>
            {/* Cole o seu HTML da Política de Privacidade aqui dentro */}
            {/* Lembre-se de substituir o conteúdo de exemplo pelo seu texto final */}

            <H1>Política de Privacidade – Hellô Borges Fotografia</H1>
            <P>Última atualização: 06/11/2025</P>
            <P>A sua privacidade é importante para nós. Esta Política de Privacidade explica como Hellô Borges Fotografia ("nós", "nosso") recolhe, utiliza, armazena e protege os seus dados pessoais quando você utiliza o nosso site www.hellofotografia.com.br.</P>

            <H3>1. Que Dados Recolhemos?</H3>
            <P>Recolhemos informações pessoais de duas formas principais:</P>
            <UL>
                <li><strong>Informações que Você Fornece:</strong>
                    <ul className="list-['-_'] list-inside ml-4">
                        <li><strong>Formulário de Contacto:</strong> Nome, endereço de email e a mensagem que nos envia.</li>
                        <li><strong>Portal do Cliente:</strong> Endereço de email e senha para criação e acesso à sua conta de cliente.</li>
                    </ul>
                </li>
                <li><strong>Informações Automáticas:</strong>
                    <ul className="list-['-_'] list-inside ml-4">
                        <li>Podemos recolher dados básicos de navegação (como tipo de navegador, páginas visitadas) através de cookies ou ferramentas de análise para melhorar a experiência no site.</li>
                    </ul>
                </li>
            </UL>

            <H3>6. Contato</H3>
            <P>Se tiver dúvidas sobre esta Política de Privacidade, entre em contacto através do hello@contato.com.</P>

        </PageContainer>
    );
};

export default PoliticaDePrivacidadePage;