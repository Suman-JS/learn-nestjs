import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { CreatePostDto } from "@/posts/dto/create-post.dto";
import { UpdatePostDto } from "@/posts/dto/update-post.dto";
import { PostExistsPipe } from "@/posts/pipes/post-exists.pipe";
import { PostsService } from "@/posts/posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get("")
  async findAll(@Query("query") query?: string) {
    return this.postService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe, PostExistsPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() postData: CreatePostDto) {
    return this.postService.create(postData);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe, PostExistsPipe) id: number,
    @Body() updateData: UpdatePostDto,
  ) {
    return this.postService.update(id, updateData);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseIntPipe, PostExistsPipe) id: number) {
    return this.postService.remove(id);
  }
}
