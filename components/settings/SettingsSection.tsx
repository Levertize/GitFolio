import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-500 mt-3 leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-8 bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] -z-10 group-hover:bg-green-500/10 transition-colors duration-500" />
          {children}
        </div>
      </div>
    </section>
  );
}
