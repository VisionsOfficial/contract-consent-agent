import { ContractAgent } from './ContractAgent';
import { Profile } from './Profile';
import { SearchCriteria, FilterCondition, FilterOperator } from './types';

// Orchestrator Request Handler
export class OrchestratorRequestHandler {
  private contractAgent: ContractAgent;

  constructor() {
    this.contractAgent = ContractAgent.retrieveService();
  }

  // Return only the policies from recommendations
  async getPoliciesRecommendationFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].recommendations.map((rec) => rec.policies);
  }

  // Return only the services from recommendations
  async getServicesRecommendationFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].recommendations.map((rec) => rec.services);
  }

  // Return only the policies from matching
  async getPoliciesMatchingFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].matching.map((match) => match.policies);
  }

  // Return only the services from matching
  async getServicesMatchingFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].matching.map((match) => match.services);
  }
}

// Participant Request Handler
export class ParticipantRequestHandler {
  private contractAgent: ContractAgent;

  constructor() {
    this.contractAgent = ContractAgent.retrieveService();
  }

  // Return only the services from recommendations
  async getServiceRecommendationFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].recommendations.map((rec) => rec.services);
  }

  // Return only the policies from matching
  async getPoliciesMatchingFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].matching.map((match) => match.policies);
  }

  // Return only the ecosystemContracts from matching
  async getContractMatchingFromProfile(profileId: string): Promise<any> {
    const criteria: SearchCriteria = {
      conditions: [
        {
          field: 'url',
          operator: FilterOperator.EQUALS,
          value: profileId,
        },
      ],
      threshold: 0,
    };

    const profiles = await this.contractAgent.findProfiles('Profile', criteria);
    if (profiles.length === 0) throw new Error('Profile not found');

    return profiles[0].matching.map((match) => match.ecosystemContracts);
  }
}

// Contract Controller (API Layer)
import express, { Request, Response } from 'express';
const router = express.Router();

const orchestratorHandler = new OrchestratorRequestHandler();
const participantHandler = new ParticipantRequestHandler();

router.get(
  '/orchestrator/profile/:id/policies-recommendations',
  async (req: Request, res: Response) => {
    try {
      const policies =
        await orchestratorHandler.getPoliciesRecommendationFromProfile(
          req.params.id,
        );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/orchestrator/profile/:id/services-recommendations',
  async (req: Request, res: Response) => {
    try {
      const services =
        await orchestratorHandler.getServicesRecommendationFromProfile(
          req.params.id,
        );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/orchestrator/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    try {
      const policies = await orchestratorHandler.getPoliciesMatchingFromProfile(
        req.params.id,
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/orchestrator/profile/:id/services-matching',
  async (req: Request, res: Response) => {
    try {
      const services = await orchestratorHandler.getServicesMatchingFromProfile(
        req.params.id,
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/participant/profile/:id/service-recommendations',
  async (req: Request, res: Response) => {
    try {
      const services =
        await participantHandler.getServiceRecommendationFromProfile(
          req.params.id,
        );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/participant/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    try {
      const policies = await participantHandler.getPoliciesMatchingFromProfile(
        req.params.id,
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/participant/profile/:id/contract-matching',
  async (req: Request, res: Response) => {
    try {
      const contracts = await participantHandler.getContractMatchingFromProfile(
        req.params.id,
      );
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export default router;
