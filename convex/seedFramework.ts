import frameworkTaxonomy from "../config/framework-taxonomy.json";
import { mutation } from "./_generated/server";

// Shape of config/framework-taxonomy.json. Kept loose (not the Convex
// validators) because this file is authored/reviewed as plain JSON, not
// as Convex documents -- the mutation below is what maps it onto the
// schema in convex/schema.ts and is the single place that mapping lives.
const taxonomy = frameworkTaxonomy as {
  frameworkVersion: {
    versionTag: string;
    alignedDate?: string;
    sourceAuthority: string;
    notes?: string;
  };
  pillars: Array<Record<string, unknown>>;
  categories: Array<Record<string, unknown>>;
  constructs: Array<Record<string, unknown>>;
  gmmbbAxes: Array<Record<string, unknown>>;
  modifyingFactors: Array<Record<string, unknown>>;
  populationOverlays: Array<Record<string, unknown>>;
  convergencePatterns: Array<Record<string, unknown>>;
  crossCuttingNodes: Array<Record<string, unknown>>;
  riskTiers: Array<Record<string, unknown>>;
  clinicalRiskBands: Array<Record<string, unknown>>;
};

/**
 * Seeds (or re-syncs) the Framework Reference Layer -- pillars, categories,
 * constructs, GMMBB axes, modifying factors, population overlays,
 * convergence patterns, cross-cutting nodes, MM Health Score tiers, and
 * clinical risk bands -- from config/framework-taxonomy.json.
 *
 * Idempotent: re-running after editing the JSON upserts by natural key
 * (e.g. pillarKey, categoryKey) rather than duplicating rows, mirroring
 * the pattern in convex/surveys.ts's seedSurveyContent.
 *
 * This mutation only ever writes framework REFERENCE data. It never
 * touches user data (surveys, submissions, results, users).
 */
export const seedFrameworkTaxonomy = mutation({
  args: {},
  handler: async (ctx) => {
    const versionTag = taxonomy.frameworkVersion.versionTag;
    const now = Date.now();

    // 1. Framework version record -- mark this version current, demote any
    // previously-current version so there is always exactly one.
    const existingVersion = await ctx.db
      .query("frameworkVersions")
      .withIndex("by_versionTag", (q) => q.eq("versionTag", versionTag))
      .unique();

    if (!existingVersion) {
      const previouslyCurrent = await ctx.db
        .query("frameworkVersions")
        .withIndex("by_isCurrent", (q) => q.eq("isCurrent", true))
        .collect();

      for (const row of previouslyCurrent) {
        await ctx.db.patch(row._id, { isCurrent: false });
      }

      await ctx.db.insert("frameworkVersions", {
        versionTag,
        alignedDate: taxonomy.frameworkVersion.alignedDate,
        sourceAuthority: taxonomy.frameworkVersion.sourceAuthority,
        notes: taxonomy.frameworkVersion.notes,
        isCurrent: true,
        createdAt: now
      });
    }

    // 2. Pillars
    for (const pillar of taxonomy.pillars) {
      const existing = await ctx.db
        .query("pillars")
        .withIndex("by_pillarKey", (q) => q.eq("pillarKey", pillar.pillarKey as any))
        .unique();

      const doc = { ...pillar, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("pillars", doc);
      }
    }

    // 3. Categories
    for (const category of taxonomy.categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_categoryKey", (q) => q.eq("categoryKey", category.categoryKey as string))
        .unique();

      const doc = { ...category, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("categories", doc);
      }
    }

    // 4. Constructs
    for (const construct of taxonomy.constructs) {
      const existing = await ctx.db
        .query("constructs")
        .withIndex("by_constructKey", (q) => q.eq("constructKey", construct.constructKey as string))
        .unique();

      const doc = { ...construct, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("constructs", doc);
      }
    }

    // 5. GMMBB axes
    for (const axis of taxonomy.gmmbbAxes) {
      const existing = await ctx.db
        .query("gmmbbAxes")
        .withIndex("by_axisKey", (q) => q.eq("axisKey", axis.axisKey as any))
        .unique();

      const doc = { ...axis, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("gmmbbAxes", doc);
      }
    }

    // 6. Modifying factors
    for (const factor of taxonomy.modifyingFactors) {
      const existing = await ctx.db
        .query("modifyingFactors")
        .withIndex("by_factorKey", (q) => q.eq("factorKey", factor.factorKey as string))
        .unique();

      const doc = { ...factor, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("modifyingFactors", doc);
      }
    }

    // 7. Population overlays
    for (const overlay of taxonomy.populationOverlays) {
      const existing = await ctx.db
        .query("populationOverlays")
        .withIndex("by_overlayKey", (q) => q.eq("overlayKey", overlay.overlayKey as any))
        .unique();

      const doc = { ...overlay, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("populationOverlays", doc);
      }
    }

    // 8. Convergence patterns
    for (const pattern of taxonomy.convergencePatterns) {
      const existing = await ctx.db
        .query("convergencePatterns")
        .withIndex("by_patternId", (q) => q.eq("patternId", pattern.patternId as string))
        .unique();

      const doc = { ...pattern, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("convergencePatterns", doc);
      }
    }

    // 9. Cross-cutting nodes (empty today -- loop is a no-op until
    // 01-canonical/CROSS-CUTTING-NODES.md data is available)
    for (const node of taxonomy.crossCuttingNodes) {
      const existing = await ctx.db
        .query("crossCuttingNodes")
        .withIndex("by_nodeKey", (q) => q.eq("nodeKey", node.nodeKey as string))
        .unique();

      const doc = { ...node, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("crossCuttingNodes", doc);
      }
    }

    // 10. MM Health Score tiers (higher-is-better, consumer-facing)
    for (const tier of taxonomy.riskTiers) {
      const existing = await ctx.db
        .query("riskTiers")
        .withIndex("by_tierKey", (q) => q.eq("tierKey", tier.tierKey as any))
        .unique();

      const doc = { ...tier, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("riskTiers", doc);
      }
    }

    // 11. Clinical risk bands (higher-is-worse, raw-instrument)
    for (const band of taxonomy.clinicalRiskBands) {
      const existing = await ctx.db
        .query("clinicalRiskBands")
        .withIndex("by_bandKey", (q) => q.eq("bandKey", band.bandKey as any))
        .unique();

      const doc = { ...band, frameworkVersion: versionTag } as any;

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("clinicalRiskBands", doc);
      }
    }

    return {
      ok: true,
      versionTag,
      counts: {
        pillars: taxonomy.pillars.length,
        categories: taxonomy.categories.length,
        constructs: taxonomy.constructs.length,
        gmmbbAxes: taxonomy.gmmbbAxes.length,
        modifyingFactors: taxonomy.modifyingFactors.length,
        populationOverlays: taxonomy.populationOverlays.length,
        convergencePatterns: taxonomy.convergencePatterns.length,
        crossCuttingNodes: taxonomy.crossCuttingNodes.length,
        riskTiers: taxonomy.riskTiers.length,
        clinicalRiskBands: taxonomy.clinicalRiskBands.length
      }
    };
  }
});
