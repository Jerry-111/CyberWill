"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RelationshipStage =
    | "Stranger"
    | "Acquaintance"
    | "Friend"
    | "Close Friend"
    | "Situationship"
    | "Girlfriend";

export interface GirlProfile {
    id: string;
    name: string; // Can be a nickname or "Girl #1"
    stage: RelationshipStage;
    description: string; // AI generated summary
    personalityType?: string; // Legacy field, kept for compatibility
    traits?: {
        investment: "测试" | "投资";
        rationality: "感性" | "理性";
        conflict: "回避" | "合理解释";
    };
    archetype?: string; // e.g. "邻家女孩", "高冷御姐"
    createdAt: number;
    avatarColor?: string; // For UI visualization
}

interface ProfileContextType {
    profiles: GirlProfile[];
    currentProfile: GirlProfile | null;
    selectProfile: (profileId: string) => void;
    addProfile: (profile: Omit<GirlProfile, "id" | "createdAt">) => void;
    deleteProfile: (profileId: string) => void;
    clearCurrentProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profiles, setProfiles] = useState<GirlProfile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<GirlProfile | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        const savedProfiles = localStorage.getItem("cyberwill_profiles");
        if (savedProfiles) {
            setProfiles(JSON.parse(savedProfiles));
        }
    }, []);

    // Save to local storage whenever profiles change
    useEffect(() => {
        localStorage.setItem("cyberwill_profiles", JSON.stringify(profiles));
    }, [profiles]);

    const selectProfile = (profileId: string) => {
        const profile = profiles.find((p) => p.id === profileId);
        if (profile) {
            setCurrentProfile(profile);
        }
    };

    const addProfile = (newProfileData: Omit<GirlProfile, "id" | "createdAt">) => {
        const newProfile: GirlProfile = {
            ...newProfileData,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        };
        setProfiles((prev) => [...prev, newProfile]);
        setCurrentProfile(newProfile); // Auto-select newly created profile
    };

    const deleteProfile = (profileId: string) => {
        setProfiles((prev) => prev.filter((p) => p.id !== profileId));
        if (currentProfile?.id === profileId) {
            setCurrentProfile(null);
        }
    };

    const clearCurrentProfile = () => {
        setCurrentProfile(null);
    };

    return (
        <ProfileContext.Provider
            value={{
                profiles,
                currentProfile,
                selectProfile,
                addProfile,
                deleteProfile,
                clearCurrentProfile,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
