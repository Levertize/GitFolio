import { createAdminSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";
import { unstable_noStore as noStore } from "next/cache";
import PortfolioClient from "@/components/portfolio/PortfolioClient";

interface PageProps {
  params: { username: string };
}

// 1. Data Fetching
async function getPortfolioData(username: string) {
  const supabase = createAdminSupabase();

  const searchName = username.toLowerCase().trim();
  console.log(`🔍 FETCHING PORTFOLIO FOR: "${searchName}"`);

  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      github_stats (*)
    `)
    .or(`username.ilike.${searchName},custom_slug.ilike.${searchName}`)
    .maybeSingle();

  if (error || !user) {
    console.error("❌ USER NOT FOUND OR DB ERROR", error?.message);
    return null;
  }

  if (!user.is_public) {
    console.warn("🔒 USER PROFILE IS PRIVATE");
    return null;
  }

  return user;
}

// 2. Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getPortfolioData(params.username);

  if (!user) return { title: "User Not Found | GitFolio" };

  const title = `${user.name || user.username}'s Portfolio | GitFolio`;
  const description = user.bio || `Check out ${user.username}'s coding activity and projects on GitFolio.`;
  const ogImage = `/api/og?username=${user.username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  noStore();
  const user = await getPortfolioData(params.username);
  const session = await auth();

  if (!user) notFound();

  return <PortfolioClient initialUser={user} session={session} />;
}
