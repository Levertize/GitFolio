import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { createAdminSupabase } from "./lib/supabase";

interface GitHubProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      const supabase = createAdminSupabase();
      const githubProfile = profile as unknown as GitHubProfile;

      // Upsert user into Supabase
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            github_id: githubProfile.id,
            username: githubProfile.login,
            name: user.name,
            avatar_url: user.image,
            email: user.email,
            bio: githubProfile.bio || null,
            location: githubProfile.location || null,
            website: githubProfile.blog || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "github_id" }
        )
        .select("id")
        .single();

      if (error) {
        console.error("❌ SUPABASE ERROR:", error.message, error.details, error.hint);
        return false;
      }

      // Attach internal ID to user object for JWT callback
      (user as { id?: string }).id = data.id;
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
});
