import { Request, Response } from 'express';
import { ConsentAgentRequestHandler } from './ConsentAgentHandler';
import { PreferencePayload, ProfileConfigurations } from './types';
import { Router } from 'express';

const router: Router = Router();

/**
 * Handles the request to check if the preferences match the params.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.get(
  '/profile/:profileId/preferences/match',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const {
        category,
        participant,
        location,
        asDataProvider,
        asServiceProvider,
      } = req.query;

      const service = await requestHandler.checkPreferenceMatch({
        profileId,
        category: category?.toString(),
        participant: participant?.toString(),
        location: location?.toString(),
        asDataProvider: asDataProvider === 'true',
        asServiceProvider: asServiceProvider === 'true',
      });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * This function handles the request for consent recommendations.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
router.get(
  '/profile/:profileId/recommendations/consent',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;

      const services =
                await requestHandler.getConsentRecommendationFromProfile(profileId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get the data exchanges of a profile
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/:profileId/recommendations/dataexchanges',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;

      const service =
                await requestHandler.getDataExchangeRecommendationFromProfile(
                  profileId,
                );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get the preferences of a profile
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/:profileId/preferences',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;

      const service = await requestHandler.getPreferencesFromProfile(profileId);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get the preference by ID of a profile
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;

      const service =
                await requestHandler.getPreferenceByIdFromProfile(
                  profileId,
                  preferenceId,
                );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Adds a new preference to a profile.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.post(
  '/profile/:profileId/preferences',
  async (req: Request, res: Response) => {
    /*    #swagger.tags = ['Consent']
              #swagger.requestBody = {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/PreferencePayload"
                        }  
                    }
                }
            } 
        */
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const { preference } = req.body;

      if (!preference.every((p: PreferencePayload) => p.participant || p.category)) {
        throw new Error('Each preference must contain at least the field participant or category');
      }

      const service =
                await requestHandler.addPreferenceToProfile(
                  profileId,
                  preference,
                );

      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Handles the update of a specific preference within a profile.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.put(
  '/profile/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;

      const service =
                await requestHandler.updatePreferenceByIdFromProfile(
                  profileId,
                  preferenceId,
                  req.body,
                );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Handles the deletion of a specific preference from a profile.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 */
router.delete(
  '/profile/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId, preferenceId } = req.params;

      const service =
                await requestHandler.deletePreferenceByIdFromProfile(
                  profileId,
                  preferenceId,
                );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get the configurations of the profile
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/:profileId/configurations',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;

      const service =
                await requestHandler.getConfigurationsFromProfile(
                  profileId,
                );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Update the configurations
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back to the client.
 * @param {ProfileConfigurations} req.body.configurations - The configurations to be updated.
 */
router.put(
  '/profile/:profileId/configurations',
  async (req: Request, res: Response) => {
    /*    #swagger.tags = ['Consent']
              #swagger.requestBody = {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ProfileConfigurations"
                        }  
                    }
                }
            } 
        */
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const configurations: ProfileConfigurations = req.body.configurations;

      const services =
                await requestHandler.updateProfile(
                  profileId,
                  {
                    uri: profileId,
                    configurations,
                  },
                );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get a profile
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/:profileId',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const { profileId } = req.params;
      const services =
                await requestHandler.getProfileByURL(
                  profileId,
                );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get all profiles
 *
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/profile/',
  async (req: Request, res: Response) => {
    // #swagger.tags = ['Consent']
    try {
      const requestHandler = await ConsentAgentRequestHandler.retrieveService();
      const services =
                await requestHandler.getProfiles();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export default router;
