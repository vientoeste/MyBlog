import { PostEntity } from '../interfaces/Entity';
import { PostDTO, UpdatePostDTO } from '../interfaces/Dto';
import { CustomError, Nullable } from '../utils';
import { executeSingleSelectQuery, executeMultipleQueriesTx, buildUpdateModelQuery } from '.';

const newPostInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.post
(uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
const newPostHistoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.post_history
(post_uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
export const createNewPostTx = async (postUuid: string, title: string, content: string, categoryId: string, now: string) => {
  await executeMultipleQueriesTx(
    [newPostInsert, newPostHistoryInsert],
    [[postUuid, title, content, categoryId, now], [postUuid, title, content, categoryId, now]],
  );
};

export const updatePostTx = async (
  uuid: string, postColumnsToUpdate: UpdatePostDTO,
) => {
  const postEntity: Nullable<PostEntity> = {
    uuid,
    title: postColumnsToUpdate.title ?? null,
    content: postColumnsToUpdate.content ?? null,
    category_id: postColumnsToUpdate.categoryId ?? null,
  };
  Object.assign(postEntity, postColumnsToUpdate);
  console.log(postEntity, postColumnsToUpdate);
  const { query, params } = buildUpdateModelQuery<PostEntity>(
    postEntity, 'post', uuid,
  );
  await executeMultipleQueriesTx(
    query, params,
  );
};

const fetchPreviewPostsSQL = `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.post
WHERE 1
  AND is_published = 1
  AND is_deleted = 0
ORDER BY updated_at DESC
LIMIT 0, 5`;
export const fetchPreviewPosts = async () => {
  const postEntities = await executeSingleSelectQuery<PostEntity>(fetchPreviewPostsSQL);
  if (!postEntities) {
    throw new Error('query error');
  }
  const posts = postEntities.map((post) => ({
    uuid: post.uuid,
    title: post.title,
    content: post.content,
    categoryId: post.category_id,
  }));
  return posts;
};

const fetchPostsByCategorySQL = (count: number) => `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.post
WHERE 1
  AND is_published = 1
  AND category_id = ?
  AND is_deleted = 0
ORDER BY updated_at DESC
LIMIT ${count === 0 ? '' : count.toString()}0, ${(count + 1).toString()}0`;
export const fetchPostsByCategory = async (
  categoryId: string, count: number,
): Promise<PostDTO[]> => {
  const postEntities = await executeSingleSelectQuery<PostEntity>(fetchPostsByCategorySQL(count), [categoryId]);
  if (!postEntities) {
    throw new Error('query error');
  }
  const posts = postEntities.map((post) => ({
    uuid: post.uuid,
    title: post.title,
    content: post.content,
    categoryId: post.category_id,
  }));
  return posts;
};

const fetchSinglePostSQL = `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.post
WHERE 1
  AND is_published = 1
  AND uuid = UUID_TO_BIN(?)`;
export const fetchSinglePost = async (uuid: string): Promise<PostDTO> => {
  const postEntity = await executeSingleSelectQuery<PostEntity>(fetchSinglePostSQL, [uuid]);
  if (!postEntity) {
    throw new Error('query error');
  }
  if (postEntity.length === 0) {
    throw new CustomError('no contents', 404);
  }
  if (postEntity.length === 2) {
    throw new CustomError('internal server error', 500);
  }
  const post = {
    uuid: postEntity[0].uuid,
    title: postEntity[0].title,
    content: postEntity[0].content,
    categoryId: postEntity[0].category_id,
  };
  return post;
};

const deletedPostHistoryInsertSQL = `
INSERT INTO ${process.env.MYSQL_DB as string}.post_history
(uuid, title, content, category_id, create_at, is_published, deleted_at)
  SELECT uuid, title, content, category_id, created_at, is_published, NOW()
  FROM ${process.env.MYSQL_DB as string}.post
  WHERE 1
    AND uuid = UUID_TO_BIN(?)
    AND is_deleted = 0
`;
const deletePostSQL = `
UPDATE ${process.env.MYSQL_DB as string}.post
SET is_deleted = 1
WHERE 1
  AND uuid = UUID_TO_BIN(?)
  AND is_deleted = 0
`;
export const deletePostTx = async (postUuid: string) => {
  await executeMultipleQueriesTx(
    [deletedPostHistoryInsertSQL, deletePostSQL],
    [[postUuid], [postUuid]],
  );
};
