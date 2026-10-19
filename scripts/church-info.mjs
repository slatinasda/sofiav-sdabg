import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const churchInfoPath = path.resolve(__dirname, '../src/app/shared/church-info.json');

export const CHURCH_INFO = JSON.parse(fs.readFileSync(churchInfoPath, 'utf8'));

export const CHURCH_NAME = CHURCH_INFO.name;
export const CHURCH_SHORT_NAME = CHURCH_INFO.shortName;
export const CHURCH_FAMILY_NAME = CHURCH_INFO.familyName;
export const CHURCH_PLACE_NAME = CHURCH_INFO.placeName;
export const CHURCH_ABBREVIATION = CHURCH_INFO.abbreviation;
export const CHURCH_DESCRIPTION = CHURCH_INFO.description;
export const CHURCH_CITY = CHURCH_INFO.city;
export const CHURCH_DISTRICT = CHURCH_INFO.district;
