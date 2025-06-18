import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { IsOptional, IsString, Max } from "class-validator";

export class FindPostsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @Max(100, { message: "Title search cannot exceed 100 characters" })
  title?: string;
}
