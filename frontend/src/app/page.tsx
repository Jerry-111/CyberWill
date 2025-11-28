"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { ProfileProvider, useProfile } from "@/context/profile-context";
import { ProfileSelector } from "@/components/profile-selector";
import { ProfileCreationWizard } from "@/components/profile-creation-wizard";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProfileReminder({ onGoToSelector }: { onGoToSelector: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
      <div className="h-20 w-20 rounded-full bg-black/5 flex items-center justify-center">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">请先选择档案</h3>
        <p className="text-muted-foreground max-w-sm">
          在使用赛博军师或查看建议之前，请先选择或创建一个女生档案。
        </p>
      </div>
      <Button onClick={onGoToSelector} className="bg-pastel-purple hover:bg-pastel-purple/90 text-white">
        前往档案选择
      </Button>
    </div>
  );
}

function AppContent() {
  const { currentProfile } = useProfile();
  const [view, setView] = useState<"selector" | "wizard" | "chat" | "analysis" | "advice">("selector");

  // Sync view with profile state
  // If no profile is selected, force selector or wizard
  // Removed auto-redirect logic as per instructions.

  // If profile is selected and we are in selector, go to chat (default)
  // But we might want to stay in selector if user explicitly went there?
  // For now, let's handle navigation via Sidebar callbacks

  const handleNavigate = (newView: "selector" | "wizard" | "chat" | "analysis" | "advice") => {
    setView(newView);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-[2vw] overflow-hidden">
      <div className="w-full h-full flex gap-6 relative z-10">

        {/* Left Card: Sidebar */}
        <div className="hidden md:block w-[280px] lg:w-[320px] xl:w-[360px] 2xl:w-[400px] h-full glass-panel rounded-[2rem] overflow-hidden transition-all duration-300">
          <Sidebar
            currentView={view}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Right Card: Main Content */}
        <main className="flex-1 h-full glass-panel rounded-[2rem] overflow-hidden backdrop-blur-sm relative">
          {view === "selector" && (
            <ProfileSelector
              onCreateStart={() => setView("wizard")}
              onProfileSelected={() => setView("chat")}
            />
          )}
          {view === "wizard" && (
            <ProfileCreationWizard
              onCancel={() => setView("selector")}
              onComplete={() => setView("chat")}
            />
          )}

          {view === "chat" && (
            currentProfile ? (
              <ChatInterface onManageProfiles={() => setView("selector")} />
            ) : (
              <ProfileReminder onGoToSelector={() => setView("selector")} />
            )
          )}

          {view === "analysis" && (
            currentProfile ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                聊天分析功能即将上线
              </div>
            ) : <ProfileReminder onGoToSelector={() => setView("selector")} />
          )}

          {view === "advice" && (
            currentProfile ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                建议功能即将上线
              </div>
            ) : <ProfileReminder onGoToSelector={() => setView("selector")} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}
