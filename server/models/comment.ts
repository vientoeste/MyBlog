import { connection } from '.';
import { CommentDTO } from '../interfaces/Dto';
import { RowDataPacket } from 'mysql2';
import { CommentEntity } from '../interfaces/Entity';

const fetchCommentsSQL = `
SELECT user_id, content, created_at
FROM ${process.env.MYSQL_DB as string}.comments
WHERE post_uuid=UUID_TO_BIN(?)`;
export const fetchComments = (postUuid: string, callback: (error: Error | null, results: CommentDTO[] | CommentDTO | null) => void) => {
  connection.query(fetchCommentsSQL, [postUuid], (e, queryRes: RowDataPacket[]) => {
    if (e) {
      console.error(e);
      callback(e, null);
    }
    const comments: CommentDTO[] = [];
    if (Array.isArray(queryRes)) {
      comments.push(...queryRes.map((queryVal) => {
        const comment = queryVal as CommentEntity;
        return {
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at,
        } as CommentDTO;
      }));
    } else {
      const comment = queryRes as CommentEntity;
      comments.push({
        userId: comment.user_id,
        content: comment.content,
        createdAt: comment.created_at,
      } as CommentDTO);
    }
    callback(null, comments);
  });
};
