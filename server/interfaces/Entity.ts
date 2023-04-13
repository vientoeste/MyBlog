export interface PostEntity {
  uuid: string;
  title: string;
  content: string;
  category_id: number;
}
export interface CategoryEntity {
  id: number;
  name: string;
}
