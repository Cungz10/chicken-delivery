import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterKiriman } from './master-kiriman.entity';
import { MasterKirimanController } from './master-kiriman.controller';
import { MasterKirimanService } from './master-kiriman.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterKiriman])],
  controllers: [MasterKirimanController],
  providers: [MasterKirimanService],
})
export class MasterKirimanModule {}
