export interface PKTypes {
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
}

export interface CommentEntity extends Pick<PKTypes, 'uuid'> {
  post_uuid: string;
  user_id: string;
  content: string;
  created_at: string;
}
