import express, { Request, Response } from 'express';
import { ConsentAgentRequestHandler } from './ConsentAgentHandler';
import { ProfileConfigurations } from './types';
const router = express.Router();

const consentAgentRequestHandler = new ConsentAgentRequestHandler();

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId/recommendations/consent',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;

      const services =
            await consentAgentRequestHandler.getConsentRecommendationFromProfile(
              profileId,
            );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId/recommendations/dataexchanges',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;

      const service =
            await consentAgentRequestHandler.getDataExchangeRecommendationFromProfile(
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
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId/preferences',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;

      const service =
            await consentAgentRequestHandler.getPreferencesFromProfile(
              profileId,
            );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get the preference by ID of a profile
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    try {
      const { profileId, preferenceId } = req.params;

      const service =
            await consentAgentRequestHandler.getPreferenceByIdFromProfile(
              profileId,
              preferenceId
            );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post(
  '/:profileId/preferences',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      const { preference } = req.body;

      const service =
            await consentAgentRequestHandler.addPreferenceToProfile(
              profileId,
              preference,
            );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * @param {Request} req
 * @param {Response} res
 */
router.put(
  '/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    try {
      const { profileId, preferenceId } = req.params;
      const { preference } = req.body;

      const service =
            await consentAgentRequestHandler.updatePreferenceByIdFromProfile(
              profileId,
              preferenceId,
              preference,
            );
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * @param {Request} req
 * @param {Response} res
 */
router.delete(
  '/:profileId/preferences/:preferenceId',
  async (req: Request, res: Response) => {
    try {
      const { profileId, preferenceId } = req.params;

      const service =
            await consentAgentRequestHandler.deletePreferenceByIdFromProfile(
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
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId/configurations',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
        
      const service =
            await consentAgentRequestHandler.getConfigurationsFromProfile(
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
 * @param {Request} req
 * @param {Response} res
 */
router.put(
  '/:profileId/configurations',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      const configurations: ProfileConfigurations = req.body.configurations;
        
      const services =
        await consentAgentRequestHandler.updateProfile(
          profileId,
          {
            uri: profileId,
            configurations
          }
        );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

/**
 * Get a profile
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/:profileId',
  async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      const services =
            await consentAgentRequestHandler.getProfileByURL(
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
 * @param {Request} req
 * @param {Response} res
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const services =
            await consentAgentRequestHandler.getProfiles();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);
  
export default router;
  