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
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { User } from "@/auth/entities/user.entity";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreatePostDto } from "@/posts/dto/create-post.dto";
import { FindPostsQueryDto } from "@/posts/dto/find-post-query.dto";
import { UpdatePostDto } from "@/posts/dto/update-post.dto";
import { PostExistsPipe } from "@/posts/pipes/post-exists.pipe";
import { PostsService } from "@/posts/posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get("")
  async findAll(@Query("query") query: FindPostsQueryDto) {
    return this.postService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe, PostExistsPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Post("")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() postData: CreatePostDto, @CurrentUser() user: User) {
    return this.postService.create(postData, user);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("id", ParseIntPipe, PostExistsPipe) id: number,
    @Body() updateData: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postService.update({
      id,
      updateData,
      user,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param("id", ParseIntPipe, PostExistsPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.postService.remove(id, user);
  }
}
