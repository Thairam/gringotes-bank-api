import { Controller, Get, Post, Body } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova conta' })
  create(@Body('ownerId') ownerId: number) {
    return this.accountsService.createAccount(ownerId)
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as contas' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.accountsService.findAll()
  }
}
