# CWOS - Chrono Washing Operational System

O **CWOS (Chrono Washing Operational System)** é um sistema integrado de gestão operacional e financeira desenvolvido para centralizar a rotina de trabalho e o controle de caixa em lava-jatos.

---

## 1. Sobre o Projeto

Apresentação geral do sistema com base nas informações dos documentos:

* **O que é:** O CWOS é uma solução tecnológica voltada para a gestão integrada de lava-jatos.


* **Finalidade:** Centralizar as informações operacionais, rotinas de trabalho e controle de caixa do estabelecimento.


* **Problema/Necessidade abordada:** Aborda gargalos operacionais e administrativos causados pela gestão manual, desorganização no atendimento, falta de controle visual do pátio e perda de dados não estruturados.


* **Proposta principal:** Proporcionar o acompanhamento do status do veículo no pátio em tempo real, vincular serviços adicionais às ordens de serviço (OS) e automatizar os processos de agendamento e conciliação financeira.



---

## 2. Contexto

Os serviços de lava-rápidos atravessam um período de reestruturação impulsionado pelo crescimento de 10,8% do setor de serviços automotivos, conforme dados da Associação Brasileira de Franchising (ABF). Esse cenário reflete a emergência de um novo perfil de cliente, mais exigente em relação à otimização do tempo, de modo que a lavagem de automóveis deixou de ser vista unicamente como um serviço de limpeza. Apesar da expansão do mercado e do crescimento da frota, a sustentabilidade dos negócios depende da superação de gargalos operacionais internos, tais como contratação e retenção de mão de obra, manutenção de padrões de qualidade e gestão eficiente da operação.

---

## 3. Problema

A gestão manual das operações em lava-jatos apresenta deficiências recorrentes que impactam a eficiência e a rentabilidade do negócio:

* Perda de informações registradas de forma não estruturada.


* Desorganização do fluxo de atendimento.


* Ausência de controle visual sobre a fila e sobre o status dos veículos no pátio.


* Gestão sem dados consolidados a respeito das ocorrências no estabelecimento.


* Custo com mão de obra dedicada a tarefas passíveis de automação.



---

## 4. Objetivos

### 4.1 Objetivo Geral

Implementar um sistema de gestão para lava-jatos que centralize informações, rotinas de trabalho e controle de caixa, eliminando gargalos operacionais, reduzindo o trabalho humano manual e garantindo previsibilidade financeira para o negócio.

### 4.2 Objetivos Específicos

* Digitalizar o fluxo de entrada por meio de Ordem de Serviço (OS) digital, com registro de placa, cliente, avarias preexistentes e serviços contratados.


* Monitorar o pátio em tempo real, estabelecendo um fluxo de status do atendimento ("Aguardando", "Em lavagem", "Acabamento" e "Pronto") visível para toda a equipe.


* Vincular insumos e serviços adicionais diretamente à OS em andamento, garantindo a atualização exata do valor cobrado.


* Automatizar a conciliação financeira, integrando a baixa da OS finalizada diretamente ao caixa e agrupando os recebimentos por forma de pagamento (Pix, cartão e dinheiro).



---

## 5. Justificativa

A ineficiência na gestão diária mostra-se determinante para a descontinuidade de pequenos negócios, pois a ausência de controle converte o alto volume de trabalho em perda financeira não percebida. O projeto justifica-se pelos benefícios diretos proporcionados a três grupos:

* **Proprietários e gestores:** Ganham previsibilidade financeira e controle de insumos.


* **Equipe operacional:** Obtém clareza em relação às prioridades e aos status dos veículos no pátio.


* **Clientes:** Obtêm agilidade no atendimento, transparência e maior confiança na entrega e na cobrança dos serviços.



---

## 6. Público-alvo

O sistema destina-se a três perfis de usuários:

* **Donos/Proprietários e gestores de lava-rápido:** Utilizam o software para organizar e automatizar tarefas operacionais e administrativas.


* **Funcionários / Equipe operacional:** Acessam o sistema para verificar o tipo de serviço a ser executado, horários e o status das etapas do pátio.


* **Clientes finais:** Interagem com o sistema para agendar serviços e receber notificações (SMS/WhatsApp) informando quando o veículo está pronto.



---

## 7. Funcionalidades

As principais funcionalidades contempladas pelo sistema são:

* **Módulo de Recepção e OS Digital:** Cadastro do veículo, checklist de avarias preexistentes e vinculação inicial dos serviços solicitados.


