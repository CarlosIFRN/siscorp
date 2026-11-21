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
| `/usuarios` | Interface HTTP para o CRUD de usuários; o acesso à API exige autenticação Admin. |

## Escopo desta entrega

O Angular usa `HttpClient` e o proxy `src/proxy.conf.json` para enviar `/api/**` ao Spring Boot em `127.0.0.1:8080` durante `npm start`. Inicie o backend separadamente. O frontend não tem tela de login, interceptor de autenticação nem armazena credenciais. `HttpClient` não exige login, mas os endpoints de usuários e agendamentos exigem HTTP Basic no Spring Security; sem credenciais, a API responde `401`.

O CRUD de Usuários está preparado para consumir `/api/usuarios`. A seção **Agendamentos do servidor**, no topo da Agenda, está preparada para listar, criar, alterar status e excluir registros em `/api/agendamentos`. Ambas mostram a resposta de erro da API ao tentar consultar sem autenticação; não exibem dados locais como se fossem registros do servidor. A criação de agendamento pede IDs de veículo e serviço já existentes porque a API não devolve seus detalhes e ainda não há endpoint de veículos para preencher o formulário automaticamente. Os endpoints de clientes e serviços existem apenas no perfil `db` e não são usados nesta interface.

O calendário abaixo dessa seção, o formulário público, o Dashboard, o Pátio/OS e o Financeiro ainda usam dados locais. Reservas do formulário público ficam no `localStorage` deste navegador e não são compartilhadas com o servidor nem com outros dispositivos. A agenda local começa vazia, sem agendamentos de exemplo. Esta entrega altera apenas o frontend.

O dashboard calcula os indicadores operacionais a partir da agenda local. Os indicadores financeiros aparecem sem valor até que pagamentos e ordens de serviço sejam integrados ao frontend; agendamentos não são tratados como receita recebida.

O Pátio usa `PatioService` e guarda OS no `localStorage` deste navegador. Começa vazio; check-in cria no máximo uma OS por agendamento e impede outra OS aberta para a mesma placa. Atendimento sem agendamento também é permitido. As etapas são sequenciais: Aguardando → Em lavagem → Acabamento → Pronto → Entregue. Cada transição salva horário e responsável. Serviços extras podem ser alterados até a entrega ou até o pagamento integral. Os preços exibidos são valores locais **demonstrativos** e não representam cobrança ou pagamento real. O status de pagamento permanece separado do andamento da OS; o recebimento é registrado somente no Financeiro.

O Financeiro usa `FinanceService` e guarda lançamentos e fechamentos no `localStorage` deste navegador. Permite baixa manual integral de OS em `Pronto` ou `Entregue` por dinheiro, Pix ou cartão, sem guardar dados do cartão ou chave Pix. Impede baixa duplicada, registra despesas com categoria e forma de saída, calcula saldo e dinheiro esperado, e exige confirmação antes do fechamento. O fechamento bloqueia novos lançamentos locais na data. A escolha de perfil `FUNCIONARIO`/`ADMIN` é somente uma **prévia de interface, sem autenticação**: FUNCIONARIO consulta o dia e registra recebimentos; ADMIN também registra despesas, fecha o caixa e consulta fechamentos anteriores. Nenhuma dessas restrições é segurança real até a API validar o usuário autenticado, conforme a issue #29.

A integração completa ainda precisa de APIs de veículos, de detalhes de clientes/serviços nos agendamentos, de OS, serviços/preços, funcionários, movimentações financeiras e fechamento. A autenticação HTTP Basic do backend protege usuários e agendamentos; ela ainda não substitui a prévia local de permissões do Financeiro.

```powershell
npm run build
```
