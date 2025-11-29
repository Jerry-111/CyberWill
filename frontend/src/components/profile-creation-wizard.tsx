"use client";

import { useState, useRef, useEffect } from "react";
import { useProfile, RelationshipStage } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check, Sparkles, Heart, User, Coffee, Wine, Gift, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ProfileAnalysisView } from "@/components/profile-analysis-view";

interface ProfileCreationWizardProps {
    onCancel: () => void;
    onComplete: () => void;
}

const STAGES: { id: RelationshipStage; label: string; icon: any; color: string; desc: string }[] = [
    { id: "Stranger", label: "陌生人", icon: User, color: "bg-gray-100 text-gray-600", desc: "刚认识或还没见过面" },
    { id: "Acquaintance", label: "点头之交", icon: Coffee, color: "bg-orange-100 text-orange-600", desc: "偶尔聊几句" },
    { id: "Friend", label: "普通朋友", icon: User, color: "bg-blue-100 text-blue-600", desc: "纯友谊" },
    { id: "Close Friend", label: "好朋友", icon: User, color: "bg-indigo-100 text-indigo-600", desc: "关系很好" },
    { id: "Situationship", label: "暧昧中", icon: Wine, color: "bg-purple-100 text-purple-600", desc: "友达以上，恋人未满" },
    { id: "Girlfriend", label: "女朋友", icon: Heart, color: "bg-red-100 text-red-600", desc: "正式交往" },
];

// Questions Configuration
const QUESTIONS = [
    // Group 1: Investment (Left) vs Test (Right)
    {
        id: 1,
        text: "她是一个怎样的人",
        weight: 0.37,
        category: "investment",
        left: "专注的投入某个兴趣的人（投资型）",
        right: "兴趣广泛，什么都想尝试的人（测试型）"
    },
    {
        id: 2,
        text: "当她和某人分手时",
        weight: 0.23,
        category: "investment",
        left: "通常让自己的情绪深陷其中，很难抽身出来",
        right: "虽然觉得受伤，但一旦下定决心，就会直截了当地将过去恋人的影子甩开"
    },
    {
        id: 3,
        text: "关于她的社交圈",
        weight: 0.2,
        category: "investment",
        left: "朋友圈子比较固定，深交的朋友多",
        right: "朋友圈子很广，认识各种各样的人"
    },
    {
        id: 4,
        text: "对待新事物的态度",
        weight: 0.15,
        category: "investment",
        left: "比较谨慎，喜欢深入研究后再尝试",
        right: "充满好奇，喜欢先尝试再说"
    },
    {
        id: 5,
        text: "在感情中的表现",
        weight: 0.25,
        category: "investment",
        left: "倾向于长期稳定的关系，愿意付出",
        right: "倾向于体验和感觉，不合适就换"
    },

    // Group 2: Rational (Left) vs Emotional (Right)
    {
        id: 6,
        text: "做决定时",
        weight: 0.3,
        category: "rationality",
        left: "更看重逻辑和事实",
        right: "更看重感觉和直觉"
    },
    {
        id: 7,
        text: "面对冲突时",
        weight: 0.25,
        category: "rationality",
        left: "试图讲道理，分析对错",
        right: "情绪激动，表达感受"
    },
    {
        id: 8,
        text: "安慰别人时",
        weight: 0.2,
        category: "rationality",
        left: "提供解决方案和建议",
        right: "给予情感支持和共情"
    },
    {
        id: 9,
        text: "日常生活中",
        weight: 0.15,
        category: "rationality",
        left: "做事有计划，条理清晰",
        right: "比较随性，跟着感觉走"
    },
    {
        id: 10,
        text: "看电影或读书时",
        weight: 0.2,
        category: "rationality",
        left: "关注剧情逻辑和结构",
        right: "关注人物情感和氛围"
    },

    // Group 3: Rationalization (Left) vs Avoidant (Right)
    {
        id: 11,
        text: "遇到不开心的事情",
        weight: 0.3,
        category: "conflict",
        left: "会找理由说服自己接受",
        right: "会选择逃避，不想面对"
    },
    {
        id: 12,
        text: "面对压力时",
        weight: 0.25,
        category: "conflict",
        left: "试图分析原因，寻找合理性",
        right: "想要躲起来，暂时断联"
    },
    {
        id: 13,
        text: "关于承诺",
        weight: 0.2,
        category: "conflict",
        left: "会解释为什么做不到",
        right: "会回避做出承诺"
    },
    {
        id: 14,
        text: "被批评时",
        weight: 0.2,
        category: "conflict",
        left: "会辩解，证明自己是对的",
        right: "沉默不语，拒绝沟通"
    },
    {
        id: 15,
        text: "处理过去的回忆",
        weight: 0.15,
        category: "conflict",
        left: "会赋予它某种意义",
        right: "尽量不去想，封存起来"
    },
];

