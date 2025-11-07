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
                        <li><strong>Formulário de Contato:</strong> Nome, endereço de email e a mensagem que nos envia.</li>
                        <li><strong>Portal do Cliente:</strong> Endereço de email e senha para criação e acesso à sua conta de cliente.</li>
                    </ul>
                </li>
                <li><strong>Informações Automáticas:</strong>
                    <ul className="list-['-_'] list-inside ml-4">
                        <li>Podemos recolher dados básicos de navegação (como tipo de navegador, páginas visitadas) através de cookies ou ferramentas de análise para melhorar a experiência no site.</li>
                    </ul>
                </li>
            </UL>

            <H3>2. Como Usamos os Seus Dados?</H3>
            <P>Utilizamos os seus dados pessoais para as seguintes finalidades:</P>
            <UL>
                <li><strong>Para Responder a Si:</strong> Usamos os dados do formulário de contato para responder às suas questões e pedidos de orçamento (como gerido por `api/send-email.js` e `api/messages.js`).</li>
                <li><strong>Para Prestar Serviços:</strong> Usamos os dados da conta do Cliente para autenticar o seu acesso ao Portal do Cliente e permitir que veja e selecione as suas galerias de fotos (como gerido por `api/auth.js` e `api/portal/index.js`).</li>
                <li><strong>Para Melhorar o Site:</strong> Dados de navegação ajudam-nos a entender como os utilizadores interagem com o nosso portfólio e blog.</li>
            </UL>

            <H3>3. Partilha de Dados</H3>
            <P>Nós não vendemos nem alugamos os seus dados pessoais a terceiros.</P>
            <P>Podemos partilhar os seus dados com fornecedores de serviços essenciais que nos ajudam a operar o site, tais como:</P>
            <UL>
                <li><strong>Serviços de Email:</strong> Para o envio de emails de resposta ou recuperação de senha (Ex: O serviço usado em `api/send-email.js`).</li>
                <li><strong>Serviços de Hospedagem:</strong> Onde os dados do site e das galerias são armazenados.</li>
            </UL>
            <P>Exigimos que estes fornecedores protejam os seus dados e os utilizem apenas para os fins contratados.</P>

            <H3>4. Segurança dos Dados</H3>
            <P>Implementamos medidas de segurança técnicas e administrativas para proteger os seus dados pessoais, incluindo o uso de senhas (hash) para contas de clientes.</P>

            <H3>5. Os Seus Direitos (LGPD)</H3>
            <P>Dependendo da sua localização, você tem o direito de:</P>
            <UL>
                <li><strong>Aceder:</strong> Solicitar uma cópia dos dados pessoais que temos sobre si.</li>
                <li><strong>Corrigir:</strong> Pedir a correção de dados incompletos ou incorretos.</li>
                <li><strong>Excluir:</strong> Solicitar a remoção dos seus dados pessoais dos nossos sistemas.</li>
            </UL>
            <P>Para exercer estes direitos, por favor, entre em contato connosco.</P>

            <H3>6. Contato</H3>
            <P>Se tiver dúvidas sobre esta Política de Privacidade, entre em contato através do hello@contato.com.</P>

        </PageContainer>
    );
};

export default PoliticaDePrivacidadePage;