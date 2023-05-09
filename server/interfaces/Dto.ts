export interface PostDTO {
  uuid: string;
  title: string;
  content: string;
  categoryId: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  categoryId: string;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  categoryId?: string;
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
  userId: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentDTO {
  userId: string;
  content: string;
  postUuid: string;
}
