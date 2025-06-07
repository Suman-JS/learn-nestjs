import {
  CreatePost,
  Post,
  UpdatePost,
} from "@/posts/interfaces/post.interface";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: "First post",
      authorName: "Suman",
      content: "First post content",
      createdAt: new Date(),
    },
  ];

  findAll(): Post[] {
    return this.posts;
  }

  findOne(id: number): Post {
    const post = this.posts.find((post) => post.id === id);

    if (!post) {
      throw new NotFoundException(`Post with the id: ${id} does not exists`);
    }
    return post;
  }

  create(postDate: CreatePost): Post {
    const newPost: Post = {
      id: this.getNextId(),
      ...postDate,
      createdAt: new Date(),
    };

    this.posts.push(newPost);
    return newPost;
  }

  update(id: number, updateData: UpdatePost): Post {
    const currentPostIndexToBeEdited = this.posts.findIndex(
      (post) => post.id === id,
    );

    if (currentPostIndexToBeEdited === -1) {
      throw new NotFoundException(`Post with id: ${id} not found`);
    }

    const definedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    this.posts[currentPostIndexToBeEdited] = {
      ...this.posts[currentPostIndexToBeEdited],
      ...definedData,
      updatedAt: new Date(),
    };

    return this.posts[currentPostIndexToBeEdited];
  }

  remove(id: number) {
    const currentPostIndex = this.posts.findIndex((post) => post.id === id);

    if (currentPostIndex === -1) {
      throw new NotFoundException(`Post with id: ${id} not found`);
    }

    this.posts.splice(currentPostIndex, 1);

    return;
  }

  private getNextId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((post) => post.id)) + 1
      : 1;
  }
}
