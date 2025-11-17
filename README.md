# fest-rent — Documentação Unificada

## Visão Geral

`fest-rent` é uma plataforma completa de aluguel de equipamentos para eventos, desenvolvida com Next.js, Supabase e Stripe. Este documento unifica a documentação do projeto: API, deploy, testes, guias, checklist de qualidade e plano de demonstração.

## Sumário Executivo

- Projeto: fest-rent
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, Stripe
- Testes: Jest (≈48 testes), cobertura observada ~65%, alvo ≥ 60%
- Deploy: Vercel

## Números Rápidos

- 7 páginas principais (home, browse, dashboard, admin, etc.)
- 5 módulos de API (equipment, rentals, payments, stripe, admin)
- 48+ testes automatizados com Jest
- Cobertura aproximada: Statements 65%, Lines 66%, Branches 62%, Functions 68%
- 3 workflows CI/CD no GitHub Actions

## Arquitetura (resumo)

```
fest-rent
├── Frontend (Next.js 16 + React 19)
│   ├── Public Pages (Home, Browse, Equipment Details)
│   ├── Protected Pages (Dashboard, Admin)
│   ├── Auth Pages (Login, Sign-up)
│   └── Checkout Pages
│
├── Backend (Next.js API Routes)
│   ├── Equipment Management
│   ├── Rental System
│   ├── Stripe Integration
│   └── Payment Processing
│
├── Database (Supabase PostgreSQL)
│   ├── Users & Profiles
│   ├── Equipment
│   ├── Rentals
│   ├── Payments
│   └── RLS Policies
│
└── Infrastructure
    ├── Authentication (Supabase Auth)
    ├── Payments (Stripe Connect)
    └── Hosting (Vercel)
```

## Estrutura do Repositório (resumo)

- `app/` — páginas e API routes (inclui `api/equipment`, `api/rentals`, `api/stripe`, etc.)
- `components/` — componentes UI e provider de tema
- `__tests__/` — suíte de testes e utilitários de teste
- `scripts/` — migrations SQL (`001_create_schema.sql`, `002_create_profiles_trigger.sql`)
- `public/`, `styles/`, `lib/`, `hooks/` — utilitários e assets

## Funcionalidades Implementadas (resumo)

1. Autenticação

- Registro e login com Supabase
- Roles: `renter`, `vendor`, `admin`
- JWT tokens com expiração, middleware de proteção e RLS

2. Marketplace de Equipamentos

- Listagem com filtros, busca por nome/categoria, detalhes, imagens, preço por dia

3. Sistema de Locação

- Solicitação de locação, cálculo de dias e valor total, prevenção de sobreposição, transições de status (pending → approved → completed)

4. Pagamentos com Stripe

- Stripe Connect para vendors, sessões de checkout, webhooks, distribuição de fundos (85% vendor, 15% plataforma)

5. Dashboards e Admin

- Dashboard do vendor (ganhos, locações), admin panel (usuários, equipamentos, transações)

6. Segurança

- RLS, validação e sanitização de input, HTTPS em produção

## Modelos de Dados (Resumo)

User

```
id, email, name, role (renter|vendor|admin), avatar_url?, bio?, stripe_account_id?, created_at
```

Equipment

```
id, owner_id, name, description?, category, price_per_day, available, image_url?, created_at, updated_at
```

Rental

```
id, equipment_id, renter_id, owner_id, start_date, end_date, total_value, status (pending|approved|rejected|completed|cancelled), stripe_payment_id?, created_at, updated_at
```

## API — Endpoints Principais

Autenticação (Supabase):

- `POST /auth/login` — login
- `POST /auth/sign-up` — criação de usuário (role: `renter` | `vendor`)

Equipment:

- `GET /api/equipment` — listar equipamentos
- `POST /api/equipment` — criar equipamento (autenticado)

Rentals:

- `GET /api/rentals` — listar locações do usuário (autenticado)
- `POST /api/rentals` — criar locação (autenticado)
- `POST /api/rentals/{id}/approve` — aprovar locação
- `POST /api/rentals/{id}/reject` — rejeitar locação

Stripe / Pagamentos:

