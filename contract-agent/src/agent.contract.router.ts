import { RequestHandler } from 'ContractAgentHandler';
import express, { Request, Response, Router } from 'express';
const router: Router = express.Router();

const requestHandler = new RequestHandler();

router.get(
  '/profile/:id/policies-recommendations',
  async (req: Request, res: Response) => {
    try {
      const policies =
        await requestHandler.getPoliciesRecommendationFromProfile(
          req.params.id,
        );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/services-recommendations',
  async (req: Request, res: Response) => {
    try {
      const services =
        await requestHandler.getServicesRecommendationFromProfile(
          req.params.id,
        );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    try {
      const policies = await requestHandler.getPoliciesMatchingFromProfile(
        req.params.id,
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/services-matching',
  async (req: Request, res: Response) => {
    try {
      const services = await requestHandler.getServicesMatchingFromProfile(
        req.params.id,
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/service-recommendations',
  async (req: Request, res: Response) => {
    try {
      const services =
        await requestHandler.getServicesRecommendationFromProfile(
          req.params.id,
        );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    try {
      const policies = await requestHandler.getPoliciesMatchingFromProfile(
        req.params.id,
      );
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/contract-matching',
  async (req: Request, res: Response) => {
    try {
      const contracts = await requestHandler.getContractMatchingFromProfile(
        req.params.id,
      );
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.get(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    try {
      const configurations = await requestHandler.getConfigurationsFromProfile(
        req.params.id,
      );
      res.json(configurations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.post('/profile/configurations', async (req: Request, res: Response) => {
  try {
    const { profileId, configurations } = req.body;
    const result = await requestHandler.addConfigurationsToProfile(
      profileId,
      configurations,
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    try {
      const { configurations } = req.body;
      const result = await requestHandler.updateConfigurationsForProfile(
        req.params.id,
        configurations,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

router.delete(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    try {
      const result = await requestHandler.removeConfigurationsFromProfile(
        req.params.id,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export default router;
