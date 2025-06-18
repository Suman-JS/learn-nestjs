import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { User } from "@/auth/entities/user.entity";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { FileUploadDto } from "@/file-upload/dto/file-upload.dto";
import { FileUploadService } from "@/file-upload/file-upload.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("file-upload")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() fileUploadDto: FileUploadDto,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    return this.fileUploadService.uploadFile(
      file,
      fileUploadDto.description,
      user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.fileUploadService.findAll();
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.fileUploadService.remove(id);
  }
}
