# The Stock — API

API REST de um sistema de controle de estoque (estoque único) e ponto de venda: produtos, movimentações de estoque, vendas e usuários com papéis.

## ✨ Technologies

- **NestJS 12** + **TypeScript**
- **Prisma 7** (gerador `prisma-client` + `@prisma/adapter-pg`) com **PostgreSQL**
- **JWT** (`@nestjs/jwt`) com refresh token opaco e rotativo em cookie httpOnly
- **bcrypt**, **helmet**, **@nestjs/throttler**, **class-validator** / **class-transformer**
- **Vitest** + **Supertest** para testes unitários e end-to-end
- **oxlint** + **Prettier**
- **Docker** (imagem multi-stage, migrações aplicadas ao iniciar)

## 🚀 Features

**Produtos e estoque**
- Cadastro, edição, busca e paginação de produtos (nome, marca, descrição, SKU, preço, estoque mínimo).
- Exclusão lógica (soft delete), com restauração restrita ao admin.
- Entradas de estoque e histórico completo de movimentações por produto (`ENTRY`, `SALE`, `SALE_CANCELLATION`).
- Indicador de estoque baixo (`quantity <= minStock`) devolvido pela API.
- Sem venda acima do estoque: lock otimista (`version`) mais um `CHECK (quantity >= 0)` no banco.

**Vendas**
- Vendas em carrinho, com vários itens. O preço unitário é copiado para cada item, então mudanças de preço posteriores não alteram o histórico.
- Cancelamento em até 5 horas após a venda, devolvendo os itens ao estoque.

**Autenticação e usuários**
- Login por username ou email. Token de acesso de vida curta (15 min), enviado no header Bearer.
- Refresh token em cookie httpOnly `SameSite=Strict`, rotacionado a cada uso. O reuso de um token já rotacionado é tratado como roubo e derruba todas as sessões do usuário.
- Admin inicial criado no primeiro boot. O primeiro login obriga a troca de senha.
- Três papéis:

| Ação | ADMIN | MANAGEMENT | SELLER |
|---|:-:|:-:|:-:|
| Consultar produtos e vender | ✅ | ✅ | ✅ |
| Cadastrar/editar produtos e registrar entradas de estoque | ✅ | ✅ | |
| Cancelar vendas | ✅ | ✅ | |
| Restaurar produtos excluídos | ✅ | | |
| Gerenciar usuários (criar, papéis, desativar, redefinir senha) | ✅ | | |

**Dashboard**
- Um endpoint agregado (`GET /dashboard`) com o faturamento de hoje e dos últimos 7 dias, ticket médio, valor em estoque (oculto para vendedores), alertas de estoque baixo, últimas vendas e produtos mais vendidos.

**Segurança**
- Validação global que rejeita campos desconhecidos, headers de segurança (helmet), CORS restrito à origem do frontend e rate limiting, com limite mais rígido no login.

## 📍 The Process

O projeto começou como um CRUD simples de estoque. Logo troquei a entidade genérica "estoque" por um modelo de verdade: **Product**, **StockMovement**, **Sale** e **SaleItem**, todos sobre um único estoque.

A partir daí dividi cada módulo (`product`, `sale`, `user`, `auth`, `dashboard`) nas camadas **domain / application / infrastructure / presentation**:

- **Domain:** as entidades guardam as regras de negócio, como a janela de cancelamento e o estoque baixo.
- **Application:** os casos de uso dependem só de repositórios abstratos e de um contrato de `UnitOfWork`.
- **Infrastructure:** o Prisma implementa esses contratos, com mappers e transações.

Como os casos de uso dependem só de contratos, eles têm testes unitários com fakes em memória. Uma suíte end-to-end separada exercita a pilha HTTP real contra um banco de teste dedicado.

O primeiro problema de verdade foi a concorrência: duas vendas da última unidade não podem dar certo ao mesmo tempo. Resolvi com **lock otimista** no produto, apoiado por uma constraint no banco como última linha de defesa.

Depois veio a autenticação, feita "como manda o livro":

- Senhas com hash bcrypt.
- Um JWT de vida curta mais um refresh token opaco. Só o hash dele fica no banco, ele é rotacionado a cada uso e o reuso é detectado.
- Guards por papel e troca de senha obrigatória para o admin inicial.

Mais tarde as listagens ganharam **paginação e busca**. Com isso, somar listas no navegador deixou de funcionar para o dashboard, que virou **um único endpoint agregado** calculado em SQL.

Por fim, empacotei a API com **Docker**: uma imagem em dois estágios que aplica as migrações pendentes antes de subir o servidor.

## 🚦 Running the Project

### Com Docker (stack completa)

Na raiz do repositório:

```bash
docker compose up -d --build
```

Isso sobe o PostgreSQL, a API em <http://localhost:3000> e o app web em <http://localhost:3001>. Também aplica as migrações e, com o banco vazio, cria dados de exemplo (3 produtos, 2 entradas de estoque e 3 vendas).

Entre com `admin` / `admin123`. O sistema vai pedir uma nova senha.

Para mudar portas ou segredos, copie o `.env.example` para `.env` na raiz do repositório. Todas as variáveis têm valor padrão.

### Localmente

Requisitos: **Node.js 24** e **PostgreSQL 15+**.

```bash
cd backend
npm install
cp .env.example .env          # defina DATABASE_URL e JWT_SECRET
npx prisma migrate deploy     # cria as tabelas
npm run db:seed               # opcional: dados de exemplo (só com o banco vazio)
npm run start:dev             # http://localhost:3000
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | **Obrigatória.** Segredo usado para assinar os tokens de acesso |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Duração dos tokens (padrão `15m` / `7d`) |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin inicial, criado quando não existe nenhum usuário |
| `CORS_ORIGIN` | Origem(ns) do frontend, separadas por vírgula |
| `THROTTLE_LIMIT` / `LOGIN_THROTTLE_LIMIT` | Requisições por minuto por IP (geral / login) |

### Testes

```bash
npm test             # testes unitários
npm run test:e2e     # end-to-end: precisa do .env.test (veja o .env.test.example) apontando para um banco separado
```

A suíte end-to-end apaga o banco a cada teste. Nunca aponte o `.env.test` para o banco de desenvolvimento.
