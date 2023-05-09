import knex, { Knex } from 'knex';
import { CategoryDTO, PostDTO } from '../interfaces/Dto';
import { fetchPreviewPosts } from './post';
import { fetchCategories } from './category';
import { validate } from 'uuid';

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
): Promise<T> => {
  if (!bindedParam) {
    // [TODO] contribute knew for return type of knex.raw?
    const v = (await connection.raw(query) as unknown[])[0] as T;
    return v;
  }
  const v = (await connection.raw(query, bindedParam) as unknown[])[0] as T;
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
// const ;  

export const buildUpdateModelQuery = <T, K extends keyof T>(
  patch: Pick<T, K>,
  tableName: string,
  primaryKey: string,
): { query: string[], params: string[][] } => {
  const keys = Object.keys(patch);
  const values = Object.values(patch);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const updateRecordQuery = `
  UPDATE ${process.env.MYSQL_DB as string}.${tableName}
  SET ${setClause}
  WHERE 1
    AND ${validate(primaryKey) ? 'BIN_TO_UUID(uuid)' : 'id'} = ?`;

  // [TODO] complete
  const insertHistoryQuery = `
  INSERT INTO ${process.env.MYSQL_DB as string}.${historyTable(tableName)}
  (${primaryKeyName(tableName, primaryKey)}, ...
  SELECT
    ${validate(primaryKey) ? 'UUID_TO_BIN(?)' : '?'}, ...
  `;
  return {
    query: [updateRecordQuery],
    params: [[...values, primaryKey] as string[]],
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
