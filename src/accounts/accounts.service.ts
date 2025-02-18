import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Account } from './account.entity'

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async createAccount(ownerId: number): Promise<Account> {
    const newAccount = this.accountRepository.create({
      ownerId,
      balanceGalleons: 0
    })
    return this.accountRepository.save(newAccount)
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find()
  }
}
