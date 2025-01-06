import { RequestHandler } from './ContractAgentHandler';
import { Request, Response, Router } from 'express';
const router: Router = Router();

/**
 * Handles the request to get policies recommendations for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/policies-recommendations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get services recommendations for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/services-recommendations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get policies matching for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get services matching for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/services-matching',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get service recommendations for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/service-recommendations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get policies matching for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/policies-matching',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get contract matching for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/contract-matching',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to get configurations for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
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

/**
 * Handles the request to add configurations to a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.post('/profile/configurations', async (req: Request, res: Response) => {
  /*    #swagger.tags = ['Contract']
          #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/ContractProfilePostPayload"
                    }  
                }
            }
        } 
    */
  const requestHandler = await RequestHandler.retrieveService();
  try {
    const { profileURI, configurations } = req.body;
    const result = await requestHandler.addConfigurationsToProfile(
      profileURI,
      configurations,
    );
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Handles the request to update configurations for a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.put(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    /*    #swagger.tags = ['Contract']
          #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/ContractProfilePutPayload"
                    }  
                }
            }
        } 
    */
    const requestHandler = await RequestHandler.retrieveService();
    try {
      const { configurations } = req.body;
      const result = await requestHandler.updateConfigurationsForProfile(
        req.params.id,
        configurations,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Handles the request to remove configurations from a profile.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.delete(
  '/profile/:id/configurations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Contract']
    const requestHandler = await RequestHandler.retrieveService();
    try {
      const result = await requestHandler.removeConfigurationsFromProfile(
        req.params.id,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export default router;
