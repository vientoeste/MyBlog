import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import { connection, executeMultipleQueriesTx } from '.';
import { CategoryDTO } from '../interfaces/Dto';
import { CategoryEntity } from '../interfaces/Entity';

const getCategoriesQuery = `
SELECT
  id, name
FROM ${process.env.MYSQL_DB as string}.categories`;
export const fetchCategories = (callback: (error: Error | null, results: CategoryDTO[]) => void) => {
  connection
    .query(getCategoriesQuery, (e: Query.QueryError | null, queryRes: CategoryEntity[]) => {
      if (e) {
        console.error(e);
        callback(e, []);
      }
      const categories = queryRes.map((category) => ({
        id: category.id,
        name: category.name,
      }));
      callback(null, categories);
    });
};

const newCategoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.categories
(name, description)
VALUES (?, ?)`;
const newCategoryHistoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.category_histories
(category_id, name, description)
  SELECT id, name, description
  FROM categories
  ORDER BY id DESC LIMIT 1`;
export const createNewCategoryTx = async (name: string, description: string) => {
  await executeMultipleQueriesTx(
    connection,
    [newCategoryInsert],
    [[name, description]],
  );
  await executeMultipleQueriesTx(
    connection,
    [newCategoryHistoryInsert],
    [[]],
  );
};
