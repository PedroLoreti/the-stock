# The Stock

Sistema fullstack de controle de estoque e ponto de venda: cadastro de produtos, entradas de estoque, vendas com carrinho, cancelamento, dashboard e usuários com papéis (admin, gestão e vendedor).

O repositório tem duas aplicações, cada uma com o próprio README:

- [`backend/`](backend): API REST em NestJS + Prisma + PostgreSQL.
- [`frontend/`](frontend): aplicação web em Next.js.

## ✨ Technologies

**Backend**
- **NestJS 12** + **TypeScript**
- **Prisma 7** + **PostgreSQL**
- **JWT** com refresh token rotativo em cookie httpOnly, **bcrypt**, **helmet** e **@nestjs/throttler**
- **Vitest** + **Supertest** (testes unitários e end-to-end)

**Frontend**
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **TanStack Query** + **axios**
- **React Hook Form** + **Zod**

**Infraestrutura**
- **Docker** + **Docker Compose** (PostgreSQL, API e web)

## 🚀 Features

- **Produtos:** cadastro, edição, busca, paginação, marca, estoque mínimo e exclusão lógica com restauração.
- **Estoque:** entradas de estoque, histórico de movimentações por produto e alerta de estoque baixo/esgotado.
- **Ponto de venda:** vendas com vários itens, sem vender acima do estoque disponível, e cancelamento em até 5 horas, devolvendo os itens ao estoque.
- **Dashboard:** faturamento de hoje e dos últimos 7 dias, ticket médio, valor em estoque, alertas de estoque, últimas vendas e produtos mais vendidos.
- **Usuários e permissões:** três papéis (ADMIN, MANAGEMENT, SELLER). A interface e a API liberam as ações conforme o papel.
- **Autenticação segura:** token de acesso de vida curta, refresh token rotativo em cookie httpOnly com detecção de reuso e troca de senha obrigatória no primeiro acesso.
- **Interface:** temas claro e escuro, estados de carregamento e erro e notificações.

## 📍 The Process

Comecei pelo backend, com um CRUD simples de estoque. Ao modelar as regras de negócio, troquei a entidade genérica "estoque" por **produtos, movimentações e vendas**, e organizei cada módulo em camadas (domínio, aplicação, infraestrutura e apresentação). Assim as regras ficam isoladas do framework e do banco, e dá para testá-las com fakes em memória.

Com o modelo pronto, resolvi a concorrência nas vendas com **lock otimista**, para que duas vendas da última unidade não deem certo ao mesmo tempo. Também criei uma suíte **end-to-end** contra um banco de teste.

Em seguida veio a **autenticação**: JWT de vida curta, refresh token rotativo em cookie httpOnly, papéis e um admin inicial criado no primeiro boot.

O frontend foi construído em etapas, uma funcionalidade por vez: cliente da API e sessão, layout, produtos, ponto de venda, usuários e, por fim, o dashboard e o design visual.

Durante o caminho, a necessidade de **paginação** mudou o dashboard. Somar listas no navegador deixou de ser correto, e ele virou um endpoint agregado no backend.

Por último, empacotei tudo com **Docker Compose**: com um único comando sobem o banco, a API (que aplica as migrações ao iniciar), o frontend e os dados de exemplo.

Os detalhes de cada parte estão no [README do backend](backend/README.md) e no [README do frontend](frontend/README.md).

## 📚 What I Learned

- **Arquitetura em camadas na prática:** depender de contratos (repositórios, `UnitOfWork`) em vez do Prisma direto deixou os casos de uso simples de testar e fáceis de mudar.
- **Concorrência:** a validação na aplicação não basta quando duas requisições chegam juntas. Lock otimista mais uma constraint no banco garantem que o estoque nunca fique negativo.
- **Autenticação de verdade:** rotação de refresh token, detecção de reuso, cookies `httpOnly` / `SameSite` / `Path` e como essas escolhas afetam a arquitetura do frontend. Neste projeto, foi por causa delas que o navegador chama a API direto, sem proxy.
- **Estado do servidor no frontend:** com o TanStack Query, cache, paginação e invalidação depois de cada mutação mantêm as telas consistentes sem gerenciar estado na mão.
- **Onde calcular os dados:** com listas paginadas, métricas agregadas pertencem ao backend (SQL), não ao navegador.
- **Docker:** builds multi-stage, healthchecks entre serviços, variáveis que o Next.js embute no build e detalhes como o cookie `Secure` exigir HTTPS fora do localhost.

## 🚦 Running the Project

Requisito: **Docker** com **Docker Compose**.

```bash
git clone https://github.com/PedroLoreti/the-stock.git
cd the-stock
docker compose up -d --build
```

Isso sobe:

| Serviço | Endereço |
|---|---|
| Aplicação web | <http://localhost:3001> |
| API | <http://localhost:3000> |
| PostgreSQL | interno à rede do Compose |

Na primeira vez a API aplica as migrações, e o banco vazio recebe dados de exemplo (3 produtos, 2 entradas de estoque e 3 vendas).

Entre com `admin` / `admin123`. O sistema vai pedir uma nova senha no primeiro acesso.

Para mudar portas, senhas ou o segredo do JWT, copie o `.env.example` para `.env` na raiz. Todas as variáveis têm valor padrão.

Para parar:

```bash
docker compose down        # para os containers
docker compose down -v     # para e apaga o banco
```

Para rodar backend e frontend sem Docker, veja o [README do backend](backend/README.md) e o [README do frontend](frontend/README.md).

## 📈 Overall Growth:

Este projeto me tirou do CRUD e me levou a pensar como em um sistema real. Precisei decidir onde cada regra de negócio deve morar, proteger os dados contra concorrência e tratar autenticação como algo além de "gerar um token".

Também foi a primeira vez que levei um projeto de ponta a ponta: modelagem do banco, API testada, frontend com controle de acesso por papel e entrega em containers com um único comando. Saí mais seguro para tomar decisões de arquitetura e para justificar cada uma delas.

## 💭 How can it be improved?

- **Documentação da API** com Swagger/OpenAPI.
- **Testes no frontend** (componentes e fluxos end-to-end com Playwright).
- **CI** com GitHub Actions rodando lint, testes e build a cada push.
- **Gráficos no dashboard** (evolução das vendas ao longo do tempo).
- **Relatórios** exportáveis (CSV/PDF) de vendas e movimentações.
- **Deploy** com HTTPS, o que também permite ativar `NODE_ENV=production` com o cookie `Secure`.
- **Imagem Docker da API menor**, removendo do runtime o que só é usado no build.
- **Múltiplos estoques/filiais** e transferência entre eles.
