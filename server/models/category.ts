import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query';
import { connection } from '.';
import { CategoryDTO } from '../interfaces/Dto';
import { CategoryEntity } from '../interfaces/Entity';

const getCategoriesQuery = `
SELECT
  id, name
FROM ${process.env.MYSQL_DB as string}.categories`;
export const getCategories = (callback: (error: Error | null, results: CategoryDTO[]) => void) => {
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
