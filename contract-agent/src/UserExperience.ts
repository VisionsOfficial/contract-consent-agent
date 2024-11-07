import { Profile } from './Profile';
import { DataProvider } from './DataProvider';
import { SearchCriteria, ProfilePolicy } from './types';

export abstract class UserExperience {
  constructor(protected dataProvider: DataProvider) {}

  protected async findSimilarProfiles(
    sourceEntity: any,
    threshold: number = 0.7,
  ): Promise<Profile[]> {
    const searchCriteria = this.buildSearchCriteria(sourceEntity);
    searchCriteria.threshold = threshold;

    const profiles =
      await this.dataProvider.findSimilarProfiles(searchCriteria);
    return profiles.map((profile) =>
      this.enrichProfileWithRecommendations(profile, sourceEntity),
    );
  }

  private enrichProfileWithRecommendations(
    profile: Profile,
    sourceEntity: any,
  ): Profile {
    const similarityScore = this.calculateSimilarity(sourceEntity, profile);
    const relevantPolicies = this.extractRelevantPolicies(profile);

    return new Profile(
      profile.url,
      profile.configurations,
      [
        {
          policies: relevantPolicies,
          ecosystemContracts: [],
        },
      ],
      [
        {
          policies: [],
          ecosystemContracts: [],
        },
      ],
    );
  }

  protected async calculateRecommendations(
    sourceEntity: any,
    profiles: Profile[],
  ): Promise<Profile[]> {
    return profiles;
  }

  protected abstract buildSearchCriteria(sourceEntity: any): SearchCriteria;

  protected abstract calculateSimilarity(source: any, target: Profile): number;

  protected abstract extractRelevantPolicies(entity: any): ProfilePolicy[];

  abstract process(sourceEntity: any, options?: any): Promise<Profile[]>;
}
