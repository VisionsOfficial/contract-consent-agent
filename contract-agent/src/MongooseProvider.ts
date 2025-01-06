import mongoose, { Document, Model, Schema, Connection } from 'mongoose';
import { DataProvider } from './DataProvider';
import {
  FilterOperator,
  SearchCriteria,
  FilterCondition,
  DataProviderConfig,
} from './types';
import { Logger } from './Logger';
import { setTimeout, clearTimeout } from 'timers';
import { ProfileSchema } from './Profile';

type DocumentChangeHandler = (collectionName: string, document: any) => void;

class MongooseInterceptor {
  private static instance: MongooseInterceptor;
  private callbacks: Map<string, DocumentChangeHandler[]>;

  private constructor() {
    this.callbacks = new Map();
    ['insert', 'update', 'delete'].forEach((op) => {
      this.callbacks.set(op, []);
    });
  }

  static getInstance(): MongooseInterceptor {
    if (!MongooseInterceptor.instance) {
      MongooseInterceptor.instance = new MongooseInterceptor();
    }
    return MongooseInterceptor.instance;
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

export class MongooseProvider extends DataProvider {
  findAll(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  findOne(criteria: SearchCriteria): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findOneAndUpdate(criteria: SearchCriteria, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findOneAndPush(criteria: SearchCriteria, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  findOneAndPull(criteria: SearchCriteria, data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  private static connections: Map<string, Connection | undefined> = new Map();
  private static externalModels: Map<string, Schema> = new Map();
  private static instances: Map<string, MongooseProvider> = new Map();
  private connection?: Connection;
  private model!: Model<any>;
  private dbName: string;
  private connectionPromise?: Promise<void>;
  private url: string;

  private mongoosePromise: Promise<void>;
  private mongoosePromiseResolve: (() => void) | null = null;

  constructor(config: DataProviderConfig) {
    super(config.source);
    this.dbName = config.dbName;
    this.url = config.url;
    this.mongoosePromise = new Promise((resolve) => {
      this.mongoosePromiseResolve = resolve;
    });
    MongooseProvider.instances.set(config.source, this);
  }

  static setCollectionModel<T extends Document>(
    source: string,
    schema: Schema,
  ): void {
    schema.post('save', (doc: Document) => {
      const provider = MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange('dataInserted', {
          source,
          fullDocument: doc,
        });
      }
    });

    schema.post('insertMany', (docs: Document[]) => {
      const provider = MongooseProvider.instances.get(source);
      if (provider) {
        docs.forEach((doc) => {
          provider.notifyDataChange('dataInserted', {
            source,
            fullDocument: doc,
          });
        });
      }
    });

    schema.post(['updateOne', 'findOneAndUpdate'], (doc: Document) => {
      const provider = MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange('dataUpdated', {
          source,
          updateDescription: {
            updatedFields: doc,
          },
        });
      }
    });

    schema.post(['deleteOne', 'findOneAndDelete'], (doc: Document) => {
      const provider = MongooseProvider.instances.get(source);
      if (provider) {
        provider.notifyDataChange('dataDeleted', {
          source,
          documentKey: { _id: doc._id },
        });
      }
    });

    MongooseProvider.externalModels.set(source, schema);
    Logger.info(`External schema set for collection: ${source}`);
  }

  static getCollectionSchema(source: string): Schema | undefined {
    return MongooseProvider.externalModels.get(source);
  }

  public getMongoosePromise(): Promise<void> {
    return this.mongoosePromise;
  }

  async ensureReady(): Promise<void> {
    if (mongoose.connection.readyState !== 1) {
      Logger.info('Connecting to Mongoose...');
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(this.url + '/' + this.dbName, {
            retryWrites: true,
            serverSelectionTimeoutMS: 5000,
            family: 4,
          });
          if (this.mongoosePromiseResolve) {
            this.mongoosePromiseResolve();
          } else {
            throw new Error('Mongoose promise undefined');
          }
        }
        mongoose.connection.on('disconnected', () => {
          Logger.warn('Mongoose disconnected');
        });
      } catch (error) {
        Logger.error(
          `Error during Mongoose connection: ${(error as Error).message}`,
        );
        throw error;
      }
    }

    const schema = MongooseProvider.getCollectionSchema(this.dataSource);
    if (schema) {
      try {
        this.model = mongoose.model(this.dataSource);
      } catch {
        this.model = mongoose.model(this.dataSource, schema);
      }
    } else {
      this.model = mongoose.model(this.dataSource, ProfileSchema);
    }
  }

  setupHooks(): void {
    this.model.schema.post('save', (doc: Document) => {
      this.notifyDataChange('dataInserted', {
        source: this.dataSource,
        fullDocument: doc,
      });
    });

    this.model.schema.post('insertMany', (docs: Document[]) => {
      docs.forEach((doc) => {
        this.notifyDataChange('dataInserted', {
          source: this.dataSource,
          fullDocument: doc,
        });
      });
    });

    this.model.schema.post(
      ['updateOne', 'findOneAndUpdate'],
      (doc: Document) => {
        this.notifyDataChange('dataUpdated', {
          source: this.dataSource,
          updateDescription: {
            updatedFields: doc,
          },
        });
      },
    );

    this.model.schema.post(
      ['deleteOne', 'findOneAndDelete'],
      (doc: Document) => {
        this.notifyDataChange('dataDeleted', {
          source: this.dataSource,
          documentKey: { _id: doc._id },
        });
      },
    );
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

  async create(data: Document): Promise<Document> {
    try {
      /*
      if (!this.model || !this.connection?.readyState) {
        await this.ensureReady();
      }
      */
      return await this.model.create(data);
    } catch (error) {
      Logger.error(
        `Error during document insertion: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.deleteOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (result.deletedCount === 0) {
        Logger.warn(`No document found with id: ${id}`);
        return false;
      }

      Logger.info(`Document with id: ${id} successfully deleted`);
      return true;
    } catch (error) {
      Logger.error(
        `Error during document deletion: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async find(criteria: SearchCriteria): Promise<[]> {
    const query = this.makeQuery(criteria.conditions);
    const data = await this.model
      .find(query)
      .limit(criteria.limit || 0)
      .exec();
    return data.map((item) => {
      if (item._id) {
        const { _id, ...rest } = item.toObject();
        return {
          _id: (_id as mongoose.Types.ObjectId).toString(),
          ...rest,
        };
      }
      return item.toObject();
    }) as [];
  }

  async update(criteria: SearchCriteria, data: unknown): Promise<boolean> {
    try {
      const updateData = data as Record<string, any>;
      const query = this.makeQuery(criteria.conditions);
      const result = await this.model
        .updateOne(query, {
          $set: updateData,
        })
        .exec();
      if (result.matchedCount === 0) {
        Logger.warn(`No document found matching the criteria`);
        return false;
      }
      if (result.modifiedCount === 0) {
        Logger.info(`No changes made to document`);
        return false;
      }
      Logger.info(`Document successfully updated`);
      return true;
    } catch (error) {
      Logger.error(`Error during document update: ${(error as Error).message}`);
      throw error;
    }
  }
}
