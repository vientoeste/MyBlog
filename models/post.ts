import { connection } from '../models';

const newPostInsert = `INSERT INTO blog_este_dev.posts
(uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
const newPostHistoryInsert = `INSERT INTO blog_este_dev.post_histories
(post_uuid, title, content, category_id, created_at, is_published)
VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, 1)`;
// [TODO] for testing, not removed logs. if query logic is specified, logging logic must be removed
// [TODO] do need optimization/refactoring
export const createNewPostTX = (postUuid: string, title: string, content: string, categoryId: string, now: string) => {
  try {
    connection.beginTransaction((e) => {
      if (e) throw e;
      console.log('tx started');
      connection.query(newPostInsert,
        [postUuid, title, content, categoryId, now],
        (err, result) => {
          if (err) {
            console.error(err);
            connection.rollback((err3) => {
              console.log('tx q1 rollbacked');
              if (err3) console.error('rollback error:', err3);
              throw new Error('query failed');
            });
          } else {
            console.log(result);
            connection.query(newPostHistoryInsert,
              [postUuid, title, content, categoryId, now],
              (err1, result1) => {
                if (err1) {
                  console.error(err1);
                  connection.rollback((err3) => {
                    console.log('tx q2 rollbacked');
                    if (err3) console.error('rollback error:', err3);
                    throw new Error('query failed');
                  });
                } else {
                  console.log(result1);
                  connection.commit((err2) => {
                    console.log('tx commit called');
                    if (err2) {
                      console.log('not rollbacked');
                      connection.rollback((err3) => {
                        console.log('not rollbacked again');
                        if (err3) throw err3;
                      });
                      throw new Error('tx commit failed');
                    }
                    console.log('successfully commited');
                  });
                }
              });
          }
        });
    });
    return true;
  } catch (err) {
    connection.rollback(() => { });
  }
};
