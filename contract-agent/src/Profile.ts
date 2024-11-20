import {
  ProfileConfigurations,
  ProfileMatching,
  ProfileRecommendation,
} from './types';

export type ProfileJSON = Omit<
  Pick<Profile, keyof Profile>,
  'createdAt' | 'updatedAt'
> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export class Profile {
  _id?: string;
  url: string;
  configurations: ProfileConfigurations;
  recommendations: ProfileRecommendation[];
  matching: ProfileMatching[];

  constructor({ url, configurations, recommendations, matching }: ProfileJSON) {
    this.url = url;
    this.configurations = configurations;
    this.recommendations = recommendations;
    this.matching = matching;
  }
}
