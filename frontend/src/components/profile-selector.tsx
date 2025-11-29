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
    onViewAnalysis: (profileId: string) => void;
}

const STAGE_LABELS: Record<string, string> = {
    "Stranger": "陌生人",
    "Acquaintance": "点头之交",
    "Friend": "普通朋友",
    "Close Friend": "好朋友",
    "Situationship": "暧昧中",
    "Girlfriend": "女朋友"
};

export function ProfileSelector({ onCreateStart, onProfileSelected, onViewAnalysis }: ProfileSelectorProps) {
    const { profiles, selectProfile, deleteProfile } = useProfile();

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden bg-white/50 backdrop-blur-xl">

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
                            className="w-full h-[320px] rounded-3xl border-2 border-dashed border-black/10 hover:border-pastel-purple/50 bg-white/30 hover:bg-white/60 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
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
                                className="w-full h-[320px] rounded-3xl bg-white/70 hover:bg-white/90 border border-white/60 shadow-sm hover:shadow-xl hover:shadow-pastel-purple/10 transition-all duration-500 p-6 flex flex-col relative overflow-hidden cursor-pointer group backdrop-blur-xl"
                            >
                                {/* Background Gradient Blob */}
                                <div className={cn(
                                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-30",
                                    profile.avatarColor?.replace("bg-", "bg-") || "bg-pastel-purple"
                                )} />

                                {/* Header: Avatar & Actions */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className={cn(
                                        "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 text-white text-2xl font-bold shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 ring-4 ring-white/50",
                                        profile.avatarColor || "bg-gradient-to-br from-pastel-pink to-pastel-purple"
                                    )}>
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("确定要删除这个档案吗？此操作无法撤销。")) {
                                                    deleteProfile(profile.id);
                                                }
                                            }}
                                            className="h-9 w-9 rounded-full bg-white/80 hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors shadow-sm border border-black/5"
                                            title="删除档案"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="h-9 w-9 rounded-full bg-pastel-purple text-white flex items-center justify-center shadow-sm shadow-pastel-purple/30">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="mt-6 space-y-1 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold text-foreground tracking-tight line-clamp-1">{profile.name}</h3>
                                        {profile.archetype && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pastel-purple/10 to-pastel-pink/10 text-[10px] font-bold text-pastel-purple border border-pastel-purple/10 uppercase tracking-wider">
                                                {profile.archetype}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                        <span className={cn("w-1.5 h-1.5 rounded-full", profile.avatarColor?.split(" ")[0] || "bg-pastel-purple")} />
                                        {STAGE_LABELS[profile.stage] || profile.stage}
                                    </p>
                                </div>

                                {/* Traits / Description Area */}
                                <div className="mt-auto relative z-10">
                                    {profile.traits ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: "投入度", value: profile.traits.investment, color: "text-pastel-purple" },
                                                { label: "决策点", value: profile.traits.rationality, color: "text-pastel-pink" },
                                                { label: "开放度", value: profile.traits.openness, color: "text-pastel-blue" }
                                            ].map((trait, i) => (
                                                <div key={i} className="bg-white/80 rounded-2xl p-3 border border-white/50 shadow-sm flex flex-col items-center justify-center gap-1 transition-transform duration-300 hover:scale-105">
                                                    <span className="text-[10px] font-medium text-muted-foreground/80">{trait.label}</span>
                                                    <span className={cn("text-sm font-bold", trait.color)}>{trait.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white/80 rounded-2xl p-4 border border-white/50 shadow-sm h-[88px]">
                                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                {profile.description || "暂无描述。"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* View Analysis Button (Overlay on hover or dedicated area) */}
                                <div className="absolute top-24 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-20">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewAnalysis(profile.id);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-pastel-purple shadow-sm border border-pastel-purple/10 flex items-center gap-1"
                                    >
                                        <Sparkles className="h-3 w-3" />
                                        查看分析
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
