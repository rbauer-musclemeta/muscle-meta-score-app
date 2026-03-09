export type SurveyKind = "screening" | "assessment";

export interface SurveyOption {
  id: string;
  label: string;
  score?: number;
}

export interface SurveyQuestion {
  id: string;
  order: number;
  kind: "single_select";
  required: boolean;
  prompt: string;
  scored: boolean;
  categoryId?: string;
  scoreRange?: [number, number];
  options: SurveyOption[];
}

export interface CategoryDef {
  id: string;
  label: string;
  pillar: string;
}

export interface PillarDef {
  id: string;
  label: string;
  categoryIds: string[];
  min: number;
  max: number;
}

export interface SurveyDefinition {
  id: string;
  type: SurveyKind;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  categories?: CategoryDef[];
  pillars?: PillarDef[];
  responseScale?: Record<string, string>;
}

export interface SurveyPackage {
  version: string;
  project: string;
  surveys: SurveyDefinition[];
}