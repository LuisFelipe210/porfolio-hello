# Hellô Borges - Plataforma de Fotografia Full-Stack

Uma plataforma robusta e elegante desenvolvida para gestão de um estúdio de fotografia. O sistema combina um portfólio público de alta performance com um painel administrativo completo (CMS) e uma área exclusiva para clientes realizarem a seleção de fotos.

---

## 🚀 Visão Geral da Stack

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema React, focado em performance, SEO e experiência do usuário.

### Frontend

- **Core:** React 18, TypeScript, Vite
- **UI & Estilização:** Tailwind CSS, shadcn/ui (Radix Primitives), Lucide Icons
- **Gerenciamento de Estado:** TanStack Query (React Query) v5 para estado assíncrono e cache
- **Formulários:** React Hook Form + Zod para validação robusta
- **Rotas:** React Router DOM v6 com suporte a Lazy Loading
- **Gráficos:** Recharts (Dashboard administrativo)
- **SEO:** React Helmet Async

### Backend (Serverless)

- **Runtime:** Node.js (Vercel Serverless Functions)
- **Banco de Dados:** MongoDB (Native Driver)
- **Autenticação:** JWT (JSON Web Tokens) com estratégias separadas para Admin e Clientes
- **Mídia/Uploads:** Integração direta com Cloudinary
- **Emails:** Suporte a Resend/Nodemailer para notificações e recuperação de senha

---

## ✨ Funcionalidades do Sistema

### 🏛️ Área Pública (Visitantes)

- **Design Responsivo:** Layout fluido adaptado para Mobile, Tablet e Desktop
- **Portfólio Masonry:** Galeria de imagens dinâmica com filtros por categoria (Casamentos, Ensaios, Eventos, etc.)
- **Blog (Journal):** Sistema completo de postagens para contar histórias dos eventos
- **Páginas Institucionais:** Sobre Mim, Investimento (Serviços), Contato e Políticas
- **Performance:** Carregamento otimizado de imagens e componentes

### 🔐 Portal do Cliente

- **Acesso Restrito:** Login seguro via email e senha
- **Seleção de Fotos:** Interface intuitiva para o cliente visualizar galerias privadas e selecionar suas fotos favoritas
- **Feedback Visual:** O cliente pode revisar a seleção antes de enviar a lista final para o fotógrafo
- **Segurança:** Recuperação de senha via token de email

### ⚙️ Painel Administrativo (CMS)

- **Dashboard Analítico:** Visão geral com métricas de mensagens, clientes ativos e status de seleções
- **Gestão de Portfólio:** Upload de imagens (Cloudinary), edição de legendas e reordenação
- **Gestão de Clientes:** Criação de contas, acompanhamento de progresso e visualização das seleções feitas
- **Calendário:** Ferramenta para gerenciar datas ocupadas/livres
- **CMS Completo:**
    - Editor de Blog (Journal)
    - Gestão de Depoimentos
    - Edição da página "Sobre Mim"
    - Configuração de Serviços e Preços
    - Ajustes globais do site (textos, contatos)
- **Caixa de Entrada:** Centralização de mensagens recebidas pelo formulário de contato

---

## 🛠️ Configuração e Instalação

### 1. Pré-requisitos

- Node.js (v18 ou superior)
- Conta no MongoDB Atlas
- Conta no Cloudinary

### 2. Instalação

Clone o repositório e instale as dependências:
```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd porfolio-hello
npm install
```

### 3. Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto. As variáveis necessárias baseadas no código atual são:
```bash
# --- API & Banco de Dados ---
VITE_API_URL=/api
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/helloborges_portfolio

# --- Autenticação Admin ---
ADMIN_USER=seu_usuario_admin
ADMIN_PASSWORD=sua_senha_admin
JWT_SECRET=chave_secreta_para_admin_jwt_muito_longa

# --- Autenticação Clientes ---
CLIENT_JWT_SECRET=chave_secreta_para_clientes_jwt_muito_longa

# --- Cloudinary (Upload de Imagens) ---
CLOUDINARY_CLOUD_NAME=dohdgkzdu
CLOUDINARY_UPLOAD_PRESET=borges_direct_upload
# Nota: A API Key/Secret pode ser necessária no backend dependendo da implementação de deleção
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# --- Serviço de Email (Recuperação de Senha/Notificações) ---
# Exemplo usando SMTP ou API (Resend/Sendgrid)
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_USER=seu_email@dominio.com
EMAIL_PASS=sua_senha_email
EMAIL_FROM_NAME="Hellô Borges Fotografia"
EMAIL_TO=email_da_hello@dominio.com
```

### 4. Rodando o Projeto

Para iniciar o ambiente de desenvolvimento (Frontend + Serverless Functions via Vercel ou Proxy):
```bash
npm run dev
```

O projeto estará rodando em `http://localhost:8080` (conforme configurado no `vite.config.ts`).

### 5. Build para Produção

Para gerar a versão otimizada para deploy:
```bash
npm run build
```

---

## 📂 Estrutura de Pastas Principal
```
/api            # Backend (Serverless Functions) - Cada arquivo é uma rota
  /admin        # Rotas protegidas do admin
  /portal       # Rotas protegidas do cliente
  auth.js       # Autenticação
  portfolio.js  # CRUD de portfólio

/src
  /assets       # Imagens estáticas, logos, SVGs
  /components   # Componentes React
    /ui         # Componentes base do shadcn/ui (Button, Card, Input...)
  /context      # Context API (MessagesContext)
  /hooks        # Custom Hooks (useDashboardData, use-toast)
  /lib          # Utilitários e helpers
  /pages        # Páginas da aplicação
    /Admin      # Telas do Painel Administrativo
    /Portal     # Telas da Área do Cliente
```

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👤 Autor

Desenvolvido com ❤️ para Hellô Borges Fotografia