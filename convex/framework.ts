import { query } from "./_generated/server";

// Read-only accessors for the Framework Reference Layer. Every table here
// is seeded content (see seedFramework.ts) -- there are no mutations in
// this file on purpose. Components and future scoring code should read
// the taxonomy through these queries rather than hardcoding pillar/
// category/axis names, colors, or ordering.

export const getCurrentFrameworkVersion = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("frameworkVersions")
      .withIndex("by_isCurrent", (q) => q.eq("isCurrent", true))
      .unique();
  }
});

export const getPillars = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("pillars").withIndex("by_order").collect();
  }
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("categories").collect();
  }
});

export const getConstructs = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("constructs").collect();
  }
});

export const getGmmbbAxes = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("gmmbbAxes").withIndex("by_order").collect();
  }
});

export const getModifyingFactors = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("modifyingFactors").collect();
  }
});

export const getPopulationOverlays = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("populationOverlays").collect();
  }
});

export const getConvergencePatterns = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("convergencePatterns").collect();
  }
});

export const getCrossCuttingNodes = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("crossCuttingNodes").collect();
  }
});

// MM Health Score tiers -- consumer-facing, higher-is-better, 0-100.
export const getRiskTiers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("riskTiers").withIndex("by_order").collect();
  }
});

// Generic clinical risk bands -- higher-is-worse, percent-of-max-score.
// Never render these under the same label/UI as getRiskTiers results.
export const getClinicalRiskBands = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("clinicalRiskBands").withIndex("by_order").collect();
  }
});

/**
 * Single combined fetch for dashboard/scoring-engine use, so callers don't
 * have to issue ten separate queries just to render one radar + pentagon.
 */
export const getFullTaxonomy = query({
  args: {},
  handler: async (ctx) => {
    const [
      frameworkVersion,
      pillars,
      categories,
      constructs,
      gmmbbAxes,
      modifyingFactors,
      populationOverlays,
      convergencePatterns,
      crossCuttingNodes,
      riskTiers,
      clinicalRiskBands
    ] = await Promise.all([
      ctx.db
        .query("frameworkVersions")
        .withIndex("by_isCurrent", (q) => q.eq("isCurrent", true))
        .unique(),
      ctx.db.query("pillars").withIndex("by_order").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("constructs").collect(),
      ctx.db.query("gmmbbAxes").withIndex("by_order").collect(),
      ctx.db.query("modifyingFactors").collect(),
      ctx.db.query("populationOverlays").collect(),
      ctx.db.query("convergencePatterns").collect(),
      ctx.db.query("crossCuttingNodes").collect(),
      ctx.db.query("riskTiers").withIndex("by_order").collect(),
      ctx.db.query("clinicalRiskBands").withIndex("by_order").collect()
    ]);

    return {
      frameworkVersion,
      pillars,
      categories,
      constructs,
      gmmbbAxes,
      modifyingFactors,
      populationOverlays,
      convergencePatterns,
      crossCuttingNodes,
      riskTiers,
      clinicalRiskBands
    };
  }
});
