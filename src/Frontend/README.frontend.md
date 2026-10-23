# CWOS — frontend Angular

Protótipo de interface para o CRM do lava-jato. São três páginas principais: formulário público único, dashboard e agenda de gestão. A sidebar da gestão pode ser recolhida no desktop e aberta como menu no celular.

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
| `/dashboard` | Indicadores do dia e próximos atendimentos. |
| `/agenda` | Calendário mensal, semanal e diário, com busca, filtro e alteração de status. |

## Escopo desta entrega

Esta entrega modifica apenas o frontend. Os dados são exemplos e ficam no `localStorage` deste navegador para permitir testar o fluxo entre as três páginas. As reservas não são compartilhadas com outros dispositivos e não são reais. A API, autenticação e persistência em PostgreSQL ficam para a etapa de backend; o diretório `src/Backend` não faz parte desta alteração.

```powershell
npm run build
```
