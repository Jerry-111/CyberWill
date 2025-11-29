"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, User, Heart, Zap, Brain, Shield, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { GirlProfile } from "@/context/profile-context";

interface ProfileAnalysisViewProps {
    profile: GirlProfile;
    onStartChat: () => void;
}

export function ProfileAnalysisView({ profile, onStartChat }: ProfileAnalysisViewProps) {
    if (!profile.traits || !profile.archetype) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-black/5 flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">暂无详细分析</h3>
                <p className="text-muted-foreground">该档案尚未进行完整的人格测试。</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col items-center p-6 md:p-8 relative overflow-hidden bg-white/50 backdrop-blur-xl">
            {/* Subtle Background */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-pastel-purple/5 to-transparent pointer-events-none" />

            <div className="max-w-4xl w-full h-full flex flex-col gap-8 relative z-10">

                {/* Header Section: Centered & Balanced */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2 shrink-0"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-purple/10 text-pastel-purple text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        Personality Archetype
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-blue pb-2">
                        {profile.archetype}
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        {profile.name}
                    </p>
                </motion.div>

                {/* Traits Row: Symmetrical Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0"
                >
                    <TraitCard
                        icon={Brain}
                        label="投入度"
                        value={profile.traits.investment}
                        color="text-pastel-purple"
                        bg="bg-pastel-purple/10"
                    />
                    <TraitCard
                        icon={Zap}
                        label="决策模式"
                        value={profile.traits.rationality}
                        color="text-pastel-pink"
                        bg="bg-pastel-pink/10"
                    />
                    <TraitCard
                        icon={Shield}
                        label="性开放度/边界"
                        value={profile.traits.conflict}
                        color="text-pastel-blue"
                        bg="bg-pastel-blue/10"
                    />
                </motion.div>

                {/* Analysis Content: Clean Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 bg-white/60 rounded-3xl border border-white/60 shadow-sm p-6 md:p-8 overflow-y-auto custom-scrollbar relative"
                >
                    <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed text-center md:text-left">
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p className="mb-6 text-base md:text-lg leading-relaxed text-gray-600" {...props} />,
                                strong: ({ node, ...props }) => <span className="font-bold text-gray-900 bg-pastel-purple/10 px-1 rounded" {...props} />,
                            }}
                        >
                            {profile.description || "暂无描述"}
                        </ReactMarkdown>
                    </div>
                </motion.div>

                {/* Footer Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="shrink-0 flex justify-center"
                >
                    <Button
                        onClick={onStartChat}
                        className="h-14 px-12 rounded-full text-lg font-bold bg-black text-white hover:bg-black/80 shadow-xl shadow-black/10 hover:scale-105 transition-all"
                    >
                        开始对话 <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>

            </div>
        </div>
    );
}

function TraitCard({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className="bg-white/80 rounded-2xl p-4 border border-white/50 shadow-sm flex flex-col items-center justify-center gap-2 text-center hover:scale-[1.02] transition-transform duration-300">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-1", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
            <span className={cn("text-lg font-black", color)}>{value}</span>
        </div>
    );
}
