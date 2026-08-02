import type { ReactNode } from "react";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";

export function ContentPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  const breadcrumbs = [{ label: "Start", href: "/" }, { label: title }];

  return (
    <section className="content-page">
      <div className="site-container content-page-inner">
        <Breadcrumbs items={breadcrumbs} />
        <h1>{title}</h1>
        <p className="content-lead">{lead}</p>
        <div className="prose">{children}</div>
      </div>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
    </section>
  );
}
