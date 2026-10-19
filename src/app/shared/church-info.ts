import churchInfo from './church-info.json';

export interface ChurchInfo {
  name: string;
  shortName: string;
  familyName: string;
  placeName: string;
  abbreviation: string;
  description: string;
  city: string;
  district: string;
}

export const CHURCH_INFO: ChurchInfo = churchInfo;

export const CHURCH_NAME = CHURCH_INFO.name;
export const CHURCH_SHORT_NAME = CHURCH_INFO.shortName;
export const CHURCH_FAMILY_NAME = CHURCH_INFO.familyName;
export const CHURCH_PLACE_NAME = CHURCH_INFO.placeName;
export const CHURCH_ABBREVIATION = CHURCH_INFO.abbreviation;
export const CHURCH_DESCRIPTION = CHURCH_INFO.description;
export const CHURCH_CITY = CHURCH_INFO.city;
export const CHURCH_DISTRICT = CHURCH_INFO.district;
