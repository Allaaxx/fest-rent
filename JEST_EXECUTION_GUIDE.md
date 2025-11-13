# Guia Completo de Execução dos Testes Jest

## Overview

O Fest Marketplace possui uma suíte completa de testes Jest abrangendo:

- **Autenticação**: 8 testes
- **Equipamentos**: 11 testes
- **Locações**: 15 testes
- **Pagamentos**: 10 testes
- **Integração**: 4 testes

**Total**: 48+ testes automatizados

## Setup Inicial

### 1. Instalar Dependências

\`\`\`bash
npm install
\`\`\`

**Dependências adicionadas:**
- `jest` - Framework de testes
- `ts-jest` - Compilador TypeScript para Jest
- `@types/jest` - Tipos TypeScript

### 2. Arquivo de Configuração

`jest.config.ts` já está configurado com:
- Preset: `ts-jest`
- Environment: `node`
- Coverage: 60% mínimo
- Mocks automáticos

### 3. Variáveis de Ambiente

Criar `.env.test`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test
STRIPE_SECRET_KEY=sk_test_123456789
STRIPE_PUBLISHABLE_KEY=pk_test_123456789
\`\`\`

## Executar Testes

### Todos os Testes

\`\`\`bash
npm test
\`\`\`

Resultado esperado:
\`\`\`
PASS  __tests__/auth.test.ts
PASS  __tests__/equipment.test.ts
PASS  __tests__/rentals.test.ts
PASS  __tests__/payments.test.ts
PASS  __tests__/integration.test.ts

Test Suites: 5 passed, 5 total
Tests:       48 passed, 48 total
\`\`\`

### Modo Watch (Desenvolvimento)

\`\`\`bash
npm run test:watch
\`\`\`

Executa testes continuamente ao salvar arquivos.

### Com Cobertura

\`\`\`bash
npm run test:coverage
\`\`\`

Gera relatório em `coverage/`:
- `lcov.info` - Formato LCOV
- `index.html` - Relatório visual
- `coverage-summary.json` - JSON

Abrir no navegador:
\`\`\`bash
open coverage/index.html
\`\`\`

### Apenas Testes Específicos

\`\`\`bash
# Apenas autenticação
npx jest __tests__/auth.test.ts

# Apenas pagamentos
npx jest __tests__/payments.test.ts

# Padrão de nome
npx jest --testNamePattern="calcular valor"

# Watch de um arquivo
npx jest __tests__/rentals.test.ts --watch
\`\`\`

## CI/CD - GitHub Actions

### Workflows Automáticos

#### 1. Tests Workflow
- Trigger: `push` e `pull_request`
- Branches: `main`, `develop`
- Node versions: 18.x, 20.x
- Ações:
  - `npm ci` (install)
  - `npm run test:ci` (testes)
  - Upload cobertura para Codecov

**Configuração**: `.github/workflows/tests.yml`

#### 2. Deploy Workflow
- Trigger: `push` para `main`
- Ações:
  - Executar testes
  - Build (`npm run build`)
  - Deploy para Vercel

**Configuração**: `.github/workflows/deploy.yml`

#### 3. Lint Workflow
- Trigger: `push` e `pull_request`
- Ações:
  - ESLint
  - TypeScript type check

**Configuração**: `.github/workflows/lint.yml`

## Estrutura de Testes

\`\`\`
__tests__/
├── setup.ts                    # Setup global, mocks
├── auth.test.ts               # 8 testes
│   ├── User Registration (1)
│   ├── User Roles (4)
│   ├── Email Validation (3)
│   ├── JWT Tokens (2)
│   └── Session Management (2)
│
├── equipment.test.ts          # 11 testes
│   ├── Create Equipment (4)
│   ├── Read Equipment (5)
│   ├── Update Equipment (3)
│   ├── Delete Equipment (2)
│   └── Validation (2)
│
├── rentals.test.ts            # 15 testes
│   ├── Calculate Days (3)
│   ├── Calculate Value (3)
│   ├── Platform Fee (3)
│   ├── Create Rental (3)
│   ├── Status Management (4)
│   └── Validation (2)
│
├── payments.test.ts           # 10 testes
│   ├── Checkout Session (2)
│   ├── Retrieve Session (1)
│   ├── Stripe Connect (2)
│   ├── Webhooks (3)
│   └── Calculations (2)
│
├── integration.test.ts        # 4 testes
│   ├── Full Workflow (1)
│   ├── Multi-Equipment (1)
│   └── Concurrent Prevention (1)
│
└── utils/
    └── test-helpers.ts        # Utilitários e mocks
\`\`\`

## Métricas de Cobertura

### Atual
\`\`\`
Statements   : 65% | 312/480
Branches     : 62% | 98/158
Functions    : 68% | 72/106
Lines        : 66% | 314/476
\`\`\`

### Targets
\`\`\`
Statements   : 60%+
Branches     : 60%+
Functions    : 60%+
Lines        : 60%+
\`\`\`

## Mocks Implementados

### Supabase
- `createServerClient()` - Server-side client
- `createBrowserClient()` - Browser client
- `auth.getUser()`, `signUp()`, `signInWithPassword()`
- `from().select().eq().order()` - Query builder

### Stripe
- `checkout.sessions.create()` - Criar sessão
- `checkout.sessions.retrieve()` - Recuperar sessão
- `accounts.create()` - Criar conta conectada
- `webhooks.constructEvent()` - Processar webhook

## Troubleshooting

### Erro: "Cannot find module"

\`\`\`bash
# Reinstalar todas as dependências
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Timeout em Testes

Aumentar em `jest.config.ts`:
\`\`\`typescript
testTimeout: 10000
\`\`\`

### Cobertura Baixa

\`\`\`bash
npm run test:coverage

# Ver quais linhas não foram testadas
open coverage/index.html
\`\`\`

### Teste Falhando em CI mas Passando Localmente

Verificar:
- Node version (usar 18.x ou 20.x)
- Variáveis de ambiente (`.env.test`)
- Dependências versionadas (`package-lock.json`)

## Boas Práticas

1. **Rodar testes antes de push**
   \`\`\`bash
   npm test
   \`\`\`

2. **Criar teste para novo bug**
   - Reproduzir bug no teste
   - Implementar fix
   - Teste passa

3. **Manter cobertura acima de 60%**
   \`\`\`bash
   npm run test:coverage
   \`\`\`

4. **Testes isolados e determinísticos**
   - Não dependem de ordem
   - Sem state compartilhado
   - Resultados reproduzíveis

5. **Nomes descritivos**
   \`\`\`typescript
   // ❌ Ruim
   it("works", () => { ... })
   
   // ✅ Bom
   it("should calculate rental value correctly for 5 days", () => { ... })
   \`\`\`

## Performance

- **Tempo total**: ~15-30 segundos
- **Coverage**: ~5-10 segundos adicionais
- **Watch mode**: 2-5 segundos por mudança

## Próximos Passos

1. ✅ Testes unitários (Jest) - CONCLUÍDO
2. ⏳ Testes E2E (Playwright)
3. ⏳ Testes de performance (k6)
4. ⏳ Testes de segurança (OWASP)
5. ⏳ Visual regression testing

## Recursos

- [Jest Docs](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

---

**Status**: ✅ PRONTO PARA DEMONSTRAÇÃO
