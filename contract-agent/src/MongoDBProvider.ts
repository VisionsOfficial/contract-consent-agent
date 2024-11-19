/*
import {
  Collection,
  Db,
  ChangeStreamDocument,
  Document,
  WithId,
  InsertOneResult,
  MongoClient,
} from 'mongodb';
import { DataProvider } from './DataProvider';
import { FilterOperator, SearchCriteria, FilterCondition } from './types';
import { Logger } from './Logger';

export class MongoDBProvider extends DataProvider {
  private static db?: Db;
  private collection: Collection;

  constructor(dataSource: string) {
    super(dataSource);
    if (MongoDBProvider.db) {
      this.collection = MongoDBProvider.db.collection(this.dataSource);
      this.setupChangeStream();
    } else {
      throw new Error('MongoDB data base not unset');
    }
  }

  static async mongoDBConnect(): Promise<Db> {
    try {
      // todo: move url and name to config
      const client = await MongoClient.connect('mongodb://localhost:27017');
      Logger.info('MongoDB connected successfully');
      MongoDBProvider.db = client.db('contract_consent_agent_db');
      return MongoDBProvider.db;
    } catch (error) {
      Logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
      throw error;
    }
  }

  private setupChangeStream(): void {
    const changeStream = this.collection.watch();
    changeStream.on('change', (change: ChangeStreamDocument) => {
      switch (change.operationType) {
        case 'insert':
          this.notifyDataChange('dataInserted', {
            fullDocument: change.fullDocument,
            source: this.dataSource,
          });
          break;
        case 'update':
          this.notifyDataChange('dataUpdated', {
            documentKey: change.documentKey,
            updateDescription: change.updateDescription,
            source: this.dataSource,
          });
          break;
        case 'delete':
          this.notifyDataChange('dataDeleted', {
            documentKey: change.documentKey,
            source: this.dataSource,
          });
          break;
        default:
          throw new Error(`Unhandled change type: ${change.operationType}`);
      }
    });
  }

  protected makeQuery(conditions: FilterCondition[]): Record<string, any> {
    return conditions.reduce((query, condition) => {
      switch (condition.operator) {
        case FilterOperator.IN:
          return {
            ...query,
            [condition.field]: { $in: condition.value },
          };
        case FilterOperator.EQUALS:
          return {
            ...query,
            [condition.field]: condition.value,
          };
        case FilterOperator.GT:
          return {
            ...query,
            [condition.field]: { $gt: condition.value },
          };
        case FilterOperator.LT:
          return {
            ...query,
            [condition.field]: { $lt: condition.value },
          };
        case FilterOperator.CONTAINS:
          return {
            ...query,
            [condition.field]: {
              $in: Array.isArray(condition.value)
                ? condition.value
                : [condition.value],
            },
          };
        case FilterOperator.REGEX:
          return {
            ...query,
            [condition.field]: {
              $in: Array.isArray(condition.value)
                ? condition.value.map((val) => new RegExp(val, 'i'))
                : [new RegExp(condition.value, 'i')],
            },
          };
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    }, {});
  }

  async create(data: Document): Promise<WithId<Document>> {
    try {
      const result: InsertOneResult<Document> =
        await this.collection.insertOne(data);
      if (!result.acknowledged) {
        throw new Error('Document insertion was not acknowledged');
      }
      return { ...data, _id: result.insertedId };
    } catch (error) {
      Logger.info(
        `Error during document insertion: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async find(criteria: SearchCriteria): Promise<[]> {
    const query = this.makeQuery(criteria.conditions);
    return (await this.collection
      .find(query, { projection: {} })
      .limit(criteria.limit || 0)
      .toArray()) as [];
  }
}
*/

import {
  Collection,
  Db,
  Document,
  WithId,
  InsertOneResult,
  MongoClient,
} from 'mongodb';
import { DataProvider } from './DataProvider';
import { FilterOperator, SearchCriteria, FilterCondition } from './types';
import { Logger } from './Logger';

type DocumentChangeHandler = (collectionName: string, document: any) => void;

class MongoInterceptor {
  private static instance: MongoInterceptor;
  private callbacks: Map<string, DocumentChangeHandler[]>;

  private constructor() {
    this.callbacks = new Map();
    ['insert', 'update', 'delete'].forEach((op) => {
      this.callbacks.set(op, []);
    });
  }

  static getInstance(): MongoInterceptor {
    if (!MongoInterceptor.instance) {
      MongoInterceptor.instance = new MongoInterceptor();
    }
    return MongoInterceptor.instance;
  }

  public addCallback(
    changeType: string,
    callback: DocumentChangeHandler,
  ): void {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.push(callback);
    this.callbacks.set(changeType, callbacks);
  }

