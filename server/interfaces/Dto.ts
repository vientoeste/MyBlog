export interface PostDto {
  uuid: string;
  title: string;
  content: string;
  categoryId: number;
}

export interface CreatePostDTO {
  title: string,
  content: string,
  categoryId: string,
}
