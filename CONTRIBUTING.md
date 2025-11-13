# Contribuindo para o Fest Marketplace

Guia de contribuição para o projeto.

## Processo de Desenvolvimento

### 1. Criar Feature Branch

\`\`\`bash
git checkout -b feature/nova-funcionalidade
\`\`\`

### 2. Fazer Alterações

- Implementar funcionalidade
- Adicionar testes
- Documentar mudanças

### 3. Rodar Testes Localmente

\`\`\`bash
npm run test:coverage
\`\`\`

Garantir cobertura mínima de 60%.

### 4. Commit

\`\`\`bash
git commit -m "feat: descrição da funcionalidade"
\`\`\`

Usar conventional commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `test:` testes
- `refactor:` refatoração

### 5. Push e Pull Request

\`\`\`bash
git push origin feature/nova-funcionalidade
\`\`\`

Criar PR com descrição detalhada.

## Padrões de Código

### TypeScript

- Usar tipos explícitos
- Evitar `any`
- Comentar código complexo

### Componentes React

- Usar componentes funcionais
- Hooks no início
- Memoização onde necessário

### Testes

- Mínimo 60% de cobertura
- Descrever cenários claramente
- Usar mocks para dependências externas

## Processo de Review

1. Pelo menos 1 aprovação obrigatória
2. Todos os testes devem passar
3. Sem conflitos de merge

## Deployment

Merge automático para produção após aprovação.

---

Obrigado por contribuir! 🎉
