export interface ProfilePolicy {
  policy: string;
  frequency: number;
}

export interface ProfileRecommendation {
  policies: ProfilePolicy[];
  ecosystemContracts: unknown[];
}

export interface ProfileMatching {
  policies: ProfilePolicy[];
  ecosystemContracts: unknown[];
}

export interface ProfileConfigurations {
  allowRecommendation: boolean;
  allowPolicies: boolean;
}

export interface SearchCriteria {
  conditions: FilterCondition[];
  threshold: number;
  limit?: number;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  IN = 'IN',
  EQUALS = 'EQUALS',
  GT = 'GT',
  LT = 'LT',
  CONTAINS = 'CONTAINS',
  REGEX = 'REGEX',
}
