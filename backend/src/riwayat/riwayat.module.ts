import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiwayatInput } from './riwayat.entity';
import { RiwayatController } from './riwayat.controller';
import { RiwayatService } from './riwayat.service';

@Module({
  imports: [TypeOrmModule.forFeature([RiwayatInput])],
  controllers: [RiwayatController],
  providers: [RiwayatService],
})
export class RiwayatModule {}
