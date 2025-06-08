import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

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
      return this.postRepository.find();
    }
    return this.postRepository.find({
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
    const post = await this.postRepository.findOneBy({
      id,
    });

    if (!post) {
      throw new NotFoundException(`Post with the id: ${id} does not exist`);
    }
    return post;
  }

  async create(postDate: CreatePostDto): Promise<Post> {
    const newPost = this.postRepository.create({
      title: postDate.title,
      content: postDate.content,
      authorName: postDate.authorName,
    });

    return this.postRepository.save(newPost);
  }

  async update(id: number, updateData: UpdatePostDto): Promise<Post> {
    const findPostToUpdate = await this.findOne(id);

    if (updateData.title) {
      findPostToUpdate.title = updateData.title;
    }

    if (updateData.content) {
      findPostToUpdate.content = updateData.content;
    }

    return this.postRepository.save(findPostToUpdate);
  }

  async remove(id: number) {
    const postToDelete = await this.findOne(id);

    await this.postRepository.remove(postToDelete);
  }
}