- `POST /api/stripe/connect-account` — criar conta Connect (autenticado)
- `POST /api/stripe/checkout` — criar sessão de checkout (autenticado)
- `POST /api/stripe/webhook` — webhook Stripe (recebe `checkout.session.completed`, `checkout.session.expired`)

Resposta de erros padrão:

```
401 Unauthorized
400 Bad Request
500 Internal Server Error
```

## Fluxos e Regras de Negócio Importantes

- Cálculo de duração: diferença entre `start_date` e `end_date` em dias.
- Cálculo de valor total: `price_per_day * dias` e conversão para centavos quando necessário (Stripe).
- Taxa da plataforma: 15% (vendor recebe 85%).
- Prevenção de sobreposição de locações para o mesmo equipamento.
- Estados de locação: `pending` → `approved` → `completed`; `pending` → `rejected` ou `cancelled` quando aplicável.

## Testes (Jest)

- Estrutura: `__tests__/` com `auth.test.ts`, `equipment.test.ts`, `rentals.test.ts`, `payments.test.ts`, `integration.test.ts` e `setup.ts`.
- Executar todos: `npm test`.
- Cobertura: `npm run test:coverage` gera `coverage/index.html`.

### Test Suite (resumo)

| Módulo       | Testes | Status      |
| ------------ | ------ | ----------- |
| Autenticação | 8      | ✅ Passando |
| Equipamentos | 11     | ✅ Passando |
| Locações     | 15     | ✅ Passando |
| Pagamentos   | 10     | ✅ Passando |
| Integração   | 4      | ✅ Passando |

### Cobertura (estimada)

```
Statements: 65% (312/480)
Branches: 62% (98/158)
Functions: 68% (72/106)
Lines: 66% (314/476)
```

### Mocks usados em testes

- Supabase: `createServerClient`, `createBrowserClient`, queries mockadas.
- Stripe: `checkout.sessions.create`, `checkout.sessions.retrieve`, `accounts.create`, `webhooks.constructEvent` mockados.

## Demonstração de Testes (resumo para apresentação)

- Comandos úteis:

```
npm test
npm run test:coverage
npx jest __tests__/rentals.test.ts --watch
```

- Saída esperada aproximada:
  - Test Suites: 5 passed
  - Tests: 48 passed
  - Cobertura: Statements ~65%, Lines ~66%, Branches ~62%, Functions ~68%


## Deploy (Vercel)


- Via Dashboard: conectar repositório GitHub, configurar `Framework: Next.js` e variáveis de ambiente.


