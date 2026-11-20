# CWOS — frontend Angular

Protótipo de interface para o CRM do lava-jato. As páginas principais são o formulário público, dashboard, agenda, pátio com ordens de serviço e financeiro. A sidebar da gestão pode ser recolhida no desktop e aberta como menu no celular.

## Executar

Requisitos: Node.js 22 e npm.

```powershell
cd src/Frontend
npm ci
npm start
```

Abra `http://localhost:4200`.

| Rota | Conteúdo |
| --- | --- |
| `/agendar` | Formulário público: dados do cliente, veículo, serviço, data e hora na mesma página. |
| `/dashboard` | Indicadores operacionais do dia, demanda dos próximos sete dias, mix de serviços, fila de atendimento e estrutura para indicadores financeiros. |
| `/agenda` | Calendário mensal, semanal e diário, com busca, filtro e alteração de status. |
| `/patio` | Quadro de OS por etapa, check-in de agendamento, atendimento avulso e ficha detalhada. |
| `/financeiro` | Caixa diário com OS a receber, movimentações, despesas e fechamento. |

## Escopo desta entrega

Esta entrega modifica apenas o frontend. A agenda começa vazia, sem agendamentos de exemplo. Reservas criadas pelo usuário ficam no `localStorage` deste navegador e não são compartilhadas com outros dispositivos. A API, autenticação e persistência em PostgreSQL ficam para a etapa de backend; o diretório `src/Backend` não faz parte desta alteração.

O dashboard calcula os indicadores operacionais a partir da agenda local. Os indicadores financeiros aparecem sem valor até que pagamentos e ordens de serviço sejam integrados ao frontend; agendamentos não são tratados como receita recebida.

O Pátio usa `PatioService` e guarda OS no `localStorage` deste navegador. Começa vazio; check-in cria no máximo uma OS por agendamento e impede outra OS aberta para a mesma placa. Atendimento sem agendamento também é permitido. As etapas são sequenciais: Aguardando → Em lavagem → Acabamento → Pronto → Entregue. Cada transição salva horário e responsável. Serviços extras podem ser alterados até a entrega ou até o pagamento integral. Os preços exibidos são valores locais **demonstrativos** e não representam cobrança ou pagamento real. O status de pagamento permanece separado do andamento da OS; o recebimento é registrado somente no Financeiro.

O Financeiro usa `FinanceService` e guarda lançamentos e fechamentos no `localStorage` deste navegador. Permite baixa manual integral de OS em `Pronto` ou `Entregue` por dinheiro, Pix ou cartão, sem guardar dados do cartão ou chave Pix. Impede baixa duplicada, registra despesas com categoria e forma de saída, calcula saldo e dinheiro esperado, e exige confirmação antes do fechamento. O fechamento bloqueia novos lançamentos locais na data. A escolha de perfil `FUNCIONARIO`/`ADMIN` é somente uma **prévia de interface, sem autenticação**: FUNCIONARIO consulta o dia e registra recebimentos; ADMIN também registra despesas, fecha o caixa e consulta fechamentos anteriores. Nenhuma dessas restrições é segurança real até a API validar o usuário autenticado, conforme a issue #29.

A integração futura precisa de API de OS, serviços/preços, funcionários, movimentações financeiras, fechamento e autorização por papel. O CRUD de agendamentos do backend ainda não está ligado à Agenda do frontend.

```powershell
npm run build
```
