import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { createServerSupabase, createAdminSupabase } from "./supabase";
import { redis } from "./redis";

// --- Types ---

export interface GitHubProfile {
  name: string | null;
  login: string;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  repo_name: string;
  url: string;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface LanguageStats {
  [key: string]: number;
}

interface GraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
            }[];
          }[];
        };
      };
    };
  };
}

// --- Helpers ---

const githubRest = (token: string) =>
  axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

const checkRateLimit = (headers: AxiosResponseHeaders | RawAxiosResponseHeaders) => {
  const remaining = headers["x-ratelimit-remaining"];
  if (remaining && typeof remaining === "string" && parseInt(remaining) === 0) {
    const resetTime = new Date(parseInt(headers["x-ratelimit-reset"] as string) * 1000);
    throw new Error(`GitHub Rate Limit Exceeded. Resets at ${resetTime.toISOString()}`);
  }
};

// --- Service Functions ---

export const getUserProfile = async (token: string): Promise<GitHubProfile> => {
  try {
    const client = githubRest(token);
    const { data, headers } = await client.get("/user");
    checkRateLimit(headers);
    return {
      name: data.name,
      login: data.login,
      avatar_url: data.avatar_url,
      bio: data.bio,
      location: data.location,
      blog: data.blog,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("GitHub token expired or invalid");
    }
    throw error;
  }
};

export const getUserRepos = async (token: string): Promise<GitHubRepo[]> => {
  try {
    const client = githubRest(token);
    const { data, headers } = await client.get<GitHubRepo[]>("/user/repos", {
      params: { per_page: 100, sort: "updated" },
    });
    checkRateLimit(headers);

    return (data as any[])
      .filter((repo) => !(repo as any).fork)
      .map((repo) => ({
        id: (repo as any).id,
        name: (repo as any).name,
        description: (repo as any).description,
        html_url: (repo as any).html_url,
        language: (repo as any).language,
        stargazers_count: (repo as any).stargazers_count,
        forks_count: (repo as any).forks_count,
        updated_at: (repo as any).updated_at,
        topics: (repo as any).topics || [],
      }));
  } catch (error: unknown) {
    throw error;
  }
};

export const getContributionData = async (
  token: string,
  username: string
): Promise<ContributionDay[]> => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post<GraphQLResponse>(
      "https://api.github.com/graphql",
      { query, variables: { username } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
    const contributionData: ContributionDay[] = [];

    console.log(`📊 FETCHED ${weeks.length} WEEKS OF CONTRIBUTIONS FOR ${username}`);

    weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributionData.push({
          date: day.date,
          count: day.contributionCount,
        });
      });
    });

    console.log(`✅ TOTAL CONTRIBUTION DAYS: ${contributionData.length}`);
    return contributionData;
  } catch (error: unknown) {
    throw new Error("Failed to fetch contribution data from GitHub GraphQL");
  }
};

export const getDetailedLanguageStats = async (token: string, username: string): Promise<LanguageStats> => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query, variables: { username } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const repos = response.data.data.user.repositories.nodes;
    const langBytes: Record<string, number> = {};
    let totalBytes = 0;

    repos.forEach((repo: any) => {
      repo.languages.edges.forEach((edge: any) => {
        const name = edge.node.name;
        const size = edge.size;
        langBytes[name] = (langBytes[name] || 0) + size;
        totalBytes += size;
      });
    });

    const stats: LanguageStats = {};
    if (totalBytes === 0) return {};

    Object.keys(langBytes).forEach((lang) => {
      const percentage = (langBytes[lang] / totalBytes) * 100;
      // Only include languages with > 0.5%
      if (percentage >= 0.5) {
        stats[lang] = parseFloat(percentage.toFixed(1));
      }
    });

    return stats;
  } catch (error) {
    console.error("Failed to fetch detailed languages:", error);
    return {};
  }
};

