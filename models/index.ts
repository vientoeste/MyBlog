import { createConnection } from 'mysql2';

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
