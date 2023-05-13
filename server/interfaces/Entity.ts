export interface PKTypes {
  [index: string]: string | number;
  id: number;
  uuid: string;
}

export interface PostEntity extends Pick<PKTypes, 'uuid'> {
  title: string;
  content: string;
  category_id: number;
}

export interface CategoryEntity extends Pick<PKTypes, 'id'> {
  name: string;
  description: string;
}

export interface UpdateCommentEntity extends Pick<PKTypes, 'uuid'> {
  post_uuid: string;
  user_id: number;
  content: string;
}

export interface CommentEntity extends UpdateCommentEntity {
  created_at: string;
}
