export interface PostDTO {
  uuid: string;
  title: string;
  content: string;
  categoryId: number;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  categoryId: number;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  categoryId?: number;
}

export interface CategoryDTO {
  id: number;
  name: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
}

export interface CommentDTO {
  userId: number;
  content: string;
  createdAt: string;
}

export interface CreateCommentDTO {
  userId: number;
  content: string;
  postUuid: string;
}

export interface UpdateCommentDTO {
  userId?: number;
  content?: string;
  postUuid?: string;
}
