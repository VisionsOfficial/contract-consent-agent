import {
  ProfileConfigurations,
  ProfileMatching,
  ProfileRecommendation,
} from './types';

export class Profile {
  url: string;
  configurations: ProfileConfigurations;
  recommendations: ProfileRecommendation[];
  matching: ProfileMatching[];

  constructor(
    url: string,
    configurations: ProfileConfigurations,
    recommendations: ProfileRecommendation[],
    matching: ProfileMatching[],
  ) {
    this.url = url;
    this.configurations = configurations;
    this.recommendations = recommendations;
    this.matching = matching;
  }
}