Variáveis necessárias em produção:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
```

Recomendações de configuração:

- Habilitar RLS (Row Level Security) no Supabase e configurar policies.
- Registrar URLs de redirect no Supabase Auth para o domínio do Vercel.
- Configurar webhook no painel Stripe apontando para `/api/stripe/webhook`.

## Banco de Dados — Migrações

- Executar (no SQL editor do Supabase) os scripts na ordem:
  1. `scripts/001_create_schema.sql`
  2. `scripts/002_create_profiles_trigger.sql`

## Stack Tecnológico & Dependências Principais

### Frontend

- Framework: Next.js 16
- React: 19.2.0
- UI: shadcn/ui + Tailwind CSS v4

### Backend

- Runtime: Node.js
- API: Next.js API Routes
- Database: PostgreSQL (Supabase)

### Dependências principais (exemplo)

```json
{
  "next": "16.0.0",
  "react": "19.2.0",
  "typescript": "^5",
  "@supabase/ssr": "0.7.0",
  "stripe": "19.3.0",
  "jest": "^30.2.0",
  "ts-jest": "^29.1.1",
  "tailwindcss": "^4.1.9"
}
```

## Monitoramento, Segurança e Manutenção

- Segurança:
  - Habilitar RLS e validar inputs.
  - Usar HTTPS em produção e rotacionar chaves periodicamente.
- Monitoramento:
  - Vercel logs (`vercel logs [deployment-url]`) e Sentry para tracking de erros.
- Backups:
  - Supabase oferece backups automáticos; considerar exportações manuais periódicas.

## Demonstração para Banca (sugestão de roteiro)

Tempo total: ~20 minutos

1. Visão Geral (2 min) — explicar o produto e casos de uso
2. Funcionalidades (5 min) — signup, busca, locação, dashboard
3. Testes (8 min) — `npm test`
4. Código (3 min) — arquitetura e decisões
5. Perguntas (2 min)

## Próximos Passos / Roadmap

- Testes E2E com Playwright
- Analytics avançado
- Avaliações de usuários
- Sistema de notificações
- Mobile app (React Native)
- Multi-idiomas
- Pagamento com PIX

## Checklist Final

- Autenticação implementada
- Marketplace funcional
- Sistema de pagamentos
- 48+ testes passando
- Cobertura > 60%
- Documentação completa
- Pronto para demonstração

## Troubleshooting (problemas comuns)

- Erro 500 em API routes: conferir variáveis de ambiente e logs do Vercel.
- Webhook Stripe não acionando: verificar URL, Signing Secret e logs do Stripe.
- Testes: se faltar módulo, instalar dependências (`npm install`) ou ajustar `.env.test`.
- Timeouts no Jest: aumentar `testTimeout` em `jest.config.ts` se necessário.

## Scripts Úteis

- `npm install` — instalar dependências
- `npm run dev` — rodar aplicação local
- `npm test` — rodar testes
- `npm run test:coverage` — gerar relatório de cobertura
- `npm run build` — build para produção

## Referências e Recursos

- Links úteis: https://supabase.com/docs, https://nextjs.org/docs, https://docs.stripe.com, https://vercel.com/docs, https://jestjs.io

---

# Fest Rent — Documentação

## Visão Geral

`fest-rent` é uma plataforma de aluguel de equipamentos para eventos desenvolvida com Next.js, Supabase e Stripe. Este documento consolida toda a documentação do projeto (API, deploy, testes, guias e checklist de qualidade).

## Sumário Executivo

- Projeto: Fest Rent
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, Stripe
- Testes: Jest (≈48 testes), cobertura alvo ≥ 60%
- Deploy: Vercel

## Estrutura do Repositório (resumo)

- `app/` — páginas e API routes (inclui `api/equipment`, `api/rentals`, `api/stripe`, etc.)
- `components/` — componentes UI e provider de tema
- `__tests__/` — suíte de testes e utilitários de teste
- `scripts/` — migrations SQL (`001_create_schema.sql`, `002_create_profiles_trigger.sql`)
- `public/`, `styles/`, `lib/`, `hooks/` — utilitários e assets

## Instalação e Execução Local

1. Instalar dependências:

```
npm install
```

2. Configurar variáveis de ambiente (criar `.env.local` ou `.env.test` conforme necessidade):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=
```

3. Rodar servidor de desenvolvimento:

```
npm run dev
```

4. Rodar testes:

```
npm test
npm run test:coverage
```

## Modelos de Dados (Resumo)

User

```
id, email, name, role (renter|vendor|admin), avatar_url?, bio?, stripe_account_id?, created_at
```

Equipment

```
id, owner_id, name, description?, category, price_per_day, available, image_url?, created_at, updated_at
```

Rental

```
id, equipment_id, renter_id, owner_id, start_date, end_date, total_value, status (pending|approved|rejected|completed|cancelled), stripe_payment_id?, created_at, updated_at
```

## API — Endpoints Principais

Autenticação (Supabase):

- `POST /auth/login` — login
- `POST /auth/sign-up` — criação de usuário (role: `renter` | `vendor`)

Equipment:

- `GET /api/equipment` — listar equipamentos
- `POST /api/equipment` — criar equipamento (autenticado)

Rentals:

- `GET /api/rentals` — listar locações do usuário (autenticado)
- `POST /api/rentals` — criar locação (autenticado)
- `POST /api/rentals/{id}/approve` — aprovar locação
- `POST /api/rentals/{id}/reject` — rejeitar locação

Stripe / Pagamentos:

- `POST /api/stripe/connect-account` — criar conta Connect (autenticado)
- `POST /api/stripe/checkout` — criar sessão de checkout (autenticado)
- `POST /api/stripe/webhook` — webhook Stripe (recebe `checkout.session.completed`, `checkout.session.expired`)

Resposta de erros padrão:

```
401 Unauthorized
400 Bad Request
500 Internal Server Error
```

## Fluxos e Regras de Negócio Importantes

