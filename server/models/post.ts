import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import { connection, executeMultipleQueriesTx } from '.';
import { PostEntity } from '../interfaces/Entity';
import { PostDto } from '../interfaces/Dto';
import { RowDataPacket } from 'mysql2';

const newPostInsert = `INSERT INTO blog_este_dev.posts
(uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
const newPostHistoryInsert = `INSERT INTO blog_este_dev.post_histories
(post_uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
export const createNewPostTx = async (postUuid: string, title: string, content: string, categoryId: string, now: string) => {
  await executeMultipleQueriesTx(
    connection,
    [newPostInsert, newPostHistoryInsert],
    [[postUuid, title, content, categoryId, now], [postUuid, title, content, categoryId, now]],
    2,
  );
};

const getPostsQuery = `SELECT
BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM blog_este_dev.posts
WHERE 1
AND is_published = 1
ORDER BY updated_at DESC
LIMIT 0, 10`;
export const getExistingPosts = (callback: (error: Error | null, results: PostDto[]) => void) => {
  connection
    .query(getPostsQuery, (e: Query.QueryError | null, r: PostEntity[]) => {
      if (e) {
        console.error(e);
        callback(e, []);
      }
      const posts = r.map((element) => ({
        uuid: element.uuid,
        title: element.title,
        content: element.content,
        categoryId: element.category_id,
      }));
      callback(null, posts);
    });
};

const getPostByUuid = `SELECT
BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM blog_este_dev.posts
WHERE 1
AND is_published = 1
AND uuid = UUID_TO_BIN(?)
LIMIT 1`;
export const getSinglePost = (uuid: string, callback: (error: Error | null, result: PostDto | null) => void) => {
  connection
    .query(getPostByUuid, [uuid], (e: Query.QueryError | null, r: RowDataPacket[]) => {
      if (e) {
        console.error(e);
        callback(e, null);
      }
      const post = r[0] as PostEntity;

      callback(null, {
        uuid: post.uuid,
        title: post.title,
        content: post.content,
        categoryId: post.category_id,
      } as PostDto);
    });
};