  public notifyCallbacks(
    changeType: string,
    collectionName: string,
    document: any,
  ): void {
    const callbacks = this.callbacks.get(changeType) || [];
    callbacks.forEach((callback) => callback(collectionName, document));
  }
}

export class MongoDBProvider extends DataProvider {
  private static db?: Db;
  private collection: Collection;

  constructor(dataSource: string) {
    super(dataSource);
    if (MongoDBProvider.db) {
      this.collection = MongoDBProvider.createCollectionProxy(
        MongoDBProvider.db.collection(this.dataSource),
      );
      this.setupCallbacks();
    } else {
      throw new Error('MongoDB database not set');
    }
  }

  private static createCollectionProxy(collection: Collection): Collection {
    const interceptor = MongoInterceptor.getInstance();
    const handler = {
      get(target: Collection, prop: string | symbol): any {
        const original = target[prop as keyof Collection];
        if (typeof original !== 'function') return original;

        return async function (this: any, ...args: any[]) {
          const method = original as (...args: any[]) => Promise<any>;
          const result = await method.apply(target, args);

          if (prop === 'insertOne' || prop === 'insertMany') {
            interceptor.notifyCallbacks(
              'insert',
              collection.collectionName,
              result,
            );
          } else if (prop === 'updateOne' || prop === 'updateMany') {
            interceptor.notifyCallbacks('update', collection.collectionName, {
              filter: args[0],
              update: args[1],
              result,
            });
          } else if (prop === 'deleteOne' || prop === 'deleteMany') {
            interceptor.notifyCallbacks('delete', collection.collectionName, {
              filter: args[0],
              result,
            });
          }

          return result;
        };
      },
    };

    return new Proxy(collection, handler);
  }

  static async mongoDBConnect(): Promise<Db> {
    try {
      const client = await MongoClient.connect('mongodb://localhost:27017');
      Logger.info('MongoDB connected successfully');
      MongoDBProvider.db = client.db('contract_consent_agent_db');
      return MongoDBProvider.db;
    } catch (error) {
      Logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
      throw error;
    }
  }

  private setupCallbacks(): void {
    const interceptor = MongoInterceptor.getInstance();

    interceptor.addCallback('insert', (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange('dataInserted', {
          fullDocument: data.ops?.[0],
          source: this.dataSource,
        });
      }
    });

    interceptor.addCallback('update', (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange('dataUpdated', {
          documentKey: { _id: data.filter._id },
          updateDescription: { updatedFields: data.update.$set || {} },
          source: this.dataSource,
        });
      }
    });

    interceptor.addCallback('delete', (collectionName, data) => {
      if (collectionName === this.dataSource) {
        this.notifyDataChange('dataDeleted', {
          documentKey: { _id: data.filter._id },
          source: this.dataSource,
        });
      }
    });
  }

  protected makeQuery(conditions: FilterCondition[]): Record<string, any> {
    return conditions.reduce((query, condition) => {
      switch (condition.operator) {
        case FilterOperator.IN:
          return {
            ...query,
            [condition.field]: { $in: condition.value },
          };
        case FilterOperator.EQUALS:
          return {
            ...query,
            [condition.field]: condition.value,
          };
        case FilterOperator.GT:
          return {
            ...query,
            [condition.field]: { $gt: condition.value },
          };
        case FilterOperator.LT:
          return {
            ...query,
            [condition.field]: { $lt: condition.value },
          };
        case FilterOperator.CONTAINS:
          return {
            ...query,
            [condition.field]: {
              $in: Array.isArray(condition.value)
                ? condition.value
                : [condition.value],
            },
          };
        case FilterOperator.REGEX:
          return {
            ...query,
            [condition.field]: {
              $in: Array.isArray(condition.value)
                ? condition.value.map((val) => new RegExp(val, 'i'))
                : [new RegExp(condition.value, 'i')],
            },
          };
        default:
          throw new Error(`Unsupported operator: ${condition.operator}`);
      }
    }, {});
  }

  async create(data: Document): Promise<WithId<Document>> {
    try {
      const result: InsertOneResult<Document> =
        await this.collection.insertOne(data);
      if (!result.acknowledged) {
        throw new Error('Document insertion was not acknowledged');
      }
      return { ...data, _id: result.insertedId };
    } catch (error) {
      Logger.info(
        `Error during document insertion: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async find(criteria: SearchCriteria): Promise<[]> {
    const query = this.makeQuery(criteria.conditions);
    return (await this.collection
      .find(query, { projection: {} })
      .limit(criteria.limit || 0)
      .toArray()) as [];
  }
}
