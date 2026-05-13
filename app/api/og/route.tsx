import { ImageResponse } from "next/og";
import { createAdminSupabase } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return new Response("Username is required", { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("*, github_stats(*)")
      .ilike("username", username)
      .single();

    if (error || !user) {
      return new Response("User not found", { status: 404 });
    }

    const stats = user.github_stats?.[0] || {};
    const languages = stats.languages ? Object.entries(stats.languages).slice(0, 5) : [];

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            backgroundImage: "radial-gradient(circle at 20% 30%, #1a1a2e 0%, transparent 70%), radial-gradient(circle at 80% 70%, #0d1117 0%, transparent 70%)",
            color: "white",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Main Content */}
          <div style={{ display: "flex", width: "100%", flex: 1, alignItems: "center" }}>
            {/* Left Column: Profile */}
            <div style={{ display: "flex", flexDirection: "column", width: "40%", paddingRight: "20px" }}>
              <img
                src={user.avatar_url}
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "70px",
                  border: "4px solid #4ade80",
                  marginBottom: "20px",
                }}
              />
              <div style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "5px" }}>
                {user.name || user.username}
              </div>
              <div style={{ fontSize: "24px", color: "#6e7681", marginBottom: "15px" }}>
                @{user.username}
              </div>
              <div style={{ fontSize: "18px", color: "#9ca3af", lineHeight: "1.4" }}>
                {user.bio ? (user.bio.length > 100 ? user.bio.substring(0, 100) + "..." : user.bio) : "Passionate Developer"}
              </div>
            </div>

            {/* Middle Column: Stats */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "14px", color: "#6e7681", textTransform: "uppercase", letterSpacing: "1px" }}>Commits</div>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80" }}>{stats.total_commits || 0}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "14px", color: "#6e7681", textTransform: "uppercase", letterSpacing: "1px" }}>Stars</div>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#facc15" }}>{stats.total_stars || 0}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "14px", color: "#6e7681", textTransform: "uppercase", letterSpacing: "1px" }}>Followers</div>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#60a5fa" }}>{stats.followers || 0}</div>
              </div>
            </div>

            {/* Right Column: Languages */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%", paddingLeft: "40px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "20px", color: "#9ca3af" }}>Top Languages</div>
              {languages.map(([name, percent]: any) => (
                <div key={name} style={{ display: "flex", flexDirection: "column", marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "5px" }}>
                    <span>{name}</span>
                    <span style={{ color: "#6e7681" }}>{percent}%</span>
                  </div>
                  <div style={{ display: "flex", height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                    <div style={{ display: "flex", height: "100%", width: `${percent}%`, backgroundColor: "#4ade80", borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", marginTop: "20px" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
              <div style={{ width: "24px", height: "24px", backgroundColor: "#4ade80", borderRadius: "4px", marginRight: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "black", fontSize: "14px" }}>G</div>
              GitFolio
            </div>
            <div style={{ fontSize: "18px", color: "#6e7681" }}>gitfolio.app/{user.username}</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
