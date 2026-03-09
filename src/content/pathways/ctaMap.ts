import ctaMapJson from "../../../config/pathway-cta-map.json";
import type { CtaPayload } from "@/types/results";

interface CtaMapShape {
  version: string;
  ctas: Record<string, CtaPayload>;
  rules: {
    primaryPriorityOrder: string[];
    functionalFallbackByLowestPillar: Record<string, string>;
  };
}

export const ctaMap = ctaMapJson as CtaMapShape;