export function ProfileCreationWizard({ onCancel, onComplete }: ProfileCreationWizardProps) {
    const { addProfile } = useProfile();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedStage, setSelectedStage] = useState<RelationshipStage | null>(null);
    const [name, setName] = useState("");

    // Questionnaire State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: number; scoreDelta: number }[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

    // Analysis Result
    const [analysisResult, setAnalysisResult] = useState<{
        archetype: string;
        analysis: string;
        traits: {
            investment: "测试" | "投资";
            rationality: "感性" | "理性";
            conflict: "回避" | "合理解释";
        }
    } | null>(null);

    const handleAnswer = (option: 'left' | 'middle' | 'right') => {
        const question = QUESTIONS[currentQuestionIdx];
        let scoreDelta = 0;

        if (option === 'left') scoreDelta = question.weight;
        else if (option === 'right') scoreDelta = -question.weight;
        // middle is 0

        setAnswers(prev => [...prev, { questionId: question.id, scoreDelta }]);

        if (currentQuestionIdx < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 200); // Small delay for visual feedback
        } else {
            finishWizard([...answers, { questionId: question.id, scoreDelta }]);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            if (currentQuestionIdx > 0) {
                setCurrentQuestionIdx(prev => prev - 1);
                setAnswers(prev => prev.slice(0, -1));
            } else {
                setStep(1);
            }
        } else if (step === 3) {
            // If going back from result, maybe just reset to step 2 start? Or warn user?
            // For now, let's go back to step 2 start
            setStep(2);
            setCurrentQuestionIdx(0);
            setAnswers([]);
            setAnalysisResult(null);
        } else {
            onCancel();
        }
    };

    const finishWizard = async (finalAnswers: { questionId: number; scoreDelta: number }[]) => {
        setIsCalculating(true);

        // Calculate scores
        const scores = {
            investment: 0,
            rationality: 0,
            conflict: 0
        };

        finalAnswers.forEach(ans => {
            const question = QUESTIONS.find(q => q.id === ans.questionId);
            if (question) {
                scores[question.category as keyof typeof scores] += ans.scoreDelta;
            }
        });

        // Determine Traits
        const traits = {
            investment: (scores.investment > 0 ? "投资" : "测试") as "投资" | "测试",
            rationality: (scores.rationality > 0 ? "理性" : "感性") as "理性" | "感性",
            conflict: (scores.conflict > 0 ? "合理解释" : "回避") as "合理解释" | "回避"
        };

        try {
            // Call Backend for Analysis
            const response = await fetch('http://127.0.0.1:8000/analyze-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    stage: selectedStage,
                    traits: traits
                })
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const data = await response.json();

            const result = {
                archetype: data.archetype,
                analysis: data.analysis,
                traits: traits
            };

            setAnalysisResult(result);

            // Auto-save the profile immediately
            if (selectedStage) {
                const newId = addProfile({
                    name: name,
                    stage: selectedStage,
                    description: result.analysis,
                    traits: result.traits,
                    archetype: result.archetype,
                    avatarColor: STAGES.find(s => s.id === selectedStage)?.color.split(" ")[0] || "bg-gray-100"
                });
                setCreatedProfileId(newId);
            }

            setStep(3);
        } catch (error) {
            console.error("Analysis error:", error);
            // Fallback if API fails
            const fallbackResult = {
                archetype: "未知类型",
                analysis: "无法连接到分析服务器，但我们已经记录了她的性格特征。",
                traits: traits
            };
            setAnalysisResult(fallbackResult);

            // Auto-save fallback
            if (selectedStage) {
                const newId = addProfile({
                    name: name,
                    stage: selectedStage,
                    description: fallbackResult.analysis,
                    traits: fallbackResult.traits,
                    archetype: fallbackResult.archetype,
                    avatarColor: STAGES.find(s => s.id === selectedStage)?.color.split(" ")[0] || "bg-gray-100"
                });
                setCreatedProfileId(newId);
            }

            setStep(3);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleCreateProfile = () => {
        onComplete();
    };

    const currentQuestion = QUESTIONS[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / QUESTIONS.length) * 100;

    return (
        <div className="h-full w-full flex flex-col bg-white/50 backdrop-blur-xl relative overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-black/5 bg-white/50">
                <Button variant="ghost" onClick={handleBack} className="gap-2" disabled={isCalculating}>
                    <ArrowLeft className="h-4 w-4" />
                    {step === 1 ? "取消" : "返回"}
                </Button>
                <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full transition-all duration-300", step >= 1 ? "bg-pastel-purple w-8" : "bg-black/10")} />
                    <span className={cn("h-2 w-2 rounded-full transition-all duration-300", step >= 2 ? "bg-pastel-purple w-8" : "bg-black/10")} />
                    <span className={cn("h-2 w-2 rounded-full transition-all duration-300", step >= 3 ? "bg-pastel-purple w-8" : "bg-black/10")} />
                </div>
                <div className="w-20" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {step === 1 && (
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
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col items-center justify-center p-6"
                        >
                            {isCalculating ? (
                                <div className="text-center space-y-6">
                                    <div className="relative">
                                        <div className="h-24 w-24 mx-auto rounded-full border-4 border-pastel-purple/20 border-t-pastel-purple animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="h-8 w-8 text-pastel-purple animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold">正在深入分析...</h3>
                                        <p className="text-muted-foreground">AI 正在根据你的回答构建 {name} 的人格模型</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-3xl space-y-8">
                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                            <span>问题 {currentQuestionIdx + 1} / {QUESTIONS.length}</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-pastel-purple"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Question Card */}
                                    <div className="text-center space-y-4 mb-8">
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{currentQuestion.text}</h2>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Left Option */}
                                        <button
                                            onClick={() => handleAnswer('left')}
                                            className="group relative p-6 h-auto min-h-[200px] rounded-2xl bg-white border-2 border-transparent hover:border-pastel-purple/50 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-pastel-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-xl font-bold text-pastel-purple">A</span>
                                            </div>
                                            <p className="font-medium text-foreground/80 group-hover:text-foreground">{currentQuestion.left}</p>
                                        </button>

                                        {/* Middle Option */}
                                        <button
                                            onClick={() => handleAnswer('middle')}
                                            className="group relative p-6 h-auto min-h-[200px] rounded-2xl bg-white border-2 border-transparent hover:border-gray-400/50 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <HelpCircle className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-foreground/80 group-hover:text-foreground">未知 / 不确定</p>
                                        </button>

                                        {/* Right Option */}
                                        <button
                                            onClick={() => handleAnswer('right')}
                                            className="group relative p-6 h-auto min-h-[200px] rounded-2xl bg-white border-2 border-transparent hover:border-pastel-blue/50 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-pastel-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-xl font-bold text-pastel-blue">B</span>
                                            </div>
                                            <p className="font-medium text-foreground/80 group-hover:text-foreground">{currentQuestion.right}</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && analysisResult && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full w-full"
                        >
                            <ProfileAnalysisView
                                profile={{
                                    id: createdProfileId || "temp",
                                    name: name,
                                    stage: selectedStage || "Stranger",
                                    traits: analysisResult.traits,
                                    archetype: analysisResult.archetype,
                                    description: analysisResult.analysis,
                                    avatarColor: STAGES.find(s => s.id === selectedStage)?.color.split(" ")[0] || "bg-gray-100",
                                    createdAt: Date.now()
                                }}
                                onStartChat={handleCreateProfile}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
