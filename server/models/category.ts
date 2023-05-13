import { executeSingleSelectQuery, executeMultipleQueriesTx } from '.';
import { CategoryDTO } from '../interfaces/Dto';
import { CategoryEntity } from '../interfaces/Entity';

const getCategoriesQuery = `
SELECT
  id, name
FROM ${process.env.MYSQL_DB as string}.category`;
export const fetchCategories = async (): Promise<CategoryDTO[]> => {
  const categoryEntities = await executeSingleSelectQuery<CategoryEntity>(getCategoriesQuery);
  if (!categoryEntities) {
    throw new Error('query error');
  }
  const categories = categoryEntities.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
  }));
  return categories;
};

const newCategoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.category
(name, description)
VALUES (?, ?)`;
const newCategoryHistoryInsert = `
INSERT INTO ${process.env.MYSQL_DB as string}.category_history
(category_id, name, description)
  SELECT id, name, description
  FROM category
  ORDER BY id DESC LIMIT 1`;
export const createNewCategoryTx = async (name: string, description: string) => {
  await executeMultipleQueriesTx(
    [newCategoryInsert],
    [[name, description]],
  );
  await executeMultipleQueriesTx(
    [newCategoryHistoryInsert],
    [[]],
  );
};
