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
  services: [];

  constructor(
    url: string,
    configurations: ProfileConfigurations,
    recommendations: ProfileRecommendation[],
    matching: ProfileMatching[],
    services: [],
  ) {
    this.url = url;
    this.configurations = configurations;
    this.recommendations = recommendations;
    this.matching = matching;
    this.services = services;
  }
}
