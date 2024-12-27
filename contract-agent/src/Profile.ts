import mongoose, { Schema, Document } from 'mongoose';
import {
  ProfileConfigurations,
  ProfileRecommendation,
  ProfilePreference,
  ProfileMatching,
  ConsentProfileRecommendation,
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
  recommendations: ProfileRecommendation[] | ConsentProfileRecommendation;
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

export const ProfileSchema = new Schema(
  {
    uri: { type: String, required: true },
    configurations: { type: Schema.Types.Mixed, required: true },
    recommendations: { type: [Schema.Types.Mixed], default: [] },
    matching: { type: [Schema.Types.Mixed], default: [] },
    preference: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  },
);

export const ProfileModel = mongoose.model<Document & Profile>(
  'Profile',
  ProfileSchema,
);
