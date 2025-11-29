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
        openness: "回避" | "合理解释";
    };
    archetype?: string; // e.g. "邻家女孩", "高冷御姐"
    createdAt: number;
    avatarColor?: string; // For UI visualization
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
}

interface ProfileContextType {
    profiles: GirlProfile[];
    currentProfile: GirlProfile | null;
    selectProfile: (profileId: string) => void;
    addProfile: (profile: Omit<GirlProfile, "id" | "createdAt">) => string;
    deleteProfile: (profileId: string) => void;
    clearCurrentProfile: () => void;
    // Chat History
    getHistory: (profileId: string) => Message[];
    addMessage: (profileId: string, message: Message) => void;
    clearHistory: (profileId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profiles, setProfiles] = useState<GirlProfile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<GirlProfile | null>(null);
    const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});

    // Load from local storage on mount
    useEffect(() => {
        const savedProfiles = localStorage.getItem("cyberwill_profiles");
        if (savedProfiles) {
            setProfiles(JSON.parse(savedProfiles));
        }
        const savedHistory = localStorage.getItem("cyberwill_chat_history");
        if (savedHistory) {
            setChatHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Save to local storage whenever profiles change
    useEffect(() => {
        localStorage.setItem("cyberwill_profiles", JSON.stringify(profiles));
    }, [profiles]);

    // Save history to local storage
    useEffect(() => {
        localStorage.setItem("cyberwill_chat_history", JSON.stringify(chatHistory));
    }, [chatHistory]);

    const selectProfile = (profileId: string) => {
        const profile = profiles.find((p) => p.id === profileId);
        if (profile) {
            setCurrentProfile(profile);
        }
    };

    const addProfile = (newProfileData: Omit<GirlProfile, "id" | "createdAt">) => {
        const id = crypto.randomUUID();
        const newProfile: GirlProfile = {
            ...newProfileData,
            id,
            createdAt: Date.now(),
        };
        setProfiles((prev) => [...prev, newProfile]);
        setCurrentProfile(newProfile); // Auto-select newly created profile
        return id;
    };

    const deleteProfile = (profileId: string) => {
        setProfiles((prev) => prev.filter((p) => p.id !== profileId));
        if (currentProfile?.id === profileId) {
            setCurrentProfile(null);
        }
        // Also clean up history
        setChatHistory(prev => {
            const newHistory = { ...prev };
            delete newHistory[profileId];
            return newHistory;
        });
    };

    const clearCurrentProfile = () => {
        setCurrentProfile(null);
    };

    // Chat History Methods
    const getHistory = (profileId: string) => {
        return chatHistory[profileId] || [];
    };

    const addMessage = (profileId: string, message: Message) => {
        setChatHistory(prev => ({
            ...prev,
            [profileId]: [...(prev[profileId] || []), message]
        }));
    };

    const clearHistory = (profileId: string) => {
        setChatHistory(prev => ({
            ...prev,
            [profileId]: []
        }));
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
                getHistory,
                addMessage,
                clearHistory,
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
