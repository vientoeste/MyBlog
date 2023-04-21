import { connection } from '.';
import { CommentDTO } from '../interfaces/Dto';
import { RowDataPacket } from 'mysql2';

const fetchCommentsSQL = `
SELECT user, content, created_at
FROM ${process.env.MYSQL_DB as string}.comments
WHERE post_uuid=UUID_TO_BIN(?)`;
export const fetchComments = (postUuid: string, callback: (error: Error | null, results: CommentDTO[] | null) => void) => {
  connection.query(fetchCommentsSQL, [postUuid], (e, queryRes: RowDataPacket[]) => {
    if (e) {
      console.error(e);
      callback(e, null);
    }
    const comments = queryRes.map((commentEntity) => commentEntity as CommentDTO);
    callback(null, comments);
  });
};
