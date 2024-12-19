import {
  ProfileConfigurations,
  ProfileRecommendation,
  ProfilePreference,
  ProfileMatching,
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
  uri?: string;
  configurations: ProfileConfigurations;
  recommendations: ProfileRecommendation[];
  matching: ProfileMatching[];
  preference: ProfilePreference[];

  constructor({
    _id,
    uri,
    configurations,
    recommendations,
    matching = [],
    preference = [],
  }: ProfileJSON) {
    this._id = _id;
    this.uri = uri;
    this.configurations = configurations;
    this.recommendations = recommendations;
    this.matching = matching;
    this.preference = preference;
  }
}
