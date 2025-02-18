A seguir está um **plano de desenvolvimento** detalhado para a criação da API completa do seu **Sistema de Banco Mágico Gringotes**, em nível intermediário, utilizando **NestJS**, **TypeORM** e **PostgreSQL** como base. O plano está organizado em **fases** lógicas, para que você possa acompanhar a evolução passo a passo e garantir que a implementação atenda aos requisitos de negócio, boas práticas de desenvolvimento e de testes.

---

# Plano de Desenvolvimento

## Fase 0 – Planejamento Inicial e Definição de Requisitos

1. **Objetivo do projeto**

   - Simular um sistema bancário “mágico” (Gringotes), com abertura de “cofres” (contas), movimentações de depósito, saque e transferência.
   - Permitir a autenticação de usuários (bruxos) e papéis especiais (goblins administradores).
   - Documentar e demonstrar testes automatizados em vários níveis (unit, integration, e2e).

2. **Escopo funcional mínimo (versão intermediária)**

   - **Contas (Accounts)**: cadastro, listagem, detalhes.
   - **Usuários (Users)**: registro, login, autenticação via JWT.
   - **Transações (Transactions)**: depósitos, saques, transferências entre contas.
   - **Conversão de moedas (opcional)**: galeões, sicles e nuques, caso queira avançar.
   - **Permissões**:
     - Usuário comum só pode ver/editar suas próprias contas.
     - Administrador (goblin) pode visualizar e gerenciar todas as contas.
   - **Logs ou histórico de transações** (básico).
   - **Documentação** via Swagger.

3. **Tecnologias e Ferramentas**

   - **Node.js + NestJS** (framework de back-end).
   - **TypeORM** (0.3.x) como ORM.
   - **PostgreSQL** como banco de dados.
   - **JWT** para autenticação.
   - **Docker** (opcional) para facilitar desenvolvimento e deploy.
   - **ESLint + Prettier** para padronização de código.
   - **Jest** para testes.
   - **Swagger** (via `@nestjs/swagger`) para documentação.

4. **Estrutura básica do repositório**
   - **`src/`**: código-fonte principal.
   - **`src/app.module.ts`**: módulo raiz do NestJS.
   - **`src/modules/`** (ou subpastas organizadas por domínio: `users`, `accounts`, `transactions`, etc.).
   - **`src/main.ts`**: bootstrap da aplicação.
   - **`test/`** ou **`src/**some_module**/\*.spec.ts`**: testes (unitários e de integração).
   - **`ormconfig.ts`** ou **`data-source.ts`**: configuração de migrações.
   - **`.eslintrc.js`**, **`.prettierrc`**, **`package.json`**, etc.

---

## Fase 1 – Configuração do Projeto e Estrutura de Pastas

1. **Criar um novo repositório Git** e adicionar arquivos iniciais (README, .gitignore, etc.).
2. **Criar o projeto NestJS** (usando Nest CLI ou manualmente):
   ```bash
   pnpm dlx @nestjs/cli new gringotts-bank
   ```
3. **Instalar as dependências principais** no repositório:
   ```bash
   pnpm add @nestjs/typeorm typeorm pg
   pnpm add @nestjs/jwt passport passport-jwt  // para JWT Auth
   pnpm add class-validator class-transformer  // validação de DTOs
   ```
4. **Instalar dependências de desenvolvimento**:
   ```bash
   pnpm add -D @types/passport-jwt jest @types/jest ts-node tsconfig-paths
   ```
5. **Configurar** `ESLint` e `Prettier` (se não vier configurado com Nest CLI).
6. **Criar** uma estrutura de pastas (exemplo):
   ```
   src/
     main.ts
     app.module.ts
     modules/
       users/
       accounts/
       transactions/
   ```

---

## Fase 2 – Configuração do Banco de Dados e TypeORM

1. **Criar Banco de Dados** no PostgreSQL
   - Crie um banco chamado `gringotts_db` (ou outro nome).
