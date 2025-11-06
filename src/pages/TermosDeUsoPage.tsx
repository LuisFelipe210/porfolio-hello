import React from 'react';

// Um componente simples para adicionar algum espaçamento e largura máxima
const PageContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto max-w-4xl px-4 py-16 pt-24 md:pt-32">
        {children}
    </div>
);

// Estilos simples para os títulos e parágrafos para ficar legível
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


const TermosDeUsoPage: React.FC = () => {
    return (
        <PageContainer>
            {/* Cole o seu HTML dos Termos de Uso aqui dentro */}
            {/* Lembre-se de substituir o conteúdo de exemplo pelo seu texto final */}

            <H1>Termos e Condições de Uso – Hellô Borges Fotografia</H1>
            <P>Última atualização: 06/11/2025</P>
            <P>Bem-vindo ao HelloFotografia! Ao aceder e utilizar este site, você concorda em cumprir e aceitar os seguintes termos e condições. Por favor, leia-os com atenção.</P>

            <H3>1. Definições</H3>
            <UL>
                <li><strong>"Site"</strong>: Refere-se a este website, acessível em www.hellofotografia.com.br.</li>
                <li><strong>"Proprietário"</strong>: Refere-se a Hellouyse Borges Marques, proprietário deste site.</li>
                <li><strong>"Utilizador"</strong>: Qualquer pessoa que aceda ou navegue no site.</li>
                <li><strong>"Cliente"</strong>: Um utilizador que possui credenciais de acesso ao "Portal do Cliente".</li>
            </UL>

            <H3>2. Objeto do Site</H3>
            <P>Este site tem como objetivo apresentar o portfólio profissional de Hellô Borges, fornecer informações sobre serviços, publicar artigos de blog e disponibilizar uma área restrita ("Portal do Cliente") para a entrega e seleção de trabalhos fotográficos.</P>

            <H3>3. Propriedade Intelectual</H3>
            <P>Todo o conteúdo presente neste site, incluindo, mas não se limitando a, fotografias, textos, logotipos, design gráfico e código-fonte, é propriedade exclusiva do Proprietário e está protegido pelas leis de direitos autorais.</P>
            <P>É estritamente proibida qualquer reprodução, distribuição, modificação ou uso comercial do conteúdo sem a autorização prévia e por escrito do Proprietário.</P>

            <H3>4. Acesso ao Portal do Cliente</H3>
            <UL>
                <li>O acesso ao Portal do Cliente é restrito a Clientes que receberam credenciais (login e senha) do Proprietário.</li>
                <li>O Cliente é o único responsável por manter a confidencialidade das suas credenciais de acesso.</li>
                <li>Qualquer atividade realizada sob a conta do Cliente é de sua inteira responsabilidade.</li>
                <li>O Cliente concorda em notificar imediatamente o Proprietário sobre qualquer uso não autorizado da sua conta.</li>
            </UL>

            <H3>9. Contacto</H3>
            <P>Em caso de dúvidas sobre estes termos, entre em contacto através do hello@contato.com.</P>

        </PageContainer>
    );
};

export default TermosDeUsoPage;