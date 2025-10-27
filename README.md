# Hellô Borges - Portfólio de Fotografia

![Prévia do Projeto](https://imgur.com/G4IpUf5.png)

Este é um projeto full-stack completo para um portfólio de fotógrafa, desenvolvido com React, TypeScript, e Node.js. A plataforma oferece uma experiência de usuário elegante para visitantes e um painel de administração robusto para gerenciamento de conteúdo.

## ✨ Funcionalidades

### 🏛️ Área Pública

-   **Página Inicial Dinâmica:** Uma landing page com título e subtítulo personalizáveis através do painel de administração.
-   **Sobre Mim:** Seção com texto e imagens de apresentação, totalmente gerenciável.
-   **Portfólio com Filtros:** Galeria de imagens no estilo masonry, com categorias filtráveis (Retratos, Casamentos, etc.). As imagens podem ser visualizadas em um lightbox.
-   **Serviços Detalhados:** Apresentação dos serviços oferecidos, com descrições, listas de características e imagens.
-   **Depoimentos de Clientes:** Uma seção de depoimentos em carrossel para exibir o feedback de clientes.
-   **Blog:** Uma página de blog com artigos, incluindo uma página de detalhes para cada post.
-   **Contato Flutuante:** Botões de contato rápido para WhatsApp e e-mail.
-   **Tema Claro/Escuro:** Suporte para alternância entre temas.
-   **Design Responsivo:** Totalmente adaptado para dispositivos móveis, tablets e desktops.

### 🔐 Portal do Cliente

-   **Login Seguro:** Área de login para clientes acessarem suas galerias privadas.
-   **Redefinição de Senha:** Clientes podem solicitar a redefinição de senha por e-mail.
-   **Seleção de Fotos:** Os clientes podem visualizar suas galerias e selecionar suas fotos favoritas.
-   **Envio de Seleção:** Após a seleção, o cliente pode enviar a lista de fotos escolhidas para a fotógrafa.

### ⚙️ Painel de Administração

-   **Dashboard:** Uma visão geral com estatísticas, atalhos rápidos, e atividades recentes.
-   **Gerenciamento de Clientes:** Crie, edite e exclua clientes, e gerencie o acesso ao portal.
-   **Gerenciamento de Galerias:** Crie galerias, faça upload de fotos e associe-as a clientes.
-   **Mensagens:** Visualize mensagens de contato e notificações de seleção de fotos.
-   **Gerenciamento de Portfólio:** Adicione, edite e exclua itens do portfólio público.
-   **Gerenciamento de Serviços:** Atualize as informações dos serviços oferecidos.
-   **Gerenciamento "Sobre Mim":** Edite os textos e imagens da seção "Sobre".
-   **Gerenciamento de Depoimentos:** Adicione, edite e remova depoimentos de clientes.
-   **Gerenciamento de Disponibilidade:** Marque datas como ocupadas em um calendário interativo.
-   **Gerenciamento de Blog:** Crie, edite e exclua artigos para o blog.
-   **Configurações Gerais:** Personalize textos do site, informações de contato e horários.

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
-   **Backend:** Node.js (com APIs serverless Vercel)
-   **Banco de Dados:** MongoDB
-   **Hospedagem de Imagens:** Cloudinary
-   **Autenticação:** JWT (JSON Web Tokens)
-   **Envio de E-mail:** Nodemailer

## 🚀 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://[URL_DO_SEU_REPOSITÓRIO]
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

    ```env
    VITE_API_URL=http://localhost:3000/api
    ADMIN_USER=seu_usuario_admin
    ADMIN_PASSWORD=sua_senha_admin
    JWT_SECRET=sua_chave_secreta_jwt
    CLIENT_JWT_SECRET=sua_chave_secreta_cliente_jwt
    MONGODB_URI=sua_string_de_conexao_mongodb
    EMAIL_HOST=seu_host_de_email
    EMAIL_PORT=sua_porta_de_email
    EMAIL_USER=seu_usuario_de_email
    EMAIL_PASS=sua_senha_de_email
    EMAIL_FROM_NAME="Seu Nome"
    EMAIL_TO=seu_email_de_destino
    CLOUDINARY_CLOUD_NAME=seu_cloud_name
    CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
    ENCRYPTION_KEY=sua_chave_de_criptografia
    ENCRYPTION_IV=seu_iv_de_criptografia
    ```

4.  **Execute o projeto:**
    ```bash
    npm run dev
    ```

## 📸 Screenshots

### Página Inicial
![Página Inicial](https://imgur.com/qA09RMi.png)

### Portfólio
![Portfólio](https://imgur.com/HnSqn4c)

### Serviços
![Serviços](https://imgur.com/pIoAdoG.png)

### Testemunhos
![Testemunhos](https://imgur.com/444r7sZ.png)

### Blog
![Blog](https://imgur.com/z7r49sa.png)

### Painel de Administração
![Painel de Administração](https://imgur.com/HnSqn4c.png)

### Portal do Cliente
![Portal do Cliente](https://imgur.com/NYkkAsT.png)

---

Este README foi gerado para fornecer uma visão completa do projeto. Sinta-se à vontade para adaptá-lo conforme necessário.
