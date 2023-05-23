import { Undefinedable } from '../utils';

export interface PostDTO {
  title: string;
  content: string;
  categoryId: number;
}

export interface FetchPostDTO extends PostDTO {
  uuid: string;
}

export type UpdatePostDTO = Undefinedable<PostDTO>;

export interface CategoryDTO {
  name: string;
  description: string;
}

export interface FetchCategoryDTO extends CategoryDTO {
  id: number;
}

export type UpdateCategoryDTO = Undefinedable<CategoryDTO>;

export type CreateCategoryDTO = CategoryDTO;

export interface FetchCommentDTO {
  userId: number;
  content: string;
  createdAt: string;
}

export interface CommentDTO {
  userId: number;
  content: string;
  postUuid: string;
}

export type CreateCommentDTO = CommentDTO;

export type UpdateCommentDTO = Undefinedable<CommentDTO>;
