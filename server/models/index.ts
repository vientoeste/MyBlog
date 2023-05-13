import knex, { Knex } from 'knex';
import { CategoryDTO, PostDTO } from '../interfaces/Dto';
import { fetchPreviewPosts } from './post';
import { fetchCategories } from './category';
import { validate } from 'uuid';
import { Nullable } from '../utils';

export const connection = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_ID,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB,
    port: parseInt(String(process.env.MYSQL_PORT)),
  },
});

export const executeSingleSelectQuery = async <T>(
  query: string, bindedParam?: Knex.RawBinding[],
): Promise<T[]> => {
  if (!bindedParam) {
    const v = (await connection.raw<T[]>(query))[0] as T[];
    return v;
  }
  const v = (await connection.raw<T[]>(query, bindedParam) as unknown[])[0] as T[];
  return v;
};

const recursiveTx = async (
  trx: Knex.Transaction,
  queries: string[],
  queryValues: string[][],
  queryCount = queries.length,
): Promise<void> => {
  const executeQueries = async (idx: number): Promise<void> => {
    if (idx === queryCount) {
      return;
    }
    try {
      await trx.raw(queries[idx], queryValues[idx]);
      await executeQueries(idx + 1);
    } catch (error) {
      throw error;
    }
  };

  await trx.transaction(async (trx2) => {
    try {
      await executeQueries(0);
      await trx2.commit();
    } catch (error) {
      await trx2.rollback();
      throw error;
    }
  });
};

export const executeMultipleQueriesTx = async (
  queries: string[],
  queryVals: string[][],
  queryCount = queries.length,
): Promise<void> => {
  if (queries.length !== queryCount || queryVals.length !== queryCount) {
    throw new Error('invalid param');
  }

  try {
    await connection.transaction(async (trx) => {
      await recursiveTx(trx, queries, queryVals);
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

const historyTable = (table: string) =>
  table.concat('_history');

const primaryKeyName = (tableName: string, primaryKey: string) =>
  validate(primaryKey) ? tableName.concat('_uuid') : tableName.concat('_id');

export const buildUpdateModelQuery = <T>(
  dataToUpdate: Nullable<T>,
  tableName: string,
  primaryKey: string,
): { query: string[], params: string[][] } => {
  const valuesToUpdate = {};
  const valuesNotToUpdate = {};
  Object.entries(dataToUpdate).forEach(e => {
    const [k, v] = e;
    if (e[1] === null) {
      Object.assign(valuesNotToUpdate, {
        [k]: v,
      });
    } else if (e[0] !== 'uuid' && e[0] !== 'id' && !/_uuid/.test(e[0])) {
      Object.assign(valuesToUpdate, {
        [k]: v,
      });
    }
  });

  const columnsToUpdate = Object.keys(valuesToUpdate);
  const recordsToUpdate = Object.values(valuesToUpdate);

  const updateRecordQuery = `
  UPDATE ${process.env.MYSQL_DB as string}.${tableName}
  SET ${columnsToUpdate.map((key) => `${key} = ?`).join(', ')}
  WHERE 1
  AND ${validate(primaryKey) ? 'BIN_TO_UUID(uuid)' : 'id'} = ?`;

  const keysNotToUpdate = Object.keys(valuesNotToUpdate);

  const insertHistoryQuery = `
  INSERT INTO ${process.env.MYSQL_DB as string}.${historyTable(tableName)}
  (${primaryKeyName(tableName, primaryKey)}, ${keysNotToUpdate.join(', ')}${keysNotToUpdate.length > 0 ? ',' : ''} ${columnsToUpdate.join(', ')})
    SELECT
      ${validate(primaryKey) ? 'uuid' : 'id'}, ${keysNotToUpdate.concat(columnsToUpdate.map(() => '?')).join(', ')}
    FROM ${process.env.MYSQL_DB as string}.${tableName}
    WHERE ${validate(primaryKey) ? 'BIN_TO_UUID(uuid)' : 'id'} = ?
  `;
  return {
    query: [updateRecordQuery, insertHistoryQuery],
    params: [
      [...recordsToUpdate, primaryKey] as string[],
      [...recordsToUpdate, primaryKey] as string[],
    ],
  };
};

export class MainPageCache {
  private postPreviews: PostDTO[] = [];

  private categories: CategoryDTO[] = [];

  constructor() {
    fetchPreviewPosts().then((v) => {
      this.postPreviews.push(...v);
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    });
    fetchCategories().then((v) => {
      this.categories.push(...v);
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }

  updateCategoryCache() {
    fetchCategories().then((v) => {
      this.categories.splice(0);
      this.categories.push(...v);
    }).catch((e) => {
      console.error(e);
      // [TODO] how to handle cache error?
    });
  }

  updatePostPreviewCache() {
    fetchPreviewPosts().then((v) => {
      this.postPreviews.splice(0);
      this.postPreviews.push(...v);
    }).catch((e) => {
      console.error(e);
      // [TODO] how to handle cache error?
    });
  }

  getCategory() {
    return this.categories;
  }

  getPostPreview() {
    return this.postPreviews;
  }
}
