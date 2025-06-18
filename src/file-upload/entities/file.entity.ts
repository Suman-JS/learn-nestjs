import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "@/auth/entities/user.entity";

@Entity()
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column()
  pubicId: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User)
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;
}
