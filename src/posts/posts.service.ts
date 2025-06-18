import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";

import { User, UserRole } from "@/auth/entities/user.entity";
import { PaginationResponse } from "@/common/interfaces/paginated-response.interface";
import { CreatePostDto } from "@/posts/dto/create-post.dto";
import { FindPostsQueryDto } from "@/posts/dto/find-post-query.dto";
import { UpdatePostDto } from "@/posts/dto/update-post.dto";
import { Post } from "@/posts/entities/post.entity";

@Injectable()
export class PostsService {
  private postListCacheKeys: Set<string> = new Set();
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generatePostsListCacheKey(query: FindPostsQueryDto) {
    const { limit = 10, page = 1, title } = query;
    return `post_list_page${page}_limit${limit}_title${title || "all"}`;
  }

  async findAll(query: FindPostsQueryDto): Promise<PaginationResponse<Post>> {
    const cacheKey = this.generatePostsListCacheKey(query);
    this.postListCacheKeys.add(cacheKey);

    const getCachedData =
      await this.cacheManager.get<PaginationResponse<Post>>(cacheKey);

    if (getCachedData) {
      console.log(
        `cache hit ---------------> returning from cache for key: ${cacheKey}`,
      );
      return getCachedData;
    }

    console.log(
      `cache miss ---------------> returning from db for key: ${cacheKey}`,
    );

    const { page = 1, limit = 10, title } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder("post")
      .leftJoin("post.author", "author")
      .addSelect(["author.id", "author.email", "author.name", "author.role"])
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (title) {
      queryBuilder.andWhere("post.title ILIKE :title", { title: `%${title}%` });
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const responseResult = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };

    await this.cacheManager.set(cacheKey, responseResult, 30_0000);
    return responseResult;
  }

  async findOne(id: number): Promise<Post> {
    const cacheKey = `post_${id}`;
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);

    if (cachedPost) {
      console.log(
        `cache hit ---------------> returning from cache for key: ${cacheKey}`,
      );
      return cachedPost;
    }

    console.log(
      `cache miss ---------------> returning from db for key: ${cacheKey}`,
    );

    const post = await this.postRepository.findOne({
      relations: ["author"],
      select: {
        author: {
          password: false,
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with the id: ${id} does not exist`);
    }

    await this.cacheManager.set(cacheKey, post, 30_000);

    return post;
  }

  async create(postDate: CreatePostDto, authorName: User): Promise<Post> {
    const newPost = this.postRepository.create({
      title: postDate.title,
      content: postDate.content,
      author: authorName,
    });

    await this.invalidateAllCachedPosts();

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
      findPostToUpdate.author.id !== user.id &&
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
    const updatedPost = this.postRepository.save(findPostToUpdate);

    await Promise.all([
      this.cacheManager.del(`post_${id}`),
      this.invalidateAllCachedPosts(),
      this.cacheManager.set(`post_${id}`, updatedPost, 30_000),
    ]);

    return updatedPost;
  }

  async remove(id: number, user: User) {
    const postToDelete = await this.findOne(id);

    if (postToDelete.author.id !== user.id && user.role === UserRole.USER) {
      throw new ForbiddenException(
        "You don't have the permission the delete the post.",
      );
    }

    await this.postRepository.remove(postToDelete);
    await Promise.all([
      this.cacheManager.del(`post_${id}`),
      this.invalidateAllCachedPosts(),
    ]);
  }

  private async invalidateAllCachedPosts() {
    console.log(
      `invalidating ${this.postListCacheKeys.size} list cache entries`,
    );

    await Promise.all(
      Array.from(this.postListCacheKeys).map((key) =>
        this.cacheManager.del(key),
      ),
    );
    this.postListCacheKeys.clear();
  }
}
