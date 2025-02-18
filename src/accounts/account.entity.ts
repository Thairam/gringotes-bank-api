import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  ownerId: number

  @Column('decimal', { precision: 10, scale: 2 })
  balanceGalleons: number
}
