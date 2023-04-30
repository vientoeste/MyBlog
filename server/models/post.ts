import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import { connection, executeMultipleQueriesTx } from '.';
import { PostEntity } from '../interfaces/Entity';
import { PostDTO, UpdatePostDTO } from '../interfaces/Dto';
import { RowDataPacket } from 'mysql2';
import { CustomError } from '../utils';

const newPostInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.posts
(uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
const newPostHistoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.post_histories
(post_uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
export const createNewPostTx = async (postUuid: string, title: string, content: string, categoryId: string, now: string) => {
  await executeMultipleQueriesTx(
    connection,
    [newPostInsert, newPostHistoryInsert],
    [[postUuid, title, content, categoryId, now], [postUuid, title, content, categoryId, now]],
  );
};

// [TODO] optimizable... maybe
const historyQueryBuilder = (
  uuid: string,
  { title, content, categoryId }: UpdatePostDTO,
) => {
  const columns: {
    toUpdate: string[],
    toLeave: string[],
    updateVal: string[],
  } = {
    toUpdate: [],
    toLeave: [],
    updateVal: [],
  };

  if (title !== undefined) {
    columns.toUpdate.push('title');
    columns.updateVal.push(title);
  } else {
    columns.toLeave.push('title');
  }
  if (content !== undefined) {
    columns.toUpdate.push('content');
    columns.updateVal.push(content);
  } else {
    columns.toLeave.push('content');
  }
  if (categoryId !== undefined) {
    columns.toUpdate.push('category_id');
    columns.updateVal.push(categoryId);
  } else {
    columns.toLeave.push('category_id');
  }

  return `
  INSERT INTO ${process.env.MYSQL_DB as string}.post_histories
  (post_uuid, ${columns.toUpdate.join(', ')}${columns.toLeave.length !== 0 ? ', '.concat(columns.toLeave.join(', ')) : ''}, is_published, created_at)
  SELECT
    uuid, '${columns.updateVal.join('\', \'')}'${columns.toLeave.length !== 0 ? ', '.concat(columns.toLeave.join(', ')) : ''}, is_published, NOW()
  FROM ${process.env.MYSQL_DB as string}.posts
  WHERE uuid=UUID_TO_BIN('${uuid}')`;
};
const createUpdateClause = (
  { title, content, categoryId }: UpdatePostDTO,
): string => {
  const columnsToUpdate: string[] = [];
  if (title !== undefined) {
    columnsToUpdate.push('title');
  }
  if (content !== undefined) {
    columnsToUpdate.push('content');
  }
  if (categoryId !== undefined) {
    columnsToUpdate.push('category_id');
  }
  return columnsToUpdate.join(' = ?, ').concat(' = ?');
};
const makeUpdatePostQuery = (postColumnsToUpdate: UpdatePostDTO) => `
UPDATE ${process.env.MYSQL_DB as string}.posts
SET ${createUpdateClause(postColumnsToUpdate)}
WHERE uuid=UUID_TO_BIN(?)`;
export const updatePostTx = async (uuid: string, postColumnsToUpdate: UpdatePostDTO) => {
  const valuesToUpdate = Object.values(postColumnsToUpdate) as string[];
  const updatePostHistoryQuery = historyQueryBuilder(uuid, postColumnsToUpdate);
  await executeMultipleQueriesTx(
    connection,
    [
      makeUpdatePostQuery(postColumnsToUpdate),
      updatePostHistoryQuery,
    ],
    [
      [...valuesToUpdate.flat(), uuid],
      [],
    ],
  );
};

const fetchPreviewPostsSQL = `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.posts
WHERE 1
  AND is_published = 1
  AND is_deleted = 0
ORDER BY updated_at DESC
LIMIT 0, 5`;
export const fetchPreviewPosts = (callback: (error: Error | null, results: PostDTO[]) => void) => {
  connection
    .query(fetchPreviewPostsSQL, (e: Query.QueryError | null, queryRes: PostEntity[]) => {
      if (e) {
        console.error(e);
        callback(e, []);
      }
      const posts = queryRes.map((post) => ({
        uuid: post.uuid,
        title: post.title,
        content: post.content,
        categoryId: post.category_id,
      }));
      callback(null, posts);
    });
};

const fetchPostsByCategorySQL = (count: number) => `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.posts
WHERE 1
  AND is_published = 1
  AND category_id = ?
  AND is_deleted = 0
ORDER BY updated_at DESC
LIMIT ${count === 0 ? '' : count.toString()}0, ${(count + 1).toString()}0`;
export const fetchPostsByCategory = (categoryId: string, count: number, callback: (error: Error | null, results: PostDTO[]) => void) => {
  connection
    .query(fetchPostsByCategorySQL(count), [categoryId], (e: Query.QueryError | null, queryRes: RowDataPacket[]) => {
      if (e) {
        console.error(e);
        callback(e, []);
      }
      const posts = queryRes.map((rowData) => {
        const post = rowData as PostEntity;
        return {
          uuid: post.uuid,
          title: post.title,
          content: post.content,
          categoryId: post.category_id,
        } as PostDTO;
      });
      callback(null, posts);
    });
};

const fetchSinglePostSQL = `
SELECT
  BIN_TO_UUID(uuid) as uuid, title, content, category_id, updated_at
FROM ${process.env.MYSQL_DB as string}.posts
WHERE 1
  AND is_published = 1
  AND uuid = UUID_TO_BIN(?)`;
export const fetchSinglePost = (uuid: string, callback: (error: Error | null, result: PostDTO | null) => void) => {
  connection
    .query(fetchSinglePostSQL, [uuid], (e: Query.QueryError | null, queryRes: RowDataPacket[]) => {
      if (e) {
        console.error(e);
        callback(e, null);
      }
      if (queryRes.length === 0) {
        callback(new CustomError('no contents', 404), null);
      }
      if (queryRes.length === 2) {
        callback(new CustomError('internal server error', 500), null);
      }
      const post = queryRes[0] as PostEntity;

      callback(null, {
        uuid: post.uuid,
        title: post.title,
        content: post.content,
        categoryId: post.category_id,
      } as PostDTO);
    });
};

const deletedPostHistoryInsertSQL = `
INSERT INTO ${process.env.MYSQL_DB as string}.post_histories
(uuid, title, content, category_id, create_at, is_published, deleted_at)
  SELECT uuid, title, content, category_id, created_at, is_published, NOW()
  FROM ${process.env.MYSQL_DB as string}.posts
  WHERE 1
    AND uuid = UUID_TO_BIN(?)
    AND is_deleted = 0
`;
const deletePostSQL = `
UPDATE ${process.env.MYSQL_DB as string}.posts
SET is_deleted = 1
WHERE 1
  AND uuid = UUID_TO_BIN(?)
  AND is_deleted = 0
`;
export const deletePostTx = async (postUuid: string) => {
  await executeMultipleQueriesTx(
    connection,
    [deletedPostHistoryInsertSQL, deletePostSQL],
    [[postUuid], [postUuid]],
  );
};
