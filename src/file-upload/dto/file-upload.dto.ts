import { IsOptional, IsString, MaxLength } from "class-validator";

export class FileUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
