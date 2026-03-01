interface TutorProfile {
  headline?: string;
  bio?: string;
  hourlyRate: number;
  language?: Language;
  currency?: Currency;
  experienceYears?: number;
}

export enum Language {
  ENGLISH,
  SPANISH,
  BANGLA,
  HINDI,
  ARABIC,
}
export enum Currency {
  USD,
  EUR,
  BDT,
  INR,
}

export type { TutorProfile };
