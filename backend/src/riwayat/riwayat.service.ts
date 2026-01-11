import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiwayatInput } from './riwayat.entity';
import { CreateRiwayatDto } from './dto/create-riwayat.dto';

@Injectable()
export class RiwayatService {
  constructor(
    @InjectRepository(RiwayatInput)
    private repo: Repository<RiwayatInput>,
  ) {}

  findAll() {
    return this.repo.find({ 
      order: { created_at: 'DESC' },
      take: 50 
    });
  }

  async create(dto: CreateRiwayatDto) {
    const weights = dto.weights.map(w => parseFloat(w.toFixed(dto.precision_mode)));
    const dataInput = weights.join(',');
    const totalData = weights.length;
    const rataRata = weights.reduce((a, b) => a + b, 0) / totalData;
    const nilaiMax = Math.max(...weights);
    const nilaiMin = Math.min(...weights);

    const riwayat = this.repo.create({
      nama_kiriman: dto.nama_kiriman,
      nomer_po: dto.nomer_po,
      data_input: dataInput,
      total_data: totalData,
      rata_rata: parseFloat(rataRata.toFixed(2)),
      nilai_max: parseFloat(nilaiMax.toFixed(1)),
      nilai_min: parseFloat(nilaiMin.toFixed(1)),
    });

    return this.repo.save(riwayat);
  }
}
