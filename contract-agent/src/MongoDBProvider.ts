import { Collection, Db } from 'mongodb';
import { DataProvider } from './DataProvider';
import { FilterOperator, SearchCriteria, FilterCondition } from './types';
import { Profile } from 'Profile';

export class MongoDBProvider implements DataProvider {
  private collection: Collection;

  constructor(db: Db, collectionName: string = 'profiles') {
    this.collection = db.collection(collectionName);
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
