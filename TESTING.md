# Fest Marketplace - Testing Guide

Guia completo para executar testes automatizados no projeto Fest Marketplace.

## Estrutura de Testes

\`\`\`
__tests__/
├── setup.ts                 # Configuração global e mocks
├── auth.test.ts            # Testes de autenticação
├── equipment.test.ts       # Testes de CRUD de equipamentos
├── rentals.test.ts         # Testes de locações
├── payments.test.ts        # Testes de pagamentos com Stripe
└── integration.test.ts     # Testes de integração end-to-end
\`\`\`

## Instalação e Configuração

### 1. Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Arquivo de Teste

Criar arquivo `.env.test` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
STRIPE_SECRET_KEY=sk_test_123456789
STRIPE_PUBLISHABLE_KEY=pk_test_123456789
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123456789
\`\`\`

## Executar Testes

### Rodar Todos os Testes

\`\`\`bash
npm test
\`\`\`

### Modo Watch (Ideal para Desenvolvimento)

\`\`\`bash
npm run test:watch
\`\`\`

### Gerar Relatório de Cobertura

\`\`\`bash
npm run test:coverage
\`\`\`

Resultado será salvo em `coverage/` com relatório HTML.

### Testes no CI/CD (GitHub Actions)

\`\`\`bash
npm run test:ci
\`\`\`

## Módulos de Teste

### 1. Autenticação (`auth.test.ts`)

Testa:
- Registro de usuário com dados válidos
- Rejeição de e-mail duplicado
- Validação de roles (renter, vendor, admin)
- Validação de formato de email
- Gerenciamento de sessões JWT
- Expiração de tokens

**Executar isoladamente:**
\`\`\`bash
npx jest __tests__/auth.test.ts
\`\`\`

### 2. Equipamentos (`equipment.test.ts`)

Testa:
- Criação de equipamento com validações
- Listagem e filtragem por categoria
- Busca por nome
- Atualização de preço e disponibilidade
- Exclusão segura
- Validações de preço (mín/máx)

**Executar isoladamente:**
\`\`\`bash
npx jest __tests__/equipment.test.ts
\`\`\`

### 3. Locações (`rentals.test.ts`)

Testa:
- Cálculo correto de dias entre datas
- Cálculo do valor total de locação
- Cálculo de taxa de plataforma (15%)
- Transição de status (pending → approved → completed)
- Validação de datas
- Prevenção de locações concorrentes

**Executar isoladamente:**
\`\`\`bash
npx jest __tests__/rentals.test.ts
\`\`\`

### 4. Pagamentos (`payments.test.ts`)

Testa:
- Criação de sessão de checkout Stripe
- Recuperação de sessão por ID
- Criação de conta Stripe Connect
- Verificação de capacidade de cobranças
- Tratamento de webhooks (completed, failed)
- Cálculo correto de valores em centavos

**Executar isoladamente:**
\`\`\`bash
npx jest __tests__/payments.test.ts
\`\`\`

### 5. Integração (`integration.test.ts`)

Testa:
- Fluxo completo: cadastro → equipamento → locação → pagamento
- Cancelamento de locação
- Marcação como completa
- Múltiplos equipamentos em uma ordem
- Prevenção de locações sobrepostas

**Executar isoladamente:**
\`\`\`bash
npx jest __tests__/integration.test.ts
\`\`\`

## Cobertura de Testes

Alvo de cobertura por tipo:
- **Branches**: 60%+
- **Functions**: 60%+
- **Lines**: 60%+
- **Statements**: 60%+

Ver relatório detalhado:
\`\`\`bash
npm run test:coverage
# Abrir coverage/index.html no navegador
\`\`\`

## Mocks Utilizados

### Supabase

\`\`\`typescript
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { ... },
    from: jest.fn(() => ({ ... }))
  })),
  createBrowserClient: jest.fn(() => ({
    auth: { ... }
  }))
}))
\`\`\`

### Stripe

\`\`\`typescript
jest.mock("stripe", () => jest.fn(() => ({
  checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
  accounts: { create: jest.fn(), retrieve: jest.fn() },
  webhooks: { constructEvent: jest.fn() }
})))
\`\`\`

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Descrições claras**: Use `describe()` e `it()` com textos descritivos
3. **Setup/Teardown**: Use `beforeEach()` e `afterEach()` para inicializar estado
4. **Assertions múltiplas**: Valide todos os cenários relevantes
5. **Sem dependências externas**: Use mocks para APIs externas

## Pipeline CI/CD

O repositório possui 3 workflows GitHub Actions:

### 1. Tests Workflow (`.github/workflows/tests.yml`)

- Roda em: `push` e `pull_request` para main/develop
- Node.js: 18.x, 20.x
- Executa testes e faz upload de cobertura

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

- Roda em: `push` para main
- Valida testes
- Faz build
- Deploy automático na Vercel

### 3. Lint Workflow (`.github/workflows/lint.yml`)

- Roda em: `push` e `pull_request`
- ESLint
- TypeScript type check

## Troubleshooting

### "Cannot find module '@supabase/ssr'"

\`\`\`bash
npm install @supabase/ssr
\`\`\`

### "Jest is not installed"

\`\`\`bash
npm install --save-dev jest ts-jest @types/jest
\`\`\`

### Testes falhando por timeout

Aumentar timeout em `jest.config.ts`:
\`\`\`typescript
testTimeout: 10000 // 10 segundos
\`\`\`

### Coverage baixa

Executar:
\`\`\`bash
npm run test:coverage
# Revisar coverage/index.html
# Adicionar testes para arquivos não cobertos
\`\`\`

## Próximos Passos

1. Integrar com ferramentas de qualidade (SonarQube, Codacy)
2. Adicionar testes de performance
3. Testes E2E com Playwright/Cypress
4. Testes de segurança (OWASP)
5. Load testing para Stripe

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Testing](https://supabase.com/docs/guides/testing)

---

**Última atualização**: November 2025
