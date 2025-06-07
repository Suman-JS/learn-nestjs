export interface Post {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreatePost = Omit<Post, "id" | "createdAt">;

export type UpdatePost = Partial<Omit<CreatePost, "authorName">>;
