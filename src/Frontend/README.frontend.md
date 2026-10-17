# CWOS — Frontend de agendamento

Implementação em Angular 18 baseada nos wireframes fornecidos, com dashboard, sidebar responsiva e quatro etapas de agendamento conectadas.

## Executar

```powershell
npm ci
npm start
```

Abra http://localhost:4200. Use uma versão de Node compatível com o Angular 18 (Node 22).

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

A compilação de produção fica em `dist/cwos-frontend/browser`. Para hospedar, configure o servidor para retornar `index.html` em rotas desconhecidas.

## Telas

| Rota | Conteúdo |
| --- | --- |
| `/dashboard` | Resumo, próximo agendamento, progresso e histórico da sessão. |
| `/formulario_cliente` | Nome, telefone com DDD e e-mail, com validação. |
| `/formulario_cliente-servico` | Veículo no formato tipo, modelo, cor, placa e seleção de serviço. |
| `/agenda-da-semana` | Grade semanal das 13h às 16h, navegação entre semanas e seleção de horário. No celular, seleção do dia. |
| `/confirmacao` | Revisão dos dados, Pix/cartão/dinheiro, confirmação e impressão do resumo. |

Todas as telas são acessíveis pela sidebar; as quatro telas de agendamento também têm indicador de etapas. A conclusão exige dados válidos e um horário disponível. Os formulários mantêm seus dados durante a navegação e após recarregar a mesma aba.

## Estrutura

- `src/app/pages`: componentes do dashboard e das quatro telas de agendamento.
- `src/app/core/booking.service.ts`: estado compartilhado, catálogo, grade de demonstração e confirmação.
- `src/app/shared/icon.component.ts`: ícones SVG reutilizáveis.
- `src/app/app.routes.ts`: rotas da aplicação.
- `src/styles.css`: identidade visual, responsividade e impressão.

## Escopo e integração futura

Este é um frontend demonstrativo, sem integração com backend. A disponibilidade é uma grade ilustrativa, com horários passados bloqueados. Os dados, horários confirmados e histórico do dashboard ficam em `sessionStorage` na aba atual; não são compartilhados entre usuários ou dispositivos. Um novo agendamento limpa o formulário e mantém os horários já escolhidos ocupados nessa sessão.

A forma de pagamento é apenas uma preferência para pagamento na unidade. Não há cobrança, processamento de cartão, Pix real, envio de e-mail ou reserva real. O resumo deixa essa condição explícita.

Para integrar uma API, substitua o catálogo e `status()` pela disponibilidade do servidor e implemente a confirmação atômica no backend. O servidor deve validar os dados e prevenir concorrência de reservas. A interface usa fontes do sistema e não carrega serviços externos.

## Verificação

Os testes do serviço cobrem requisitos de confirmação, horários ocupados/passados, prevenção de confirmação duplicada, persistência de sessão, recuperação de dados inválidos e reinício do fluxo.

Referências técnicas: [Reactive forms no Angular 18](https://v18.angular.dev/guide/forms/reactive-forms/).
