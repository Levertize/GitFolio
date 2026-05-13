import { signIn } from "@/auth";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-white p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">GitFolio</h1>
          <p className="text-gray-400 text-lg">
            Auto-generate your professional dev portfolio from GitHub activity.
          </p>
        </div>

        <div className="bg-[#161b22] p-8 rounded-xl border border-[#30363d] shadow-2xl">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </form>
          
          <p className="mt-6 text-xs text-gray-500">
            By continuing, you allow GitFolio to access your GitHub public profile, email, and organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
