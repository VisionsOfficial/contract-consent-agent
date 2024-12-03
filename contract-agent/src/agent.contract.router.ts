import {
  OrchestratorRequestHandler,
  ParticipantRequestHandler,
} from 'ContractAgentHandler';
import express, { Request, Response, Router } from 'express';
const router: Router = express.Router();

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
