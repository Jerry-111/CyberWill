"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, MoreHorizontal, Square, ChevronDown, Plus, Settings, MessageSquare, Trash2, Loader2, Heart, Zap, Brain, Search, Compass, Target } from "lucide-react";
import { useChatStream } from "@/hooks/useChatStream";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile, Message } from "@/context/profile-context";

interface ChatInterfaceProps {
    onManageProfiles?: () => void;
}

export function ChatInterface({ onManageProfiles }: ChatInterfaceProps) {
    const { currentProfile, profiles, selectProfile, clearCurrentProfile, getHistory, addMessage } = useProfile();
    const [input, setInput] = useState("");
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Get messages for current profile
    const messages = currentProfile ? getHistory(currentProfile.id) : [];

    const { isLoading, sendMessage, stopGeneration } = useChatStream({
        onChunk: (chunk) => setDisplayedContent((prev) => prev + chunk),
        onFinish: (fullMessage) => {
            if (currentProfile) {
                const aiMsg: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: fullMessage,
                    createdAt: Date.now(),
                };
                addMessage(currentProfile.id, aiMsg);
                setDisplayedContent("");
            }
        },
    });
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [displayedContent, setDisplayedContent] = useState("");

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, displayedContent, isLoading]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !currentProfile) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            createdAt: Date.now(),
        };

        // Add user message to context immediately
        addMessage(currentProfile.id, userMsg);
        const currentInput = input;
        setInput("");
        setDisplayedContent("");

        // Construct full profile context
        const profileContext = `
姓名: ${currentProfile.name}
关系阶段: ${currentProfile.stage}
人格原型: ${currentProfile.archetype || "未知"}
核心特质:
- 投入度: ${currentProfile.traits?.investment || "未知"}
- 决策模式: ${currentProfile.traits?.rationality || "未知"}
- 开放度: ${currentProfile.traits?.openness || "未知"}

请根据这个档案信息（特别是人格原型和核心特质）来提供建议和分析。
`;
        // Note: History is handled by the backend session_id
        await sendMessage(currentInput, profileContext);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const markdownComponents = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="rounded-xl overflow-hidden my-4 shadow-sm border border-black/5 bg-black/5">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-black/5 bg-white/50">
                        <span className="text-xs font-medium text-muted-foreground">{match[1]}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            ) : (
                <code className="bg-pastel-purple/10 text-pastel-purple px-1.5 py-0.5 rounded-md text-sm font-mono font-bold border border-pastel-purple/20" {...props}>
                    {children}
                </code>
            );
        },
        ul({ children }: any) {
            return <ul className="space-y-2 my-4 ml-0 pl-0">{children}</ul>;
        },
        li({ children }: any) {
            return (
                <li className="flex items-start gap-2.5">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-pastel-purple shrink-0" />
                    <span className="flex-1 leading-relaxed">{children}</span>
                </li>
            );
        },
        strong({ children }: any) {
            return <strong className="font-extrabold text-foreground">{children}</strong>;
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-black/5 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-gradient-to-br from-pastel-purple/30 to-pastel-blue/30 text-pastel-purple"><Bot className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-white"></span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-foreground">赛博军师</h1>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pastel-blue animate-pulse"></span>
                            DeepSeek V3 • Always Online
                        </p>
                    </div>
                </div>

                {/* Profile Switcher */}
                <div className="relative" id="profile-menu-container">
                    <Button
                        variant="ghost"
                        className={cn(
                            "flex items-center gap-3 pl-2 pr-4 py-2 h-auto rounded-full border transition-all duration-300",
                            isProfileMenuOpen
                                ? "bg-black/5 border-black/10"
                                : "bg-white/50 border-black/5 hover:bg-white/80 hover:border-black/10"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                            currentProfile?.avatarColor || "bg-gradient-to-br from-pastel-pink to-pastel-purple"
                        )}>
                            {currentProfile?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-bold text-foreground leading-none">{currentProfile?.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{currentProfile?.stage}</p>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isProfileMenuOpen && "rotate-180")} />
                    </Button>

                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl overflow-hidden p-2"
                            >
                                <div className="max-h-[300px] overflow-y-auto space-y-1">
                                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground">切换档案</p>
                                    {profiles.map(profile => (
                                        <button
                                            key={profile.id}
                                            onClick={() => {
                                                selectProfile(profile.id);
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded-xl transition-colors",
                                                currentProfile?.id === profile.id
                                                    ? "bg-pastel-purple/10"
                                                    : "hover:bg-black/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0",
                                                profile.avatarColor || "bg-gradient-to-br from-pastel-pink to-pastel-purple"
                                            )}>
                                                {profile.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className={cn("text-sm font-bold truncate", currentProfile?.id === profile.id ? "text-pastel-purple" : "text-foreground")}>
                                                    {profile.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">{profile.stage}</p>
                                            </div>
                                            {currentProfile?.id === profile.id && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pastel-purple" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-px bg-black/5 my-2" />
                                <button
                                    onClick={() => {
                                        if (onManageProfiles) {
                                            onManageProfiles();
                                        } else {
                                            clearCurrentProfile();
                                        }
                                        setIsProfileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                                        <Settings className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">管理档案 / 新建</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4" ref={scrollAreaRef}>
                <div className="space-y-8 max-w-3xl mx-auto py-8 px-4">
                    <AnimatePresence mode="wait">
                        {messages.length === 0 && !isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full space-y-10 py-12">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative"
                                >
                                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-pastel-purple/20 to-pastel-blue/20 flex items-center justify-center border-4 border-white shadow-xl relative z-10">
                                        <Bot className="h-16 w-16 text-pastel-purple" />
                                    </div>
                                    <div className="absolute inset-0 bg-pastel-purple/20 blur-3xl rounded-full -z-10 transform scale-150" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-4 border border-dashed border-pastel-purple/30 rounded-full z-0"
                                    />
                                </motion.div>

                                <div className="text-center space-y-3">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        准备好更懂 {currentProfile?.name} 了吗？
                                    </h2>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        我是你的赛博军师。解读心思、复盘相处、规划行动，为你出谋划策。
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                                    {[
                                        { icon: Brain, label: "解读心思", desc: "分析言行背后的真实含义", prompt: "帮我分析一下她这句话是什么意思：" },
                                        { icon: Search, label: "关系复盘", desc: "诊断相处中的问题与隐患", prompt: "我想复盘一下我们最近的关系，情况是这样的：" },
                                        { icon: Compass, label: "行动指南", desc: "当前阶段的具体行动建议", prompt: "我现在应该怎么做比较好？目前的情况是：" },
                                        { icon: Target, label: "长期规划", desc: "制定关系推进的整体策略", prompt: "我想和她长期发展，请帮我规划一下：" }
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 + 0.3 }}
                                            onClick={() => setInput(item.prompt)}
                                            className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/50 hover:border-pastel-purple/30 shadow-sm hover:shadow-md transition-all text-left group"
                                        >
                                            <div className="p-2.5 rounded-xl bg-pastel-purple/10 text-pastel-purple group-hover:bg-pastel-purple group-hover:text-white transition-colors">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-foreground group-hover:text-pastel-purple transition-colors">{item.label}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-4 group",
                                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <Avatar className={cn(
                                            "h-8 w-8 mt-1 shadow-sm transition-opacity duration-300"
                                        )}>
                                            <AvatarFallback className={cn(
                                                "text-xs font-bold",
                                                msg.role === "user" ? "bg-pastel-blue text-white" : "bg-white text-pastel-purple border border-black/5"
                                            )}>
                                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                                            <div
                                                className={cn(
                                                    "rounded-2xl px-6 py-3.5 text-[15px] shadow-sm leading-relaxed transition-all duration-300",
                                                    msg.role === "user"
                                                        ? "bg-pastel-purple/60 text-white rounded-tr-sm shadow-sm user-bubble"
                                                        : "bg-white/80 border border-white/50 text-foreground rounded-tl-sm backdrop-blur-sm"
                                                )}
                                            >
                                                <div className="prose prose-sm max-w-none break-words">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={markdownComponents}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/50 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="flex gap-4 group flex-row"
                                    >
                                        <Avatar className="h-8 w-8 mt-1 shadow-sm">
                                            <AvatarFallback className="bg-white text-pastel-purple border border-black/5">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1 max-w-[85%] items-start">
                                            <div className="rounded-2xl px-6 py-3.5 text-[15px] shadow-sm leading-relaxed bg-white/80 border border-white/50 text-foreground rounded-tl-sm backdrop-blur-sm">
                                                <div className="prose prose-sm max-w-none break-words">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={markdownComponents}
                                                    >
                                                        {displayedContent}
                                                    </ReactMarkdown>
                                                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-pastel-purple animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 pb-8 z-10">
                <div className="max-w-3xl mx-auto relative">
                    <div className="relative flex items-center gap-2 bg-white/50 backdrop-blur-xl border border-white/30 rounded-full p-2 shadow-sm shadow-black/5 transition-all duration-300 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/10 focus-within:bg-white/90">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="给赛博军师发送消息..."
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 px-6 py-3 h-auto text-base placeholder:text-muted-foreground/50 text-foreground"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={isLoading ? stopGeneration : handleSendMessage}
                            disabled={!isLoading && !input.trim()}
                            size="icon"
                            className={cn(
                                "rounded-full h-11 w-11 shrink-0 transition-all duration-300 shadow-md",
                                isLoading
                                    ? "bg-red-500 hover:bg-red-600 text-white hover:scale-105 hover:shadow-red-500/25"
                                    : input.trim()
                                        ? "bg-gradient-to-r from-pastel-pink to-pastel-purple text-white hover:scale-105 hover:shadow-pastel-purple/25"
                                        : "bg-black/5 text-muted-foreground/40"
                            )}
                        >
                            {isLoading ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