- Cálculo de duração: diferença entre `start_date` e `end_date` em dias.
- Cálculo de valor total: `price_per_day * dias` e conversão para centavos quando necessário (Stripe).
- Taxa da plataforma: 15% (vendor recebe 85%).
- Prevenção de sobreposição de locações para o mesmo equipamento.
- Estados de locação: `pending` → `approved` → `completed`; `pending` → `rejected` ou `cancelled` quando aplicável.

## Testes (Jest)

- Estrutura: `__tests__/` com `auth.test.ts`, `equipment.test.ts`, `rentals.test.ts`, `payments.test.ts`, `integration.test.ts` e `setup.ts`.
- Executar todos: `npm test`.
- Cobertura: `npm run test:coverage` gera `coverage/index.html`.
- Mocks:
  - Supabase: `createServerClient`, `createBrowserClient`, queries mockadas.
  - Stripe: `checkout.sessions.create`, `retrieve`, `accounts.create`, `webhooks.constructEvent` mockados.
- Boas práticas:
  - Isolar testes, usar `beforeEach`/`afterEach` e evitar dependências externas nos testes.

## Demonstração de Testes (resumo para apresentação)

- Comandos úteis:

```
npm test
npm run test:coverage
npx jest __tests__/rentals.test.ts --watch
```

- Saída esperada aproximada (exemplo):
  - Test Suites: 5 passed
  - Tests: 48 passed
  - Cobertura: Statements ~65%, Lines ~66%, Branches ~62%, Functions ~68%

## Deploy (Vercel)

- Via Dashboard: conectar repositório GitHub, configurar `Framework: Next.js` e variáveis de ambiente.

Variáveis necessárias em produção:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
```

Recomendações de configuração:

- Habilitar RLS (Row Level Security) no Supabase e configurar policies.
- Registrar URLs de redirect no Supabase Auth para o domínio do Vercel.
- Configurar webhook no painel Stripe apontando para `/api/stripe/webhook`.

## Banco de Dados — Migrações

- Executar (no SQL editor do Supabase) os scripts na ordem:
  1. `scripts/001_create_schema.sql`
  2. `scripts/002_create_profiles_trigger.sql`

## Monitoramento, Segurança e Manutenção

- Segurança:
  - Habilitar RLS e validar inputs.
  - Usar HTTPS em produção e rotacionar chaves periodicamente.
- Monitoramento:
  - Vercel logs (`vercel logs [deployment-url]`) e Sentry para tracking de erros.
- Backups:
  - Supabase oferece backups automáticos; considerar exportações manuais periódicas.

## Checklist de Qualidade (resumo)

- Testes automatizados cobrindo autenticação, equipamentos, locações, pagamentos e integração.
- Cobertura alvo: ≥ 60% em Statements, Lines, Branches e Functions.
- Performance: testes < 30s, queries otimizadas.
- Segurança: RLS habilitado, validação e sanitização de inputs.

## Troubleshooting (problemas comuns)

- Erro 500 em API routes: conferir variáveis de ambiente e logs do Vercel.
- Webhook Stripe não acionando: verificar URL, Signing Secret e logs do Stripe.
- Testes: se faltar módulo, instalar dependências (`npm install`) ou ajustar `.env.test`.
- Timeouts no Jest: aumentar `testTimeout` em `jest.config.ts` se necessário.

## Scripts Úteis

- `npm run dev` — rodar aplicação local
- `npm test` — rodar testes
- `npm run test:coverage` — gerar relatório de cobertura
- `npm run build` — build para produção

## Referências e Documentos Originais

- Arquivos fonte que foram consolidados neste documento: `https://supabase.com/docs, https://nextjs.org/docs, https://docs.stripe.com, https://vercel.com/docs, https://v0.app/docs, https://jestjs.io  `.

---


## Future Enhancements

- User reviews and ratings
- Messaging system between renters and vendors
- Advanced analytics dashboard
- Mobile app
- Email notifications
- Real-time availability calendar
- Insurance integration
- Damage protection plans

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@festmarketplace.com or open an issue on GitHub.

## Team

Built with Next.js and modern web technologies.

---

**Fest Marketplace** - Making event equipment rental simple and secure.
