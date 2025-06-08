import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { User, UserRole } from "@/auth/entities/user.entity";
import { CreatePostDto } from "@/posts/dto/create-post.dto";
import { UpdatePostDto } from "@/posts/dto/update-post.dto";
import { Post } from "@/posts/entities/post.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async findAll(query: string | undefined): Promise<Post[]> {
    if (!query) {
      return this.postRepository.find({
        relations: ["authorName"],
      });
    }
    return this.postRepository.find({
      relations: ["authorName"],
      where: [
        {
          title: ILike(`%${query}%`),
        },
        {
          content: ILike(`%${query}%`),
        },
      ],
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      relations: ["authorName"],
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with the id: ${id} does not exist`);
    }
    return post;
  }

  async create(postDate: CreatePostDto, authorName: User): Promise<Post> {
    const newPost = this.postRepository.create({
      title: postDate.title,
      content: postDate.content,
      authorName,
    });

    return this.postRepository.save(newPost);
  }

  async update({
    id,
    updateData,
    user,
  }: {
    id: number;
    updateData: UpdatePostDto;
    user: User;
  }): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);

    if (
      findPostToUpdate.authorName.id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException("You can only update your own posts");
    }

    if (updateData.title) {
      findPostToUpdate.title = updateData.title;
    }

    if (updateData.content) {
      findPostToUpdate.content = updateData.content;
    }

    return this.postRepository.save(findPostToUpdate);
  }

  async remove(id: number, user: User) {
    const postToDelete = await this.findOne(id);

    if (postToDelete.authorName.id !== user.id && user.role === UserRole.USER) {
      throw new ForbiddenException(
        "You don't have the permission the delete the post.",
      );
    }
    await this.postRepository.remove(postToDelete);
  }
}
