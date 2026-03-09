const rawIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

const issuerDomain = rawIssuerDomain
  ? rawIssuerDomain.startsWith("http")
    ? rawIssuerDomain
    : `https://${rawIssuerDomain}`
  : null;

const authConfig = {
  providers: issuerDomain
    ? [
        {
          domain: issuerDomain,
          applicationID: "convex"
        }
      ]
    : []
};

// TODO: Keep this in sync with your Clerk instance domain.

export default authConfig;