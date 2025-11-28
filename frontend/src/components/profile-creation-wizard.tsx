"use client";

import { useState, useRef, useEffect } from "react";
import { useProfile, RelationshipStage } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Send, Sparkles, Heart, User, Coffee, Wine, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProfileCreationWizardProps {
    onCancel: () => void;
    onComplete: () => void;
}

const STAGES: { id: RelationshipStage; label: string; icon: any; color: string; desc: string }[] = [
    { id: "Stranger", label: "陌生人", icon: User, color: "bg-gray-100 text-gray-600", desc: "刚认识或还没见过面" },
    { id: "Acquaintance", label: "点头之交", icon: Coffee, color: "bg-orange-100 text-orange-600", desc: "偶尔聊几句" },
    { id: "Friend", label: "普通朋友", icon: User, color: "bg-blue-100 text-blue-600", desc: "纯友谊" },
    { id: "Close Friend", label: "好朋友", icon: User, color: "bg-indigo-100 text-indigo-600", desc: "关系很铁" },
    { id: "Situationship", label: "暧昧中", icon: Wine, color: "bg-purple-100 text-purple-600", desc: "友达以上，恋人未满" },
    { id: "Girlfriend", label: "女朋友", icon: Heart, color: "bg-red-100 text-red-600", desc: "正式交往" },
];