* **Painel de Status do Pátio (Fila Visual):** Quadro virtual que permite à equipe acompanhar a transição do veículo pelos estados "Aguardando", "Em lavagem", "Acabamento" e "Pronto".


* **Módulo de Caixa Integrado (PDV):** Tela de recebimento que importa automaticamente o valor total da OS e registra o método de pagamento.


* **Fechamento de Caixa Simplificado:** Relatório diário de conciliação que cruza as baixas das ordens de serviço com os valores registrados em maquininhas e Pix.


* **Agendamento Básico (Agenda Integrada):** Calendário para organização de horários e previsibilidade de demanda.


* **Cadastro e Autenticação de Usuários:** Processo de criação de conta e login para acesso dos clientes.


* **Feedback e Avaliação:** Envio de comentários e registro de avaliação pública pelo cliente referente ao serviço prestado.


* **Gestão de Agendamentos e Vouchers:** Recursos para cancelamento, reagendamento, suspensão de rotina, conversão em vale-serviço (voucher) e sua renovação.


* **Atendimento Prioritário:** Mecanismo para identificação de atendimento prioritário em conformidade com a Lei Federal nº 10.048/2000.


* **Controle de Tolerância de Atraso e Bloqueio Temporário:** Monitoramento do tempo limite de tolerância (ex.: 15 minutos) e bloqueio temporário da vaga escolhida durante o pagamento.


* **Módulo Administrativo:** Configuração de horários de funcionamento, capacidade de atendimento, bloqueios de datas, cadastro de serviços e parametrização de regras de negócio.



---

## 8. Tecnologias

O projeto utiliza as seguintes tecnologias, frameworks e recursos técnicos mencionados nos materiais:

* **Angular:** Framework utilizado para a criação do front-end web, estruturado em componentes, serviços, roteamento de páginas e consumo da API REST.


* **Spring Boot:** Framework em Java utilizado para a criação do back-end em arquitetura monolítica, provendo controllers, services, modelos de domínio, repositórios e comunicação via API REST.


* **PostgreSQL:** Sistema gerenciador de banco de dados relacional utilizado para a persistência dos dados do sistema.


* **Spring Data JPA e JDBC:** Recursos de acesso a dados utilizados pela camada de persistência para execução de operações CRUD.


* **Spring Security:** Módulo de segurança do Spring Boot utilizado para autenticação e autorização.


* **bcrypt:** Algoritmo de criptografia hash utilizado para o armazenamento seguro de senhas.


* **HTTPS (SSL/TLS):** Protocolo de comunicação utilizado para a transmissão segura de dados encriptados entre cliente e servidor.


* **PCI-DSS:** Padrão de segurança da indústria de cartões de pagamento seguido ao delegar o processamento financeiro a um gateway certificado.


* **Vercel:** Plataforma de nuvem (PaaS) utilizada para a implantação (*deploy*) do front-end.


* **Render:** Plataforma de nuvem (PaaS) utilizada para a implantação (*deploy*) da API REST no back-end.



---

## 9. Requisitos

### 9.1 Requisitos Funcionais

#### Módulo do Cliente (Busca e Agendamento)

* **RF01 - Cadastro e autenticação (Essencial):** Permitir o cadastro e o login do cliente mediante informação de nome, e-mail, telefone, endereço e senha.


* **RF02 - Feedback e avaliação (Desejável):** Permitir que o cliente comente com o prestador de serviço sobre o que foi realizado em seu automóvel e registre uma avaliação pública.


* **RF03 - Seleção de veículo e serviço (Importante):** Permitir a seleção do serviço específico para o veículo identificado pelo cliente.


* **RF04 - Grade de horários livres (Essencial):** Exibir, em tempo real e em calendário, a agenda de horários disponíveis.


* **RF05 - Confirmação e comprovante (Importante):** Gerar a confirmação do agendamento, com emissão de comprovante digital e envio de notificações ao cliente.



#### Módulo de Gestão de Agenda, Tolerância e Vale-Serviço

* **RF06 - Cancelamento e reagendamento (Essencial):** Permitir que o cliente solicite o cancelamento ou a alteração de data e hora diretamente em seu painel.


* **RF07 - Suspensão da rotina (Desejável):** Permitir ao cliente solicitar a suspensão de rotinas diária, semanal e/ou mensal de lavagem do veículo por motivo justificável.


* **RF08 - Emissão de vale-serviço (voucher) (Importante):** Permitir converter agendamento em crédito, em voucher de serviço vinculado ao grupo/proprietário do lava-jato.