2. **Configurar TypeORM** no `app.module.ts` (ou em um módulo de banco). Exemplo:
   ```ts
   @Module({
     imports: [
       TypeOrmModule.forRoot({
         type: 'postgres',
         host: 'localhost',
         port: 5432,
         username: 'postgres',
         password: 'postgres',
         database: 'gringotts_db',
         entities: [__dirname + '/**/*.entity.{ts,js}'],
         synchronize: false // Em produção usar migrações, mas em dev pode 'true' para prototipar
       })
       // ...
     ]
   })
   export class AppModule {}
   ```
3. **Criar arquivo de configuração** para migrações (ex.: `ormconfig.ts` ou `data-source.ts`) se for usar TypeORM CLI:

   ```ts
   import 'reflect-metadata'
   import { DataSource } from 'typeorm'
   import { Account } from './src/modules/accounts/account.entity'
   // ... import outras entidades

   export const AppDataSource = new DataSource({
     type: 'postgres',
     host: 'localhost',
     port: 5432,
     username: 'postgres',
     password: 'postgres',
     database: 'gringotts_db',
     entities: [Account /* ... */],
     migrations: ['dist/migrations/*.js']
   })
   ```

4. **Testar conexão** rodando a aplicação (`pnpm run start:dev`) ou criando migração fake.

---

## Fase 3 – Módulo de Usuários (Autenticação e Autorização)

1. **Criar Módulo** `Users`
   ```bash
   pnpm nest generate module users
   pnpm nest generate controller users
   pnpm nest generate service users
   ```
2. **Entidade `User`** (`user.entity.ts`):

   ```ts
   @Entity('users')
   export class User {
     @PrimaryGeneratedColumn()
     id: number

     @Column()
     username: string

     @Column()
     password: string

     @Column({ default: false })
     isGoblin: boolean // se "true", é administrador
   }
   ```

3. **DTOs**
   - `create-user.dto.ts` (ex.: `username`, `password`).
   - `login.dto.ts` (ex.: `username`, `password`).
4. **Service** – métodos para criar usuário, encontrar por username, etc.
5. **Controller** – rotas para `/users/register`, `/users/login`.

   - **Registro**: Cria usuário no DB (hash da senha se desejar).
   - **Login**: Valida credenciais e retorna **JWT**.

6. **Módulo de Autenticação**
   - Crie `AuthModule`, configure Passport e `@nestjs/jwt`.
   - Crie um **JWT Strategy** para validar token (se o user existe e não expirou).
   - Aplique `@UseGuards(AuthGuard('jwt'))` nas rotas que exigem login.
   - Diferencie entre **user comum** e **admin/goblin** via campo `isGoblin`.

---

## Fase 4 – Módulo de Contas (Accounts)

1. **Criar Módulo** `Accounts`:
   ```bash
   pnpm nest generate module accounts
   pnpm nest generate controller accounts
   pnpm nest generate service accounts
   ```
2. **Entidade `Account`** (`account.entity.ts`):

   ```ts
   @Entity('accounts')
   export class Account {
     @PrimaryGeneratedColumn()
     id: number

     @Column()
     ownerId: number // referência ao "User.id"

     @Column('decimal', { precision: 10, scale: 2, default: 0 })
     balanceGalleons: number
   }
   ```

3. **Relacionamento** com `User` (opcional, se quiser foreign key de fato):
   ```ts
   // Exemplo se quiser "many accounts to one user"
   @ManyToOne(() => User, user => user.accounts)
   user: User;
   ```
4. **DTOs**:
   - `create-account.dto.ts`: se necessário, ou pode gerar a conta automaticamente ao criar usuário.
5. **Service** – métodos:
   - `createAccount(ownerId: number)`: cria um cofre com saldo zero.
   - `findAllAccountsByUser(userId: number)`.
   - `findOneById(id: number)`.
