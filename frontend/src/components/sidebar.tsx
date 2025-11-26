import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Users, MessageSquare, Map, Settings, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
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
                        <Button variant="secondary" className="w-full justify-start h-12 px-5 font-medium rounded-2xl shadow-sm bg-white/60 text-pastel-purple hover:bg-white/80 hover:scale-[1.02] transition-all duration-300">
                            <Bot className="mr-3 h-5 w-5" />
                            赛博教练
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 px-5 rounded-2xl text-muted-foreground hover:text-pastel-pink hover:bg-white/30 transition-all duration-300">
                            <Users className="mr-3 h-5 w-5" />
                            女生档案
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 px-5 rounded-2xl text-muted-foreground hover:text-pastel-blue hover:bg-white/30 transition-all duration-300">
                            <MessageSquare className="mr-3 h-5 w-5" />
                            聊天分析
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-12 px-5 rounded-2xl text-muted-foreground hover:text-pastel-light-pink hover:bg-white/30 transition-all duration-300">
                            <Map className="mr-3 h-5 w-5" />
                            僚机计划
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
