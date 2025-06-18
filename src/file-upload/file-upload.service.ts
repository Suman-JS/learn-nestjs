import { User } from "@/auth/entities/user.entity";
import { CloudinaryService } from "@/file-upload/cloudinary/cloudinary.service";
import { File } from "@/file-upload/entities/file.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    description: string | undefined,
    user: User,
  ) {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);
    const newlyCreatedFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      pubicId: cloudinaryResponse?.public_id,
      url: cloudinaryResponse?.secure_url,
      description,
      uploader: user,
    });
    return this.fileRepository.save(newlyCreatedFile);
  }

  async findAll() {
    return this.fileRepository.find({
      relations: ["uploader"],
      order: {
        createdAt: "DESC",
      },
      select: {
        uploader: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async remove(id: string) {
    const fileToBeDeleted = await this.fileRepository.findOne({
      where: { id },
    });

    if (!fileToBeDeleted) {
      throw new NotFoundException(`File with id: ${id} not found`);
    }

    await this.cloudinaryService.deleteFile(fileToBeDeleted.pubicId);

    await this.fileRepository.remove(fileToBeDeleted);
  }
}
