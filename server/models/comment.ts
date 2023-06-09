import { executeSingleSelectQuery, executeMultipleQueriesTx, buildUpdateModelQuery } from '.';
import { CommentDTO, FetchCommentDTO } from '../interfaces/Dto';
import { CommentEntity, UpdateCommentEntity } from '../interfaces/Entity';
import { Nullable } from '../utils';

const newCommentInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.comment
(uuid, post_uuid, user_id, content, created_at)
VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?)`;
const newCommentHistoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.comment_history
(comment_uuid, post_uuid, user_id, content, created_at)
VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?)`;
export const createNewCommentTx = async (
  commentUuid: string,
  postUuid: string,
  userId: number,
  content: string,
  now: string,
) => {
  await executeMultipleQueriesTx(
    [newCommentInsert, newCommentHistoryInsert],
    [[commentUuid, postUuid, userId, content, now], [commentUuid, postUuid, userId, content, now]],
  );
};

const fetchCommentsSQL = `
SELECT user_id, content, created_at
FROM ${process.env.MYSQL_DB as string}.comment
WHERE 1
  AND post_uuid = UUID_TO_BIN(?)
  AND is_deleted = 0`;
export const fetchComments = async (
  postUuid: string,
): Promise<FetchCommentDTO[]> => {
  const commentEntities = await executeSingleSelectQuery<CommentEntity>(fetchCommentsSQL, [postUuid]);
  if (!commentEntities) {
    throw new Error('query error');
  }
  const comments = commentEntities.map((comment) => ({
    uuid: comment.uuid,
    userId: comment.user_id,
    content: comment.content,
    createdAt: comment.created_at,
    postUuid: comment.post_uuid,
  }));
  return comments;
};

const deletedCommentHistoryInsertSQL = `
INSERT INTO ${process.env.MYSQL_DB as string}.comment_history
(comment_uuid, post_uuid, user_id, content, created_at, deleted_at)
  SELECT
    uuid, post_uuid, user_id, content, created_at, NOW()
  FROM ${process.env.MYSQL_DB as string}.comment
  WHERE uuid=UUID_TO_BIN(?)`;
const deleteCommentSQL = `
UPDATE ${process.env.MYSQL_DB as string}.comment
SET is_deleted = 1
WHERE uuid=UUID_TO_BIN(?) and is_deleted = 0`;
export const deleteComment = async (commentUuid: string) => {
  await executeMultipleQueriesTx(
    [deletedCommentHistoryInsertSQL, deleteCommentSQL],
    [[commentUuid], [commentUuid]],
  );
};

export const updateComment = async (
  commentDTO: Nullable<CommentDTO>,
  commentUuid: string,
  postUuid: string,
) => {
  const commentEntity: Nullable<UpdateCommentEntity> = {
    uuid: commentUuid,
    post_uuid: postUuid,
    user_id: commentDTO.userId ?? null,
    content: commentDTO.content ?? null,
  };
  const { query, params } = buildUpdateModelQuery<UpdateCommentEntity>(
    commentEntity, 'comment', commentUuid,
  );
  await executeMultipleQueriesTx(query, params);
};
