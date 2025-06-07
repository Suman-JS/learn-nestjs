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
import { Post as PostType } from "@/posts/interfaces/post.interface";
import { PostsService } from "@/posts/posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get("")
  findAll(@Query("query") query?: string): PostType[] {
    const posts = this.postService.findAll();

    if (!query) return posts;

    return posts.filter((post) =>
      post.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  create(@Body() postData: CreatePostDto): PostType {
    return this.postService.create(postData);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateData: UpdatePostDto,
  ) {
    return this.postService.update(id, updateData);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }
}
