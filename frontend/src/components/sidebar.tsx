"use client";

import { Button } from "@/components/ui/button";
import { Bot, Users, MessageSquare, Map, Settings, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/context/profile-context";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    currentView: "selector" | "wizard" | "chat" | "analysis" | "advice";
    onNavigate: (view: "selector" | "wizard" | "chat" | "analysis" | "advice") => void;
}

export function Sidebar({ className, currentView, onNavigate }: SidebarProps) {
    const { currentProfile } = useProfile();

    return (
        <div className={cn("pb-12 w-full flex flex-col h-full", className)}>
            <div className="space-y-8 py-8 flex-1">
                <div className="px-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-purple flex items-center justify-center shadow-lg shadow-pastel-pink/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground/90">
                        CyberWill
                    </h2>
                </div>

                <div className="px-4">
                    <div className="space-y-2">
                        {/* 1. Girl Profile (First) */}
                        <Button
                            variant={currentView === "selector" || currentView === "wizard" ? "secondary" : "ghost"}
                            onClick={() => onNavigate("selector")}
                            className={cn(
                                "w-full justify-start h-12 px-5 font-medium rounded-2xl transition-all duration-300",
                                currentView === "selector" || currentView === "wizard"
                                    ? "shadow-sm bg-white/60 text-pastel-pink hover:bg-white/80 hover:scale-[1.02]"
                                    : "text-muted-foreground hover:text-pastel-pink hover:bg-white/30"
                            )}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            女生档案
                        </Button>

                        {/* 2. Cyber Advisor */}
                        <Button
                            variant={currentView === "chat" ? "secondary" : "ghost"}
                            onClick={() => onNavigate("chat")}
                            className={cn(
                                "w-full justify-start h-12 px-5 font-medium rounded-2xl transition-all duration-300",
                                currentView === "chat"
                                    ? "shadow-sm bg-white/60 text-pastel-purple hover:bg-white/80 hover:scale-[1.02]"
                                    : "text-muted-foreground hover:text-pastel-purple hover:bg-white/30",
                                !currentProfile && "opacity-70" // Visual hint but clickable
                            )}
                        >
                            <Bot className="mr-3 h-5 w-5" />
                            赛博军师
                        </Button>

                        {/* 3. Chat Analysis (Restored) */}
                        <Button
                            variant={currentView === "analysis" ? "secondary" : "ghost"}
                            onClick={() => onNavigate("analysis")}
                            className={cn(
                                "w-full justify-start h-12 px-5 font-medium rounded-2xl transition-all duration-300",
                                currentView === "analysis"
                                    ? "shadow-sm bg-white/60 text-pastel-blue hover:bg-white/80 hover:scale-[1.02]"
                                    : "text-muted-foreground hover:text-pastel-blue hover:bg-white/30",
                                !currentProfile && "opacity-70"
                            )}
                        >
                            <MessageSquare className="mr-3 h-5 w-5" />
                            聊天分析
                        </Button>

                        {/* 4. Chat Advice */}
                        <Button
                            variant={currentView === "advice" ? "secondary" : "ghost"}
                            onClick={() => onNavigate("advice")}
                            className={cn(
                                "w-full justify-start h-12 px-5 font-medium rounded-2xl transition-all duration-300",
                                currentView === "advice"
                                    ? "shadow-sm bg-white/60 text-pastel-light-pink hover:bg-white/80 hover:scale-[1.02]"
                                    : "text-muted-foreground hover:text-pastel-light-pink hover:bg-white/30",
                                !currentProfile && "opacity-70"
                            )}
                        >
                            <Map className="mr-3 h-5 w-5" />
                            聊天建议
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6">
                <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/30">
                        <Settings className="mr-3 h-4 w-4" />
                        设置
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-10 px-4 rounded-xl text-red-400/80 hover:text-red-500 hover:bg-red-50/50">
                        <LogOut className="mr-3 h-4 w-4" />
                        登出
                    </Button>
                </div>
            </div>
        </div>
    );
}
