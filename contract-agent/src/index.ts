export { default as NegotiationAgentRouter } from './agent.contract.negotation.router';
export { default as ContractAgentRouter } from './agent.contract.profile.router';
// export { default as ConsentAgentRouter } from './agent.consent.router';
import express from 'express';

import  router  from './agent.contract.profile.router';

export const routes = express.Router();

routes.use('/api/doc', router);


export type {
  ProfilePolicy,
  ProfilePreference,
  ProfileRecommendation,
  ProfileMatching,
  ProfileConfigurations,
  SearchCriteria,
  FilterCondition,
  Provider,
  DataProviderConfig,
  ProfileDocument,
} from './types';

export { Profile } from './Profile';
export { Agent } from './Agent';
export { Logger } from './Logger';
export { ContractAgent } from './ContractAgent';
export { MongoDBProvider } from './MongoDBProvider';
