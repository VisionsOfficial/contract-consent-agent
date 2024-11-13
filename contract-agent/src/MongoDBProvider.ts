import { Collection, Db, ChangeStreamDocument } from 'mongodb';
import { DataProvider } from './DataProvider';
import { FilterOperator, SearchCriteria, FilterCondition } from './types';
import { Profile } from './Profile';

export class MongoDBProvider extends DataProvider {
  private collection: Collection;

  constructor(db: Db, dataSource: string) {
    super(dataSource);
    this.collection = db.collection(this.dataSource);
    this.setupChangeStream();
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

  private convertConditionToMongoQuery(
    conditions: FilterCondition[],
  ): Record<string, any> {
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

  async findSimilarProfiles(criteria: SearchCriteria): Promise<Profile[]> {
    const query = this.convertConditionToMongoQuery(criteria.conditions);
    const results = await this.collection
      .find(query)
      .limit(criteria.limit || 100)
      .toArray();
    return results.map(
      (result) =>
        new Profile(
          result.url,
          result.configurations,
          result.recommendations || [],
          result.matching || [],
        ),
    );
  }
}
