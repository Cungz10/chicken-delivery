import { Controller, Get } from '@nestjs/common';
import { MasterKirimanService } from './master-kiriman.service';

@Controller('api/master-kiriman')
export class MasterKirimanController {
  constructor(private readonly service: MasterKirimanService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
