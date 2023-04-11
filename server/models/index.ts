import { createConnection } from 'mysql2';
import Connection from 'mysql2/typings/mysql/lib/Connection';

export const connection = createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_ID,
  password: process.env.MYSQL_PW,
  database: process.env.MYSQL_DB,
  port: parseInt(String(process.env.MYSQL_PORT)),
});
export const connectToDb = () => {
  connection.connect((e) => {
    if (e) {
      console.error(e);
      throw new Error(e?.message);
    } else {
      console.log('successfully connected to db');
    }
  });
};

const recursiveTx = (
  conn: Connection,
  queries: string[],
  queryValues: string[][],
  queryCount = queries.length,
) => new Promise((resolve, reject) => {
  conn.beginTransaction((err) => {
    if (err) {
      reject(err);
      return;
    }

    const executeQueries = (idx: number, callback: (err: Error | null) => void) => {
      if (idx === queryCount) {
        callback(null);
        return;
      }
      conn.query(queries[idx], queryValues[idx], (error) => {
        if (error) {
          callback(error);
        } else {
          executeQueries(idx + 1, callback);
        }
      });
    };

    executeQueries(0, (queryError) => {
      if (queryError) {
        conn.rollback(() => {
          reject(queryError);
        });
      } else {
        conn.commit((commitError) => {
          if (commitError) {
            conn.rollback(() => {
              reject(commitError);
            });
          } else {
            resolve(true);
          }
        });
      }
    });
  });
});

export const executeMultipleQueriesTx = (
  conn: Connection,
  queries: string[],
  queryVals: string[][],
  queryCount = queries.length,
) => new Promise((resolve, reject) => {
  if (queries.length !== queryCount || queryVals.length !== queryCount) reject(new Error('invalid param'));
  recursiveTx(conn, queries, queryVals)
    .then((result) => {
      resolve(result);
    })
    .catch((err: Error) => {
      console.error('Transaction failed:', err);
      reject(err);
    });
});
