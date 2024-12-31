import express, { Request, Response, Router } from 'express';
import { NegotiationService } from './NegotiationService';
import { Profile } from './Profile';
import { Policy, ServiceOffering, Contract } from './Contract';
import { ContractAgent } from './ContractAgent';
import { Logger } from './Logger';
import { SearchCriteria, FilterOperator } from './types';
import { Agent } from './Agent';

const router: Router = express.Router();
const negotiationService = NegotiationService.retrieveService();

async function fetchProfileById(profileId: string): Promise<Profile> {
  const criteria: SearchCriteria = {
    conditions: [
      {
        field: 'uri',
        operator: FilterOperator.EQUALS,
        value: profileId,
      },
    ],
    threshold: 0,
  };
  const contractAgent = await ContractAgent.retrieveService();
  const profilesHost = Agent.getProfileHost();
  if (!profilesHost) {
    throw new Error('Fetch Profile by Id: profiles host not set');
  }
  const profiles = await contractAgent.findProfiles(profilesHost, criteria);
  if (profiles.length === 0) {
    throw new Error(`Profile not found for ID: ${profileId}`);
  }
  return new Profile(profiles[0]);
}

router.post(
  '/negotiation/contract/acceptance',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Negotiation']
    try {
      const { profileId, contractData } = req.body;
      const profile = await fetchProfileById(profileId);
      const contract = new Contract(contractData);
      const canAccept = negotiationService.canAcceptContract(profile, contract);
      res.json({ canAccept });
    } catch (error) {
      Logger.error(`Error in contract acceptance check: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.post(
  '/negotiation/policy/acceptance',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Negotiation']
    try {
      const { profileId, policyData } = req.body;
      const profile = await fetchProfileById(profileId);
      const policy: Policy = policyData;
      const isAcceptable = negotiationService.isPolicyAcceptable(
        profile,
        policy,
      );
      res.json({ isAcceptable });
    } catch (error) {
      Logger.error(`Error in policy acceptance check: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.post(
  '/negotiation/service/acceptance',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Negotiation']
    try {
      const { profileId, serviceData } = req.body;
      const profile = await fetchProfileById(profileId);
      const serviceOffering: ServiceOffering = serviceData;
      const isAcceptable = negotiationService.isServiceAcceptable(
        profile,
        serviceOffering,
      );
      res.json({ isAcceptable });
    } catch (error) {
      Logger.error(`Error in service acceptance check: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.post(
  '/negotiation/contract/negotiate',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Negotiation']
    try {
      const { profileId, contractData } = req.body;
      const profile = await fetchProfileById(profileId);
      const contract = new Contract(contractData);
      const negotiationResult = negotiationService.negotiateContract(
        profile,
        contract,
      );
      res.json(negotiationResult);
    } catch (error) {
      Logger.error(`Error in contract negotiation: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.put(
  '/negotiation/profile/preferences',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Negotiation']
    try {
      const { profileId, preferences } = req.body;
      const profile = await fetchProfileById(profileId);
      negotiationService.updateProfilePreferences(profile, preferences);
      res.json({ message: 'Profile preferences updated successfully.' });
    } catch (error) {
      Logger.error(`Error in updating profile preferences: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export default router;