* **RF09 - Renovação do vale-serviço (Desejável):** Permitir que o cliente obtenha novo voucher de serviço em caso de perda ou danificação do original, em frequência aceitável para o lava-jato.


* **RF10 - Atendimento prioritário (Importante):** Permitir que o cliente receba atendimento imediato e especializado quando se enquadrar e se declarar em uma das categorias previstas na Lei Federal nº 10.048/2000.


* **RF11 - Controle de tolerância de atraso (Essencial):** Monitorar o tempo limite de tolerância (ex.: 15 minutos) e, expirado o prazo sem o check-in no lava-jato, alterar o status para "Atrasado/Liberado".



#### Módulo Administrativo (Proprietário do Lava-Jato)

* **RF12 - Gestão da grade de horários (Essencial):** Permitir ao lava-jato configurar horários de funcionamento, capacidade de atendimento por bloco e bloqueio de datas operacionais.


* **RF13 - Catálogo de serviços e preços (Importante):** Permitir o cadastro e a precificação dos serviços ofertados.


* **RF14 - Configuração de regras de negócio (Importante):** Parametrizar o tempo da janela de tolerância, a validade do voucher e os percentuais e prazos de retenção em caso de cancelamento.


* **RF15 - Validação de check-in (Importante):** Registrar o atendimento do veículo no momento da chegada, validando o cumprimento do horário reservado.



### 9.2 Requisitos Não Funcionais

* **RNF01 - Usabilidade (Importante):** O fluxo completo de agendamento deve ser concluído em, no máximo, quatro etapas a partir da escolha do lava-jato.


* **RNF02 - Responsividade (Desejável):** A interface deve funcionar adequadamente em telas de mais de um dispositivo móvel e de desktops.


* **RNF03 - Segurança e LGPD (Essencial):** Armazenar senhas com criptografia hash (bcrypt) e utilizar o protocolo HTTPS (SSL/TLS) na transmissão de dados.


* **RNF04 - Conformidade PCI-DSS (Essencial):** Não armazenar dados sensíveis de cartões de crédito em banco próprio, delegando o processamento a um gateway certificado.


* **RNF05 - Isolamento Multi-tenant (Essencial):** Garantir o isolamento lógico dos dados, de modo que cada estabelecimento acesse apenas as suas próprias informações.


* **RNF06 - Reserva temporária (lock) (Desejável):** Travar a vaga escolhida no calendário por, no máximo, dez minutos durante a etapa de pagamento, evitando agendamentos duplicados (*double booking*).


* **RNF07 - Disponibilidade (Importante):** Manter taxa de disponibilidade mensal de 99,5%.


* **RNF08 - Escalabilidade e desempenho (Importante):** Suportar mais de 10 requisições simultâneas sem ultrapassar o tempo limite de resposta de 2 segundos por ação.


* **RNF09 - Manutenibilidade (Importante):** Adotar arquitetura com código modularizado e documentado, de modo a facilitar a manutenção imediata e a evolução do sistema.



---

## 10. Modelagem do Sistema

### 10.1 Diagrama de Casos de Uso

> **A ser desenvolvido posteriormente.**

### 10.2 Diagrama de Classes

> **A ser desenvolvido posteriormente.**

### 10.3 Diagrama de Sequência

> **A ser desenvolvido posteriormente.**

### 10.4 Outros Diagramas

> **Espaço reservado para futuras modelagens do sistema.**

---

## 11. Arquitetura do Sistema

O CWOS adota uma **arquitetura monolítica** para manter a simplicidade de desenvolvimento, implantação e manutenção. A estrutura é dividida em três componentes principais:

1. **Front-end (Angular):** Desenvolvido em Angular, estruturado em componentes, serviços e roteamento. É hospedado na plataforma Vercel e consome a API REST via requisições HTTP/HTTPS trocando dados em formato JSON.


2. **Back-end (Spring Boot):** Desenvolvido em Spring Boot (API REST) e hospedado na plataforma Render. É composto pelas seguintes camadas internas:


* **Camada de Apresentação (Controllers):** Recebe e valida requisições HTTP, retornando respostas em JSON.


* **Camada de Aplicação (Services):** Contém as regras de negócio e orquestra chamadas ao domínio.


* **Camada de Domínio (Domain/Models):** Entidades, objetos de domínio e regras de negócio específicas.


* **Camada de Persistência (Repositories):** Interfaces de acesso a dados via Spring Data JPA para operações CRUD.


* **Camada de Infraestrutura:** Configurações, segurança (Spring Security), tratamento de exceções e conversão de objetos (Mappers/DTOs).




