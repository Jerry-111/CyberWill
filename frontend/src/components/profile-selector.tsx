"use client";

import { useState } from "react";
import { useProfile } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import { Plus, User, ArrowRight, Heart, Sparkles, Trash2 } from "lucide-react";
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
    const { profiles, selectProfile, deleteProfile } = useProfile();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden">
            {/* ... (background and header) ... */}

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
                    {/* ... (keep existing create card) ... */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <button
                            onClick={onCreateStart}
                            className="w-full h-[320px] rounded-3xl border-2 border-dashed border-black/10 hover:border-pastel-purple/50 bg-white/30 hover:bg-white/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
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
                                className="w-full h-[320px] rounded-3xl bg-white/60 hover:bg-white/80 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("确定要删除这个档案吗？此操作无法撤销。")) {
                                                deleteProfile(profile.id);
                                            }
                                        }}
                                        className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                                        title="删除档案"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                    <div className="h-8 w-8 rounded-full bg-pastel-purple/10 flex items-center justify-center">
                                        <ArrowRight className="h-4 w-4 text-pastel-purple" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm text-white text-xl font-bold shrink-0",
                                            profile.avatarColor || "bg-gradient-to-br from-pastel-pink to-pastel-purple"
                                        )}>
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                        {profile.archetype && (
                                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pastel-purple/10 to-pastel-pink/10 text-xs font-bold text-pastel-purple border border-pastel-purple/20 truncate max-w-[120px]">
                                                {profile.archetype}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-foreground line-clamp-1">{profile.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-xs font-medium text-muted-foreground">
                                                {STAGE_LABELS[profile.stage] || profile.stage}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {profile.traits ? (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div className="bg-white/50 rounded-xl p-2 text-center border border-black/5">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">测试/投资</div>
                                            <div className="text-xs font-bold text-foreground">{profile.traits.investment}</div>
                                        </div>
                                        <div className="bg-white/50 rounded-xl p-2 text-center border border-black/5">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">感性/理性</div>
                                            <div className="text-xs font-bold text-foreground">{profile.traits.rationality}</div>
                                        </div>
                                        <div className="bg-white/50 rounded-xl p-2 text-center border border-black/5">
                                            <div className="text-[10px] text-muted-foreground mb-0.5">回避/解释</div>
                                            <div className="text-xs font-bold text-foreground">{profile.traits.conflict}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                            {profile.description || "暂无描述。"}
                                        </p>
                                        {profile.personalityType && (
                                            <div className="flex flex-wrap gap-1">
                                                {profile.personalityType.split('、').map((type, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-pastel-purple/5 text-pastel-purple rounded-full">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
