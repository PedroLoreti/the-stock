# The Stock — Web

Aplicação web do The Stock: dashboard, produtos, ponto de venda e gestão de usuários, sobre a [API em NestJS](../backend).

## ✨ Technologies

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (primitivos do Base UI) + **lucide-react**
- **TanStack Query** para o estado do servidor e **axios** para HTTP
- **React Hook Form** + **Zod** para formulários e validação
- **next-themes** (claro/escuro) e **sonner** (notificações)
- **Docker** (saída standalone do Next.js)

## 🚀 Features

- **Autenticação:** login por username ou email, troca de senha obrigatória no primeiro acesso e renovação silenciosa da sessão. O token de acesso fica só em memória, e o refresh token é um cookie httpOnly.
- **Interface por papel:** a navegação e as ações se adaptam ao papel do usuário (Admin, Management, Seller).
- **Dashboard:** faturamento de hoje e dos últimos 7 dias, ticket médio, valor em estoque, alertas de estoque baixo, últimas vendas e produtos mais vendidos.
- **Produtos:** busca, paginação, cadastro/edição, exclusão lógica e restauração, entradas de estoque, histórico de movimentações e badges de estoque baixo/esgotado.
- **Ponto de venda:** busca de produtos no servidor, carrinho que respeita o estoque disponível e histórico de vendas. Vendas podem ser canceladas dentro da janela de 5 horas, e o prazo aparece na tela.
- **Usuários (só admin):** criar, mudar papel, desativar/restaurar e redefinir senha.
- **Experiência de uso:** temas claro e escuro, skeletons de carregamento, estados de erro, notificações e proteção contra envio duplicado.

## 📍 The Process

Construí o frontend em etapas pequenas e separadas:

1. A estrutura inicial e o cliente da API.
2. A autenticação e o layout da aplicação.
3. Produtos, ponto de venda e gestão de usuários.
4. O dashboard e o design visual.

Cada funcionalidade fica na própria pasta (`src/features/<nome>`), com as chamadas à API, as queries, os schemas Zod e os componentes. As peças compartilhadas (campos de formulário, paginação, layout) ficam em `src/components`.

A parte mais delicada foi a sessão. A API grava o cookie de refresh com `SameSite=Strict` e `Path=/auth`, então o navegador chama a API direto, com credenciais, em vez de passar por um proxy do Next.js. O token de acesso fica só em memória. Quando uma requisição volta com 401, um interceptor do axios renova a sessão uma vez (vários 401 ao mesmo tempo compartilham a mesma renovação) e repete a requisição. Ao recarregar a página, a sessão é restaurada pelo cookie.

Todos os dados do servidor passam pelo TanStack Query. As listas mantêm a página anterior enquanto a próxima carrega, a busca tem debounce e cada mutação invalida as queries que afeta. Assim o dashboard, o estoque e o histórico de vendas ficam consistentes depois de uma venda ou de uma entrada de estoque.

Com tudo funcionando, apliquei o design visual: fonte DM Sans, o verde da marca `#45ba50`, temas claro e escuro e uma tela de login dividida. Por último, empacotei o app como um servidor standalone do Next.js no Docker.

## 🚦 Running the Project

### Localmente

Requisitos: **Node.js 24** e a [API](../backend) rodando em <http://localhost:3000> com `CORS_ORIGIN=http://localhost:3001`.

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev                   # http://localhost:3001
```

Abra <http://localhost:3001> e entre com `admin` / `admin123`. O sistema vai pedir uma nova senha.

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento na porta 3001 |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | ESLint |