export const getRecentActivity = async (token: string, username: string): Promise<GitHubCommit[]> => {
  try {
    const client = githubRest(token);
    
    // Use authenticated user events endpoint (more reliable)
    const { data: events } = await client.get("/events", {
      params: { per_page: 50 },
    });

    let commits: GitHubCommit[] = [];
    
    events.forEach((event: any) => {
      if (commits.length >= 10) return;
      
      // STRICT FILTER: Only events where YOU are the actor
      if (event.actor.login !== username) return;

      let message = "";
      if (event.type === "PushEvent" && event.payload.commits) {
        message = `Pushed ${event.payload.commits.length} commit(s): ${event.payload.commits[0].message}`;
      } else if (event.type === "WatchEvent") {
        message = `Starred a repository`;
      } else if (event.type === "CreateEvent") {
        message = `Created a new ${event.payload.ref_type}: ${event.payload.ref || ""}`;
      } else if (event.type === "PullRequestEvent") {
        message = `${event.payload.action} a pull request`;
      }

      if (message) {
        commits.push({
          sha: event.id,
          message: message,
          date: event.created_at,
          repo_name: event.repo.name.split("/")[1],
          url: `https://github.com/${event.repo.name}`,
        });
      }
    });

    // --- FALLBACK: If no events found, fetch from Search API or Recent Repos ---
    if (commits.length === 0) {
      console.log("⚠️ No events found, trying fallback: search commits...");
      const { data: searchData } = await client.get("/search/commits", {
        params: { 
          q: `author:${username}`,
          sort: "author-date",
          order: "desc",
          per_page: 10
        }
      });

      if (searchData.items) {
        commits = searchData.items.map((item: any) => ({
          sha: item.sha,
          message: item.commit.message,
          date: item.commit.author.date,
          repo_name: item.repository.name,
          url: item.html_url
        }));
      }
    }

    console.log(`🔥 FETCHED ${commits.length} RECENT COMMITS`);
    return commits;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return [];
  }
};

export const syncUserData = async (userId: string, token: string) => {
  const supabase = createAdminSupabase();

  try {
    // 1. Fetch all data in parallel
    const profile = await getUserProfile(token);
    const [repos, contributions, recentActivity, detailedLangs] = await Promise.all([
      getUserRepos(token),
      getContributionData(token, profile.login),
      getRecentActivity(token, profile.login),
      getDetailedLanguageStats(token, profile.login),
    ]);

    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

    // 2. Update user profile in Supabase
    await supabase
      .from("users")
      .update({
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        website: profile.blog,
      })
      .eq("id", userId);

    // 3. Upsert github_stats
    const statsData: any = {
      user_id: userId,
      username: profile.login,
      total_commits: contributions.reduce((acc, day) => acc + day.count, 0),
      total_stars: totalStars,
      total_repos: repos.length,
      followers: profile.followers,
      languages: detailedLangs, // Use byte-based stats
      contribution_data: contributions,
      top_repos: [...repos]
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 6),
      synced_at: new Date().toISOString(),
    };

    // Include recent_activity
    statsData.recent_activity = recentActivity;

    console.log("💾 UPSERTING STATS DATA TO DB...");

    const { data: syncedData, error: statsError } = await supabase
      .from("github_stats")
      .upsert(statsData, { onConflict: "user_id" })
      .select()
      .single();

    if (statsError) {
      console.error("❌ SUPABASE UPSERT ERROR:", statsError.code, statsError.message);
      // Handle missing column (42703) OR schema cache mismatch (PGRST204)
      if (statsError.code === '42703' || statsError.code === 'PGRST204') {
        console.warn("Schema mismatch detected, falling back to base stats sync.");
        delete statsData.recent_activity;
        delete statsData.username; // Also delete username if it fails
        const { data: retryData, error: retryError } = await supabase
          .from("github_stats")
          .upsert(statsData, { onConflict: "user_id" })
          .select()
          .single();
        if (retryError) {
          console.error("❌ RETRY UPSERT ERROR:", retryError.message);
          throw retryError;
        }
        console.log("✅ RETRY UPSERT SUCCESSFUL");
        return { ...retryData, recent_activity: recentActivity, username: profile.login };
      }
      throw statsError;
    }

    console.log("✅ PRIMARY UPSERT SUCCESSFUL");

    // 4. Cache in Redis (Optional)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        await redis.set(`github:stats:${userId}`, JSON.stringify({ ...syncedData, recent_activity: recentActivity }), {
          ex: 3600,
        });
      } catch (redisError) {
        console.warn("Redis caching failed, but sync completed:", redisError);
      }
    }

    return { ...syncedData, recent_activity: recentActivity };
  } catch (error: unknown) {
    console.error("Sync error:", error);
    throw error;
  }
};
