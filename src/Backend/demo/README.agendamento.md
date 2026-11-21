# CRUD de agendamentos

O backend usa Spring Data JPA para persistir agendamentos na tabela `agendamentos` definida em `src/BD/02_criar_tabelas.sql`. Todas as rotas exigem HTTP Basic com usuário ativo do tipo `Admin` ou `Funcionario` (Spring Security).

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/api/agendamentos` | Lista todos em ordem de data e hora |
| GET | `/api/agendamentos?data=2030-02-10` | Lista somente o dia informado |
| GET | `/api/agendamentos/{id}` | Busca um agendamento |
| POST | `/api/agendamentos` | Cria com status `AGENDADO`; retorna 201 e `Location` |
| PUT | `/api/agendamentos/{id}` | Atualiza veículo, serviço, data/hora e, se informado, status |
| DELETE | `/api/agendamentos/{id}` | Exclui; retorna 204 |

Corpo de `POST` ou `PUT`:

```json
{
  "idVeiculo": 1,
  "idServico": 1,
  "dataHora": "2030-02-10T13:00:00",
  "status": "AGENDADO"
}
```

`status` é ignorado na criação e opcional na edição. Os valores aceitos são `AGENDADO`, `EM_LAVAGEM`, `PRONTO`, `CONCLUIDO` e `CANCELADO`. Veículo e serviço devem existir, e o serviço precisa estar ativo. Referências inválidas retornam 400; agendamentos inexistentes retornam 404.

O formulário Angular ainda usa o armazenamento local do navegador. A integração com esta API exige vincular os dados do formulário aos cadastros de veículo e serviço, cujas estruturas atuais ainda diferem entre o frontend e o esquema SQL.
