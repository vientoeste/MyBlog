import { executeSingleSelectQuery, executeMultipleQueriesTx, buildUpdateModelQuery } from '.';
import { CommentDTO, UpdateCommentDTO } from '../interfaces/Dto';
import { CommentEntity } from '../interfaces/Entity';

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
  userId: string,
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
): Promise<CommentDTO[]> => {
  const commentEntities = await executeSingleSelectQuery<CommentEntity[]>(fetchCommentsSQL, [postUuid]);
  if (!commentEntities) {
    throw new Error('query error');
  }
  const comments = commentEntities.map((comment) => ({
    userId: comment.user_id,
    content: comment.content,
    createdAt: comment.created_at,
  }));
  return comments;
};

const deletedCommentHistoryInsertSQL = `
INSERT INTO ${process.env.MYSQL_DB as string}.comment_history
(comment_uuid, post_uuid, user_id, content, created_at, deleted_at)
  SELECT
    uuid, post_uuid, user_id, content, created_at, NOW()
  FROM ${process.env.MYSQL_DB as string}.comment
  WHERE uuid=UUID_TO_BIN(?)
`;
const deleteCommentSQL = `
UPDATE ${process.env.MYSQL_DB as string}.comment
SET is_deleted = 1
WHERE uuid=UUID_TO_BIN(?) and is_deleted = 0
`;
export const deleteComment = async (commentUuid: string) => {
  await executeMultipleQueriesTx(
    [deletedCommentHistoryInsertSQL, deleteCommentSQL],
    [[commentUuid], [commentUuid]],
  );
};

export const updateComment = async (
  paramsToUpdate: UpdateCommentDTO,
  commentUuid: string,
  postUuid: string,
) => {
  const commentEntity: CommentEntity = {
    uuid: commentUuid,
    post_uuid: postUuid,
    user_id: paramsToUpdate.userId ?? null,
    content: paramsToUpdate.content ?? null,
  } as CommentEntity;
  const { query, params } = buildUpdateModelQuery<CommentEntity, keyof typeof commentEntity>(
    commentEntity, 'comment', commentUuid,
  );
  await executeMultipleQueriesTx(query, params);
};
