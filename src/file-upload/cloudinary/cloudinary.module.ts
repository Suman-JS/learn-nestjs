import { Module } from "@nestjs/common";

import { CloudinaryProvider } from "@/file-upload/cloudinary/cloudinary.provider";
import { CloudinaryService } from "@/file-upload/cloudinary/cloudinary.service";

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
