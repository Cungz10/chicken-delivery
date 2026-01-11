import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('master_kiriman')
export class MasterKiriman {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nama_kiriman: string;

  @CreateDateColumn()
  created_at: Date;
}
