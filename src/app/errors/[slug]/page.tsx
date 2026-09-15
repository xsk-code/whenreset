import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ERROR_PAGES, getErrorPage } from "@/lib/error-pages";
import { ErrorDoc } from "@/components/seo/ErrorDoc";
import { SITE_CONFIG } from "@/lib/config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ERROR_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getErrorPage(slug);
  if (!entry) return {};

  const title = `${entry.platform}: fix the usage limit error (live reset forecast)`;
  const description = entry.meaning.en.slice(0, 155);
  const url = `${SITE_CONFIG.domain.replace(/\/$/, "")}/errors/${entry.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ErrorPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getErrorPage(slug);
  if (!entry) notFound();

  const related = ERROR_PAGES.filter((page) => page.slug !== entry.slug).map((page) => ({
    slug: page.slug,
    platform: page.platform,
  }));

  return <ErrorDoc entry={entry} related={related} />;
}
