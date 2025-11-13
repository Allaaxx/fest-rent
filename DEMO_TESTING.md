# Script de Demonstração dos Testes

Use este script durante a apresentação do Projeto Integrador.

## Demonstração em Tempo Real

### 1. Executar Todos os Testes

\`\`\`bash
npm test
\`\`\`

**Tempo**: ~20 segundos
**Resultado esperado**: 48 testes passando

**O que comentar**:
- "Todos os 48 testes estão passando"
- "Cobertura acima de 60%"
- "5 módulos: Auth, Equipment, Rentals, Payments, Integration"

### 2. Mostrar Cobertura

\`\`\`bash
npm run test:coverage
\`\`\`

**Gera relatório em**: `coverage/index.html`

**Abrir no navegador**:
\`\`\`bash
open coverage/index.html
\`\`\`

**O que mostrar**:
- Cobertura por arquivo
- Linhas não cobertas
- Branches cobertos
- Detalhes por função

### 3. Executar Teste Específico com Watch

\`\`\`bash
npx jest __tests__/rentals.test.ts --watch
\`\`\`

**O que fazer**:
1. Mostrar saída dos testes passando
2. Abrir arquivo `__tests__/rentals.test.ts`
3. Explicar lógica de cálculo
4. (Opcional) Modificar um teste para falhar
5. Mostrar como a saída muda em tempo real

### 4. Demonstrar CI/CD

**Mostrar no GitHub**:
1. Actions tab
2. Workflow "Jest Tests & Coverage"
3. Último run bem-sucedido
4. Detalhes de cada step

**O que comentar**:
- "Pipeline automático em cada PR"
- "Testes devem passar para fazer merge"
- "Cobertura é rastreada"

### 5. Fluxo End-to-End

\`\`\`bash
npx jest __tests__/integration.test.ts --watch
\`\`\`

**Narrar o fluxo**:
1. "Usuário se cadastra como renter"
2. "Vendor cria equipamento"
3. "Renter solicita locação"
4. "Stripe processa pagamento"
5. "Sistema distribui fundos: 85% vendor, 15% platform"
6. "Todas as operações validadas"

### 6. Calcular Cobertura em Tempo Real

\`\`\`bash
npm run test:coverage -- --silent
\`\`\`

**Output esperado**:
\`\`\`
Statements   : 65% ( 312/480 )
Branches     : 62% ( 98/158 )
Functions    : 68% ( 72/106 )
Lines        : 66% ( 314/476 )
\`\`\`

## Apresentação Visual

### Slide 1: Visão Geral
Mostrar estrutura de testes com diagrama.

### Slide 2: Módulos
\`\`\`
Autenticação (8 testes)
├── Registro de usuário
├── Validação de email
├── Gerenciamento de sessão
└── JWT tokens

Equipamentos (11 testes)
├── CRUD completo
├── Filtros e busca
└── Validações

Locações (15 testes)
├── Cálculo de dias
├── Valor total e taxas
├── Transição de status
└── Prevenção de sobreposição

Pagamentos (10 testes)
├── Stripe Connect
├── Webhooks
└── Distribuição de fundos

Integração (4 testes)
└── Fluxo completo end-to-end
\`\`\`

### Slide 3: Cobertura
Imagem do `coverage/index.html`

### Slide 4: Pipeline CI/CD
Screenshot do GitHub Actions

## Falhas Esperadas (Opcional)

Para demonstrar que os testes detectam bugs:

1. Abrir `__tests__/rentals.test.ts`
2. Alterar valor esperado:
   \`\`\`typescript
   // ANTES
   expect(totalValue).toBe(750)
   
   // DEPOIS
   expect(totalValue).toBe(800) // Errado propositalmente
   \`\`\`
3. Rodar `npm test`
4. Mostrar falha em tempo real
5. Reverter mudança

## Tempo Estimado

- Introdução: 2 minutos
- Executar testes: 1 minuto
- Mostrar cobertura: 2 minutos
- Explicar módulos: 5 minutos
- CI/CD demo: 2 minutos
- Fluxo end-to-end: 3 minutos

**Total**: ~15 minutos

## Perguntas Esperadas

**P: "Por que 60% de cobertura?"**
A: "Cobertura alta aumenta confiança, mas 100% é overkill. 60% cobre os casos críticos."

**P: "Como você testa pagamentos reais?"**
A: "Usamos modo de teste do Stripe. Webhooks são mockados para não fazer chamadas reais."

**P: "E se um teste falhar em produção?"**
A: "Não chega em produção. CI/CD impede merge se testes falham."

**P: "Como testa autenticação?"**
A: "Supabase é mockado. Validamos lógica sem precisar de conexão real."

---

**Boa sorte na apresentação!** 🚀
