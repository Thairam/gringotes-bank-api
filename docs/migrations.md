### ✅ **Quando criar novas migrações no TypeORM?**

Você deve criar uma nova migração **sempre que precisar alterar a estrutura do banco de dados**. O TypeORM usa migrações para **controlar mudanças no esquema do banco** sem perder dados.

---

## **📌 Situações em que você deve criar novas migrações**

### **1️⃣ Criando uma nova tabela**

Se você adicionou uma nova **entidade (`@Entity()`)**, precisa criar uma migração para refletir isso no banco.

#### **Exemplo: Criando uma nova entidade `Transaction`**

```ts
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: number

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
```

Agora, gere a migração:

```bash
pnpm run migration:generate -- src/migrations/AddTransactionTable
pnpm run migration:run
```

Isso criará a tabela **transactions** no banco.

---

### **2️⃣ Adicionando uma nova coluna**

Se precisar adicionar um novo campo a uma tabela existente.

#### **Exemplo: Adicionando um campo `isAdmin` em `User`**

```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string

  @Column()
  password: string

  @Column({ default: false }) // Adicionando novo campo
  isAdmin: boolean
}
```

Agora, gere a migração:

```bash
pnpm run migration:generate -- src/migrations/AddIsAdminToUsers
pnpm run migration:run
```

Isso **adicionará a coluna `isAdmin` sem apagar dados existentes**.

---

### **3️⃣ Modificando um tipo de dado**

Se precisar alterar o tipo de uma coluna existente.

#### **Exemplo: Alterando `balanceGalleons` de `integer` para `decimal`**

Antes:

```ts
@Column()
balanceGalleons: number;
```

Depois:

```ts
@Column('decimal', { precision: 10, scale: 2 })
balanceGalleons: number;
```

Agora, gere a migração:

```bash
pnpm run migration:generate -- src/migrations/ChangeBalanceToDecimal
pnpm run migration:run
```

Isso **altera a estrutura sem perder os dados**.

---

### **4️⃣ Criando relações (`@ManyToOne`, `@OneToMany`, etc.)**

Se precisar **criar uma relação entre tabelas**, precisa de uma nova migração.

#### **Exemplo: Relacionando `Account` com `User`**

```ts
@ManyToOne(() => User, user => user.accounts)
user: User;
```

Agora, gere a migração:

```bash
pnpm run migration:generate -- src/migrations/AddRelationUserToAccount
pnpm run migration:run
```

Isso adicionará a **chave estrangeira (`userId`)** na tabela `accounts`.

---

### **5️⃣ Criando índices, constraints ou removendo colunas**

Se precisar **adicionar índices (`@Index()`), constraints (`UNIQUE`, `NOT NULL`), ou remover colunas**, gere uma migração.

#### **Exemplo: Adicionando um índice na coluna `username`**

```ts
@Index()
@Column({ unique: true })
username: string;
```

Gere a migração:

```bash
pnpm run migration:generate -- src/migrations/AddIndexToUsername
pnpm run migration:run
```

Agora, a coluna `username` será **única** e indexada para **melhor desempenho**.

---

## **🚀 Resumo: Quando criar novas migrações?**

| **Cenário**                                                         | **Criar Migração?** | **Comando**                                                      |
| ------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| **Criar nova tabela**                                               | ✅ Sim              | `pnpm run migration:generate -- src/migrations/AddNewTable`      |
| **Adicionar nova coluna**                                           | ✅ Sim              | `pnpm run migration:generate -- src/migrations/AddNewColumn`     |
| **Modificar tipo de dado**                                          | ✅ Sim              | `pnpm run migration:generate -- src/migrations/ChangeColumnType` |
| **Criar relação (`@ManyToOne`, `@OneToMany`)**                      | ✅ Sim              | `pnpm run migration:generate -- src/migrations/AddRelation`      |
| **Adicionar índice (`@Index()`) ou `UNIQUE`**                       | ✅ Sim              | `pnpm run migration:generate -- src/migrations/AddIndex`         |
| **Remover coluna**                                                  | ✅ Sim              | `pnpm run migration:generate -- src/migrations/RemoveColumn`     |
| **Apenas alterou lógica de negócio** (sem mudar estrutura do banco) | ❌ Não              | Nenhuma migração necessária                                      |

📌 **Se você alterar apenas a lógica da aplicação (ex.: regras no Service), não precisa de migração.**

Agora você sabe **quando** e **como** criar novas migrações corretamente! 🚀
