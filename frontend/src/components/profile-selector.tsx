"use client";

import { useState } from "react";
import { useProfile } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import { Plus, User, ArrowRight, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileSelectorProps {
    onCreateStart: () => void;
    onProfileSelected: () => void;
}

const STAGE_LABELS: Record<string, string> = {
    "Stranger": "陌生人",
    "Acquaintance": "点头之交",
    "Friend": "普通朋友",
    "Close Friend": "好朋友",
    "Situationship": "暧昧中",
    "Girlfriend": "女朋友"
};

export function ProfileSelector({ onCreateStart, onProfileSelected }: ProfileSelectorProps) {
    const { profiles, selectProfile } = useProfile();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-blue/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            选择女生档案
                        </h1>
                        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                            选择一个档案开始获取建议，或者创建一个新档案。
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <button
                            onClick={onCreateStart}
                            className="w-full h-[280px] rounded-3xl border-2 border-dashed border-black/10 hover:border-pastel-purple/50 bg-white/30 hover:bg-white/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
                        >
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Plus className="h-8 w-8 text-pastel-purple" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-foreground">新建档案</h3>
                                <p className="text-sm text-muted-foreground">开始新的分析</p>
                            </div>
                        </button>
                    </motion.div>

                    {/* Existing Profiles */}
                    {profiles.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 + (index + 1) * 0.1 }}
                        >
                            <div
                                onClick={() => {
                                    selectProfile(profile.id);
                                    onProfileSelected();
                                }}
                                className="w-full h-[280px] rounded-3xl bg-white/60 hover:bg-white/80 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="h-8 w-8 rounded-full bg-pastel-purple/10 flex items-center justify-center">
                                        <ArrowRight className="h-4 w-4 text-pastel-purple" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm text-white text-xl font-bold",
                                        profile.avatarColor || "bg-gradient-to-br from-pastel-pink to-pastel-purple"
                                    )}>
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground line-clamp-1">{profile.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-xs font-medium text-muted-foreground">
                                                {STAGE_LABELS[profile.stage] || profile.stage}
                                            </span>
                                            {profile.personalityType && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-pastel-purple/10 text-xs font-medium text-pastel-purple">
                                                    {profile.personalityType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {profile.description || "暂无描述。"}
                                    </p>
                                    <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5 text-pastel-purple" />
                                        <span>最近活跃</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
