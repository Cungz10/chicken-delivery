import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterKiriman } from './master-kiriman.entity';

@Injectable()
export class MasterKirimanService {
  constructor(
    @InjectRepository(MasterKiriman)
    private repo: Repository<MasterKiriman>,
  ) {}

  findAll() {
    return this.repo.find({ order: { nama_kiriman: 'ASC' } });
  }
}
