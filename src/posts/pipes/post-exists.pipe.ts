import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from "@nestjs/common";

import { PostsService } from "@/posts/posts.service";

@Injectable()
export class PostExistsPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}

  async transform(value: number, _metadata: ArgumentMetadata) {
    try {
      await this.postService.findOne(value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException(`Post with id: ${value} not found.`);
    }
    return value;
  }
}
