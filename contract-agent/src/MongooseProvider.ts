import mongoose, { Document, Model, Schema, Connection } from 'mongoose';
import { DataProvider } from './DataProvider';
import {
  FilterOperator,
  SearchCriteria,
  FilterCondition,
  DataProviderConfig,
} from './types';
import { Logger } from './Logger';

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
  private static connections: Map<string, Connection | undefined> = new Map();
  private static externalModels: Map<string, Model<Document> | Schema> =
    new Map();
  private connection?: Connection;
  private model!: Model<any>;
  private dbName: string;
  private connectionPromise?: Promise<Connection>;

  constructor(config: DataProviderConfig) {
    super(config.source);
    this.dbName = config.dbName;
    this.connectionPromise = this.connectToDatabase(config.url);
  }

  static setCollectionModel(
    source: string,
    model: Model<Document> | Schema,
  ): void {
    MongooseProvider.externalModels.set(source, model);
    Logger.info(`External model set for collection: ${source}`);
  }

  static getCollectionModel(
    source: string,
  ): Model<Document> | Schema | undefined {
    return MongooseProvider.externalModels.get(source);
  }

  private async connectToDatabase(url: string): Promise<Connection> {
    if (!url) {
      throw new Error('Database URL is required');
    }
    const connectionKey = `${url}:${this.dbName}`;
    const existingConnection = MongooseProvider.connections.get(connectionKey);
    if (existingConnection) {
      Logger.info('Reusing existing Mongoose connection');
      this.connection = existingConnection;
      return this.connection;
    }

    try {
      const connection = await mongoose
        .createConnection(url, {
          dbName: this.dbName,
        })
        .asPromise();

      Logger.info('Mongoose connected successfully');
      this.connection = connection;

      MongooseProvider.connections.set(connectionKey, connection);
      return connection;
    } catch (error) {
      Logger.error(`Error connecting to Mongoose: ${(error as Error).message}`);
      throw error;
    }
  }

  public static async disconnectFromDatabase(
    url: string,
    dbName: string,
  ): Promise<void> {
    const connectionKey = `${url}:${dbName}`;
    const existingConnection = MongooseProvider.connections.get(connectionKey);

    if (existingConnection) {
      try {
        await existingConnection.close();
        MongooseProvider.connections.set(connectionKey, undefined);
        Logger.info(`Mongoose connection for ${connectionKey} closed`);
      } catch (error) {
        Logger.error(`Error during disconnect: ${(error as Error).message}`);
      }
    } else {
      Logger.warn(`No active connection found for ${connectionKey}`);
    }
  }

  async ensureReady(): Promise<void> {
    await this.connectionPromise;
    const externalModel = MongooseProvider.getCollectionModel(this.dataSource);

    if (externalModel && 'aggregate' in externalModel) {
      this.model = externalModel as Model<Document>;
    } else {
      this.model = this.connection!.model(
        this.dataSource,
        (externalModel as Schema) || new Schema({}, { strict: false }),
      );
    }
    this.setupHooks();
  }

  private setupHooks(): void {
    this.model.schema.post('save', (doc: Document) => {
      this.notifyDataChange('dataInserted', {
        source: this.dataSource,
        fullDocument: doc,
      });
    });

    this.model.schema.post('updateOne', (doc: Document) => {
      this.notifyDataChange('dataUpdated', {
        source: this.dataSource,
        updateDescription: {
          updatedFields: doc,
        },
      });
    });

    this.model.schema.post('deleteOne', (doc: Document) => {
      this.notifyDataChange('dataDeleted', {
        source: this.dataSource,
        documentKey: { _id: doc._id },
      });
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

  async create(data: Document): Promise<Document> {
    try {
      const result = await this.model.create(data);
      return result;
    } catch (error) {
      Logger.info(
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
