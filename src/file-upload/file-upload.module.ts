import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CloudinaryModule } from "@/file-upload/cloudinary/cloudinary.module";
import { File } from "@/file-upload/entities/file.entity";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { FileUploadController } from "./file-upload.controller";
import { FileUploadService } from "./file-upload.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
