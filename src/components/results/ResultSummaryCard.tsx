import { getCtaByKey } from "@/lib/routing/pathwayCta";

interface ResultSummaryCardProps {
  title: string;
  subtitle: string;
  primaryCtaKey?: string;
  secondaryCtaKey?: string;
}

export function ResultSummaryCard({
  title,
  subtitle,
  primaryCtaKey,
  secondaryCtaKey
}: ResultSummaryCardProps) {
  const primary = primaryCtaKey ? getCtaByKey(primaryCtaKey) : undefined;
  const secondary = secondaryCtaKey ? getCtaByKey(secondaryCtaKey) : undefined;

  return (
    <section className="card">
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <div className="ctaRow">
        {primary ? (
          <a className="button" href={primary.target}>
            {primary.label}
          </a>
        ) : null}
        {secondary ? (
          <a className="button buttonSecondary" href={secondary.target}>
            {secondary.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}

