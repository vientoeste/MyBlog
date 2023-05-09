export interface PKTypes {
  id: number;
  uuid: string;
}

export interface PostEntity extends Pick<PKTypes, 'uuid'> {
  [index: string]: string;
  title: string;
  content: string;
  category_id: string;
}
export interface CategoryEntity extends Pick<PKTypes, 'id'> {
  name: string;
}

export interface CommentEntity extends Pick<PKTypes, 'uuid'> {
  [index: string]: string;
  post_uuid: string;
  user_id: string;
  content: string;
  created_at: string;
}