export function ProfileCreationWizard({ onCancel, onComplete }: ProfileCreationWizardProps) {
    const { addProfile } = useProfile();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedStage, setSelectedStage] = useState<RelationshipStage | null>(null);
    const [name, setName] = useState("");

    // Chat State for Step 2
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    // Auto-scroll
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const sendMessage = async (content: string, isHiddenInit: boolean = false) => {
        if (!content.trim()) return;

        // Abort previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        if (!isHiddenInit) {
            setMessages(prev => [...prev, { role: "user", content }]);
            setInput("");
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    session_id: sessionId
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error("Failed to send message");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.session_id && !sessionId) {
                            setSessionId(data.session_id);
                        }

                        if (data.type === 'answer') {
                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMessageIndex = newMessages.length - 1;
                                const lastMessage = newMessages[lastMessageIndex];

                                if (lastMessage && lastMessage.role === 'assistant') {
                                    // Create a new object to avoid mutation
                                    newMessages[lastMessageIndex] = {
                                        ...lastMessage,
                                        content: (lastMessage.content || '') + data.content
                                    };
                                }
                                return newMessages;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing chunk", e);
                    }
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error:", error);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // Initialize Chat when entering Step 2
    useEffect(() => {
        if (step === 2 && !hasInitialized.current && selectedStage) {
            hasInitialized.current = true;
            const stageLabel = STAGES.find(s => s.id === selectedStage)?.label || selectedStage;
            const initialPrompt = `我现在处于\"${stageLabel}\"阶段。请用中文问我3-5个开放式问题，帮助分析她的类型（通过六大人格特征来判断）。

重要规则：
1. 每次只问一个问题
2. 不要提供明确的字母选项（A/B/C/D）
3. 在问完至少3个对于不同特征的问题并得到我的回答之前，不要给出任何分析或结论
4. 如果上一个问题不容易帮助判断，可以找一个对于相同特征的不同问题来问这一个
5. 问题要像知识库中一样，具体而且帮助用户容易回答
6. 1-2问题判断测试/投资型，1-2问题判断理性/感性型，1-2问题判断合理解释/回避型

现在开始第一个问题。`;

            sendMessage(initialPrompt, true);
        }

        // Cleanup on unmount or when leaving step 2
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, [step, selectedStage]);

    const handleFinish = () => {
        if (!selectedStage || !name) return;

        // Get the last assistant message (should contain the analysis)
        const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();
        const fullAnalysis = lastAssistantMessage?.content || "暂无描述。";

        // Extract personality type from the analysis
        // Look for common patterns like "测试型", "投资型", "理智型", "感性型" etc.
        const personalityType = fullAnalysis.match(/(测试|投资|理智|感性|合理解释|回避)型/g)?.join('、') || "";

        addProfile({
            name: name,
            stage: selectedStage,
            description: fullAnalysis.slice(0, 150) + (fullAnalysis.length > 150 ? "..." : ""),
            personalityType: personalityType,
            avatarColor: STAGES.find(s => s.id === selectedStage)?.color.split(" ")[0] || "bg-gray-100"
        });

        onComplete();
    };

    return (
        <div className="h-full w-full flex flex-col bg-white/50 backdrop-blur-xl relative overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-black/5 bg-white/50">
                <Button variant="ghost" onClick={step === 1 ? onCancel : () => setStep(1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {step === 1 ? "取消" : "返回"}
                </Button>
                <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full transition-all duration-300", step === 1 ? "bg-pastel-purple w-8" : "bg-black/10")} />
                    <span className={cn("h-2 w-2 rounded-full transition-all duration-300", step === 2 ? "bg-pastel-purple w-8" : "bg-black/10")} />
                </div>
                <div className="w-20" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full overflow-y-auto p-8"
                        >
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold">你们现在的关系阶段是？</h2>
                                    <p className="text-muted-foreground">选择最能描述当前状况的卡片。</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {STAGES.map((stage) => (
                                        <button
                                            key={stage.id}
                                            onClick={() => setSelectedStage(stage.id)}
                                            className={cn(
                                                "relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02]",
                                                selectedStage === stage.id
                                                    ? "border-pastel-purple bg-pastel-purple/5 shadow-md"
                                                    : "border-transparent bg-white shadow-sm hover:shadow-md"
                                            )}
                                        >
                                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", stage.color)}>
                                                <stage.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{stage.label}</h3>
                                            <p className="text-sm text-muted-foreground">{stage.desc}</p>

                                            {selectedStage === stage.id && (
                                                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-pastel-purple flex items-center justify-center">
                                                    <Sparkles className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="max-w-md mx-auto pt-8">
                                    <label className="block text-sm font-medium mb-2">她的名字（或昵称）</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="例如：小美"
                                        className="h-12 text-lg"
                                    />
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedStage || !name}
                                        className="h-12 px-8 rounded-full bg-pastel-purple hover:bg-pastel-purple/90 text-white shadow-lg shadow-pastel-purple/25"
                                    >
                                        下一步 <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
                                <div className="max-w-2xl mx-auto space-y-6 py-8">
                                    <div className="text-center mb-8">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pastel-pink to-pastel-purple mx-auto flex items-center justify-center shadow-lg shadow-pastel-pink/20 mb-4">
                                            <Sparkles className="h-8 w-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold">AI 分析</h2>
                                        <p className="text-muted-foreground">回答几个问题，帮我们更好地了解她。</p>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                                            >
                                                <div className={cn(
                                                    "max-w-[80%] rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm",
                                                    msg.role === "user"
                                                        ? "bg-pastel-purple/80 text-white rounded-tr-sm"
                                                        : "bg-white border border-black/5 text-foreground rounded-tl-sm"
                                                )}>
                                                    <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                                a: ({ node, ...props }) => <a className="text-pastel-purple hover:underline" {...props} />,
                                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {isLoading && (
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm ml-4">
                                            <Sparkles className="h-4 w-4 animate-spin" />
                                            思考中...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-white/80 backdrop-blur-md border-t border-black/5 z-10">
                                <div className="max-w-2xl mx-auto flex gap-3">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                                        placeholder="输入你的回答..."
                                        className="flex-1 h-12 bg-white"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={() => sendMessage(input)}
                                        disabled={!input.trim() || isLoading}
                                        size="icon"
                                        className="h-12 w-12 rounded-xl bg-pastel-purple hover:bg-pastel-purple/90 text-white"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="max-w-2xl mx-auto mt-4 flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">建议至少回答3个问题以获得更好的结果。</p>
                                    <Button
                                        onClick={handleFinish}
                                        variant="outline"
                                        className="border-pastel-purple text-pastel-purple hover:bg-pastel-purple/10"
                                    >
                                        完成并创建档案
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
