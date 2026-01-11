import { Controller, Get, Post, Body } from '@nestjs/common';
import { RiwayatService } from './riwayat.service';
import { CreateRiwayatDto } from './dto/create-riwayat.dto';

@Controller('api/riwayat')
export class RiwayatController {
  constructor(private readonly service: RiwayatService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateRiwayatDto) {
    return this.service.create(dto);
  }
}