3. **Banco de Dados (PostgreSQL):** Banco de dados relacional (tabelas, relacionamentos, índices e restrições) acessado pelo back-end via JDBC.



---

## 12. Estrutura do Projeto

> **A ser preenchida posteriormente.**

---

## 13. Fluxo do Sistema

O fluxo de operação geral e a transição de status no pátio ocorrem da seguinte forma:

### Fluxo do Pátio

1. **Recepção:** O veículo é cadastrado na OS Digital com dados de placa, cliente e serviços.


2. **Aguardando:** O veículo entra no pátio com o status inicial "Aguardando".


3. **Em lavagem:** Ao iniciar o serviço, o status é alterado para "Em lavagem".


4. **Acabamento:** Após a lavagem principal, o veículo passa para a fase de "Acabamento".


5. **Pronto:** Ao finalizar, o status muda para "Pronto", o cliente é notificado e a OS é direcionada ao caixa para liquidação.



### Fluxo de Operação Interna (Requisições API)

1. **Requisição do cliente** emitida pelo Front-end.


2. **Controller** recebe e valida a requisição.


3. **Service** aplica as regras de negócio.


4. **Repository** acessa o banco de dados PostgreSQL.


5. Dados são retornados ao Service/Controller.


6. **Resposta enviada ao cliente**.



---

## 14. Desenvolvimento

O projeto é articulado com base nas competências de três disciplinas acadêmicas do curso:

* **Estrutura de Dados e Análise de Algoritmos:** Especificação algorítmica e modelagem do TAD Fila (FIFO) para o pátio, análise de complexidade assintótica $O(1)$ e $O(\log n)$, controle de tolerância e lógica de expiração e lock de reserva.


* **Análise e Projeto de Sistemas Web:** Modelagem de projeto de software, diagramas de classe, aplicação dos princípios SOLID e visão geral da arquitetura.


* **Desenvolvimento Web Full Stack e Banco de Dados:** Código-fonte do front-end (Angular), back-end (Spring Boot), modelo relacional (PostgreSQL) e implantação em nuvem (Vercel e Render).



### Cronograma e Macroatividades

| N.º | Macroatividade | Responsáveis
| --- | --- | --- |
| 1 | Levantamento e análise de requisitos | Identificação das funcionalidades, regras de negócio e requisitos não funcionais.
| 2 | Modelagem e definição da arquitetura | Definição da estrutura do sistema, do banco de dados, das tecnologias e infraestrutura de implantação.
| 3 | Desenvolvimento do banco de dados | Criação das entidades, dos relacionamentos, das restrições e dos mecanismos de persistência.
| 4 | Desenvolvimento do back-end | Implementação da API REST, das regras de negócio, da autenticação e da persistência.
| 5 | Desenvolvimento do front-end | Implementação das interfaces, da navegação, dos formulários e da integração com a API.
| 6 | Integração e testes | Integração entre os componentes, execução dos testes e publicação na infraestrutura de nuvem.
| 7 | Deploy | Deploy da aplicação em uma PaaS como Vercel e Render.

---

## 15. Resultados Esperados

* Eliminação de erros de comunicação entre a recepção e o pátio.


* Redução do tempo de fechamento diário do caixa de horas para poucos minutos.


* Maior previsibilidade financeira e controle sobre os insumos utilizados.


* Maior agilidade e transparência no atendimento fornecido aos clientes.


* Mitigação de perdas financeiras silenciosas decorrentes de falhas na gestão manual de atendimentos.



---

## 16. Considerações Finais

O CWOS consolida uma proposta de gestão integrada e informatizada voltada para sanar as principais ineficiências operacionais e financeiras enfrentadas por lava-jatos. Ao unir uma estrutura monolítica moderna (Angular, Spring Boot e PostgreSQL) com a centralização de OS, pátio, agenda e caixa, o sistema estabelece padrões que favorecem o controle gerencial, a eficiência operacional e a satisfação dos clientes.

---

## 17. Documentação Complementar

* [ ] Casos de uso
* [ ] Diagrama de classes
* [ ] Diagrama de sequência
* [ ] Documentação da arquitetura
* [ ] Documentação da API
* [ ] Manual de utilização
* [ ] Outras documentações

---

## 18. Autores

### Alunos / Desenvolvedores

* **Carlos Mateus de Carvalho Gonçalves**

* **João Vitor da Silva**

* **Laércio Fernandes Monteiro Neto**

* **Luiz Diogo Lucas Ribeiro**
