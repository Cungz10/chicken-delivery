import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('riwayat_input')
export class RiwayatInput {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama_kiriman: string;

  @Column({ length: 50 })
  nomer_po: string;

  @Column('text')
  data_input: string;

  @Column('int')
  total_data: number;

  @Column('decimal', { precision: 5, scale: 2 })
  rata_rata: number;

  @Column('decimal', { precision: 3, scale: 1 })
  nilai_max: number;

  @Column('decimal', { precision: 3, scale: 1 })
  nilai_min: number;

  @CreateDateColumn()
  created_at: Date;
}