6. **Controller** – rotas:
   - `POST /accounts` – cria conta para o usuário logado.
   - `GET /accounts` – lista contas do usuário logado (ou se admin, lista todas).
   - `GET /accounts/:id` – retorna detalhes da conta especificada (verifica se pertence ao usuário ou se é admin).

---

## Fase 5 – Módulo de Transações (Transactions)

1. **Criar Módulo** `Transactions`:
   ```bash
   pnpm nest generate module transactions
   pnpm nest generate controller transactions
   pnpm nest generate service transactions
   ```
2. **Entidade `Transaction`** (opcional, se quiser manter log de cada movimentação):

   ```ts
   @Entity('transactions')
   export class Transaction {
     @PrimaryGeneratedColumn()
     id: number

     @Column()
     accountId: number

     @Column('decimal', { precision: 10, scale: 2 })
     amount: number

     @Column()
     type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'

     @Column({ nullable: true })
     targetAccountId?: number // se for transferência

     @CreateDateColumn()
     createdAt: Date
   }
   ```

3. **Service** – métodos:
   - `deposit(accountId, amount)`: atualiza `balanceGalleons` e registra `Transaction`.
   - `withdraw(accountId, amount)`: verifica saldo, se ok, subtrai e registra `Transaction`.
   - `transfer(sourceAccountId, targetAccountId, amount)`: verifica saldo, subtrai de source e soma em target.
4. **Controller** – rotas:

   - `POST /transactions/deposit`: body com `{ accountId, amount }`.
   - `POST /transactions/withdraw`: idem.
   - `POST /transactions/transfer`: `{ sourceAccountId, targetAccountId, amount }`.
   - `GET /transactions/:accountId`: histórico de transações daquela conta.

5. **Validações e regras**:
   - Não deixar saldo negativo no withdraw/transfer.
   - Verificar se `account.ownerId === currentUser.id` (ou `isGoblin`) para permitir operações.

---

## Fase 6 – Migrações e Versionamento do Banco

1. **Criar um arquivo** `data-source.ts` (conforme explicado em Fase 2).
2. **Gerar migrações** automáticas a partir das entidades:
   ```bash
   pnpm typeorm migration:generate src/database/migrations/InitialSchema -d ./data-source.ts
   ```
   Isso criará o SQL para criar tabelas `users`, `accounts`, `transactions`.
3. **Aplicar migrações**:
   ```bash
   pnpm typeorm migration:run -d ./data-source.ts
   ```
4. **Gerar migrações** subsequentes (por ex., se você adicionar colunas ou novas entidades).
5. **Controle de versões** do DB: suba as migrações para o repositório Git.

---

## Fase 7 – Testes Automatizados

1. **Testes Unitários**

   - Criar `*.spec.ts` para cada service (ex.: `accounts.service.spec.ts`, `transactions.service.spec.ts`).
   - Utilizar **mocks** (Mock Repository) para não depender do DB real.
   - Testar regras de negócio (ex.: saldo insuficiente = erro).

2. **Testes de Integração**

   - Podem usar um banco de dados de teste ou in-memory (caso use sqlite para teste).
   - Subir a aplicação Nest e rodar requisições com **Supertest**.
   - Verificar se as rotas funcionam com JWT, regras de acesso, etc.

3. **Testes End-to-End**

   - O NestJS gera um arquivo `app.e2e-spec.ts` de exemplo.
   - Rodar `pnpm run test:e2e` para subir a aplicação e testar endpoints (registrar user, logar, criar conta, etc.).

4. **Cobertura**
   - Ver cobertura com `pnpm run test -- --coverage`.
   - Mirar ao menos ~80% de cobertura.

---

## Fase 8 – Documentação com Swagger

1. **Instalar dependências** (caso não tenha feito ainda):
   ```bash
   pnpm add @nestjs/swagger swagger-ui-express
   ```
