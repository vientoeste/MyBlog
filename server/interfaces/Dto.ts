export interface PostDTO {
  uuid: string;
  title: string;
  content: string;
  categoryId: number;
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
  name: string,
  description: string,
}
