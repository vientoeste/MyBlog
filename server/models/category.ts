import { executeSingleSelectQuery, executeMultipleQueriesTx, buildUpdateModelQuery } from '.';
import { CategoryDTO, UpdateCategoryDTO } from '../interfaces/Dto';
import { CategoryEntity } from '../interfaces/Entity';
import { Nullable } from '../utils';

const getCategoriesQuery = `
SELECT
  id, name
FROM ${process.env.MYSQL_DB as string}.category
WHERE 1
  AND is_deleted = 0`;
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

export const updateCategoryTx = async (
  id: number, categoryColumnsToUpdate: Nullable<CategoryEntity>,
) => {
  const categoryEntity: Nullable<CategoryEntity> = {
    id,
    description: categoryColumnsToUpdate.description ?? null,
    name: categoryColumnsToUpdate.name ?? null,
  };
  const { query, params } = buildUpdateModelQuery<CategoryEntity>(
    categoryEntity, 'category', id,
  );
  await executeMultipleQueriesTx(query, params);
};

const deletedCategoryHistoryInsertSQL = `
INSERT INTO ${process.env.MYSQL_DB as string}.category_history
(category_id, name, description, deleted_at)
  SELECT id, name, description, NOW()
  FROM ${process.env.MYSQL_DB as string}.category
  WHERE 1
    AND id = ?
    AND is_deleted = 0
`;
const deleteCategorySQL = `
UPDATE ${process.env.MYSQL_DB as string}.category
SET is_deleted = 1
WHERE 1
  AND id = ?
  AND is_deleted = 0
`;
export const deleteCategoryTx = async (
  id: number,
) => {
  await executeMultipleQueriesTx([
    deletedCategoryHistoryInsertSQL, deleteCategorySQL,
  ], [
    [id], [id],
  ]);
};