2. **Configurar no `main.ts`**:

   ```ts
   import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

   async function bootstrap() {
     const app = await NestFactory.create(AppModule)

     const config = new DocumentBuilder()
       .setTitle('Gringotts Bank API')
       .setDescription('API para operações bancárias mágicas')
       .setVersion('1.0')
       .addBearerAuth()
       .build()
     const document = SwaggerModule.createDocument(app, config)
     SwaggerModule.setup('api', app, document)

     await app.listen(3000)
   }
   ```

3. **Adicionar decorators** em controllers e DTOs (`@ApiTags`, `@ApiProperty`, etc.) para enriquecer a documentação.
4. **Testar** acessando `http://localhost:3000/api`.

---

## Fase 9 – Configuração de Segurança e Melhores Práticas

1. **JWT** – já configurado no AuthModule. Garantir que rotas sensíveis estejam protegidas por `@UseGuards(AuthGuard('jwt'))`.
2. **Proteção contra XSS, CSRF** – NestJS não precisa de CSRF se for um back-end stateless, mas revise caso esteja usando cookies.
3. **Logging de exceções** – Use o `Logger` do NestJS ou Winston para registrar erros críticos.
4. **Variáveis de ambiente** – Armazenar credenciais do DB em `.env` (via `@nestjs/config` ou `dotenv`).
5. **HTTPS/SSL** – Se for expor publicamente, configure proxy ou use algum service que force HTTPS.

---

## Fase 10 – Deploy e CI/CD (Opcional nesta fase)

1. **Docker**: Criar `Dockerfile` e/ou `docker-compose.yml`
   - Exemplo do Dockerfile:
     ```dockerfile
     FROM node:20-alpine
     WORKDIR /app
     COPY package*.json .
     RUN pnpm install
     COPY . .
     RUN pnpm run build
     CMD ["node", "dist/main.js"]
     ```
   - Docker Compose para subir Postgres + API.
2. **CI/CD**:
   - Configurar pipeline (GitHub Actions, GitLab CI) para rodar testes e migrações em cada push.
   - Deploy automático em um serviço (Heroku, Render, AWS, etc.).

---

## Fase 11 – Finalização e Documentação de Uso

1. **Atualizar README**
   - Instruções de como rodar localmente (pnpm install, pnpm run build, pnpm run start:dev).
   - Passos para criação/config do DB.
   - Rotas principais e link para Swagger.
2. **Exemplos de Uso**
   - Inserir exemplos de requisições (curl ou Postman) de cadastro de usuário, login, criação de conta, depósito, etc.
3. **Versão final**
   - Tag no Git (`v1.0.0`).
   - Revisar se os requisitos iniciais foram cumpridos.

---

# Resumo do Roadmap

1. **Planejamento**: definir escopo e tecnologias.
2. **Setup do projeto**: criar app NestJS, configurar lint, Prettier, TS.
3. **Banco de dados**: configurar TypeORM + Postgres, conectar.
4. **Usuários (Auth)**: criar módulo `Users`, JWT, login, papéis.
5. **Contas (Accounts)**: módulo de contas, criar entidade e rotas.
6. **Transações**: módulo de transações, métodos de depósito, saque, transferência.
7. **Migrações**: criar/escrever migrações para manter schema versionado.
8. **Testes**: unit, integration, e2e.
9. **Swagger**: documentação interativa.
10. **Segurança**: boas práticas de token, logs, variáveis de ambiente.
11. **Deploy/CI** (opcional): Docker, pipeline de testes, deploy.
12. **Entrega e documentação final**.

Seguindo esse **plano de desenvolvimento** de forma ordenada, você terá uma **API intermediária** bem estruturada, com recursos de **auth**, **CRUD de contas**, **transações financeiras**, testes automatizados e documentação **Swagger** — tudo pronto para uso como base de ensino em **testes automatizados** ou para evoluir para uma aplicação mais complexa.
