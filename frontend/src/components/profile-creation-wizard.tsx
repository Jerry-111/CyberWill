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
import { getApiUrl } from "@/lib/api-config";

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
    // Group 1: Investment vs Test
    {
        id: 1,
        text: "和很多朋友在一起时",
        category: "investment",
        options: [
            { text: "通常只和一到两个朋友交流", type: "investment", weight: 0.5 },
            { text: "通常会能够照顾到每个人的情绪雨露均沾", type: "test", weight: 0.5 }
        ]
    },
    {
        id: 2,
        text: "她是一个怎样的人",
        category: "investment",
        options: [
            { text: "专注的投入某个兴趣的人", type: "investment", weight: 0.35 },
            { text: "兴趣广泛，什么都想尝试的人", type: "test", weight: 0.35 }
        ]
    },
    {
        id: 3,
        text: "她周末一般怎么过",
        category: "investment",
        options: [
            { text: "要么自己充电，要么就和固定几个人一起。比较稳定的圈子，很少“乱约”、不太爱到处社交。", type: "investment", weight: 0.4 },
            { text: "约朋友吃饭、唱歌、认识新朋友挺多的。安排很多、经常换不同局、总说“看心情，谁约我我就出去”", type: "test", weight: 0.4 }
        ]
    },
    {
        id: 4,
        text: "朋友圈/微博发的内容",
        category: "investment",
        options: [
            { text: "朋友圈发的少且干净。", type: "investment", weight: 0.6 },
            { text: "经常发自拍有明显的钓鱼倾向。", type: "test", weight: 0.6 }
        ]
    },
    {
        id: 5,
        text: "在社交场合，她通常是？",
        category: "investment",
        options: [
            { text: "很难和不认识的人进行交谈", type: "investment", weight: 0.7 },
            { text: "很容易和多数人谈笑风生", type: "test", weight: 0.7 }
        ]
    },
    {
        id: 6,
        text: "当她决定吃什么的时候",
        category: "investment",
        options: [
            { text: "先看看有没有吃过的", type: "investment", weight: 0.3 },
            { text: "先看看有没有没吃过的新奇的", type: "test", weight: 0.3 }
        ]
    },

    // Group 2: Rational vs Emotional
    {
        id: 7,
        text: "她对于未来想要的生活清楚嘛？",
        category: "rationality",
        options: [
            { text: "对未来有着清晰的认知和追求，愿意制定详细的计划并且亲自去实施。", type: "rational", weight: 0.3 },
            { text: "不太清楚，对未来虽然有要求，但是没有具体的目标和计划，会要求伴侣来达成。", type: "emotional", weight: 0.3 }
        ]
    },
    {
        id: 8,
        text: "认识她的人倾向形容她为：",
        category: "rationality",
        options: [
            { text: "逻辑和明确。", type: "rational", weight: 0.6 },
            { text: "热情和敏感。", type: "emotional", weight: 0.6 }
        ]
    },
    {
        id: 9,
        text: "她的MBTI",
        category: "rationality",
        options: [
            { text: "有 T (Thinking) 理智", type: "rational", weight: 0.5 },
            { text: "有 F (Feeling) 感觉", type: "emotional", weight: 0.5 }
        ]
    },
    {
        id: 10,
        text: "当她谈论她不喜欢的事情或人时",
        category: "rationality",
        options: [
            { text: "客观评价并且带有逻辑的评价", type: "rational", weight: 0.47 },
            { text: "谈情绪大于谈事实（我喜欢，我讨厌）", type: "emotional", weight: 0.47 }
        ]
    },
    {
        id: 11,
        text: "遇到一个重要决定（选专业 / 换工作 / 搬家）时，她会？",
        category: "rationality",
        options: [
            { text: "先列优缺点、未来发展、风险，想清楚再决定", type: "rational", weight: 0.4 },
            { text: "先看自己的感觉：开不开心、喜不喜欢、合不合心意", type: "emotional", weight: 0.4 }
        ]
    },
    {
        id: 12,
        text: "聊天话题重心",
        category: "rationality",
        options: [
            { text: "更容易聊学习/专业/工作、行业、目标、规划。会问你：学什么的？打算以后做什么？现在在忙什么项目？", type: "rational", weight: 0.4 },
            { text: "聊感情、星座、韩剧、八卦、谁喜欢谁、谁分手了。很容易聊到“理想型”“恋爱故事”“最浪漫的事”", type: "emotional", weight: 0.4 }
        ]
    },
    {
        id: 13,
        text: "表达方式",
        category: "rationality",
        options: [
            { text: "文字偏简洁，少用特别夸张的表情。说话会带一点分析：“我觉得这件事分几块…”、“从长远看……”", type: "rational", weight: 0.45 },
            { text: "表情包多、语气词多（哈哈哈、emmm、哎呀之类）。情绪起伏明显，开心不开心都写在字里行间", type: "emotional", weight: 0.45 }
        ]
    },

    // Group 3: Openness (Rationalization vs Avoidant)
    {
        id: 14,
        text: "朋友圈照片",
        category: "openness",
        options: [
            { text: "有很多性感的照片", type: "rationalization", weight: 0.6 },
            { text: "没有什么个人照或者穿着保守", type: "avoidant", weight: 0.6 }
        ]
    },
    {
        id: 15,
        text: "对待异性",
        category: "openness",
        options: [
            { text: "没有太大差别", type: "rationalization", weight: 0.5 },
            { text: "和对待同性有明显差别", type: "avoidant", weight: 0.5 }
        ]
    },
    {
        id: 16,
        text: "她会主动开带点颜色的玩笑吗？",
        category: "openness",
        options: [
            { text: "会，偶尔", type: "rationalization", weight: 0.3 },
            { text: "从不", type: "avoidant", weight: 0.3 }
        ]
    },
    {
        id: 17,
        text: "她能否自然的谈论她之前的感情",
        category: "openness",
        options: [
            { text: "可以", type: "rationalization", weight: 0.2 },
            { text: "不可以", type: "avoidant", weight: 0.2 }
        ]
    }
];

export function ProfileCreationWizard({ onCancel, onComplete }: ProfileCreationWizardProps) {
    const { addProfile } = useProfile();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedStage, setSelectedStage] = useState<RelationshipStage | null>(null);
    const [name, setName] = useState("");

    // Questionnaire State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: number; type: string; weight: number }[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

    // Analysis Result
    const [analysisResult, setAnalysisResult] = useState<{
        archetype: string;
        analysis: string;
        traits: {
            investment: "测试" | "投资";
            rationality: "感性" | "理性";
            openness: "回避" | "合理解释";
        }
    } | null>(null);

    const handleAnswer = (optionIndex: number) => {
        const question = QUESTIONS[currentQuestionIdx];
        const selectedOption = question.options[optionIndex];

        if (!selectedOption) {
            // Handle "Unknown/Unsure" - Middle option
            setAnswers(prev => [...prev, { questionId: question.id, type: "unknown", weight: 0 }]);
        } else {
            setAnswers(prev => [...prev, { questionId: question.id, type: selectedOption.type, weight: selectedOption.weight }]);
        }

        if (currentQuestionIdx < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 200);
        } else {
            finishWizard([...answers, { questionId: question.id, type: selectedOption ? selectedOption.type : "unknown", weight: selectedOption ? selectedOption.weight : 0 }]);
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
            setStep(2);
            setCurrentQuestionIdx(0);
            setAnswers([]);
            setAnalysisResult(null);
        } else {
            onCancel();
        }
    };

    const finishWizard = async (finalAnswers: { questionId: number; type: string; weight: number }[]) => {
        setIsCalculating(true);

        // Calculate Weighted Scores
        const scores = {
            investment: 0,
            test: 0,
            rational: 0,
            emotional: 0,
            rationalization: 0,
            avoidant: 0
        };

        finalAnswers.forEach(ans => {
            if (ans.type !== "unknown" && ans.type in scores) {
                scores[ans.type as keyof typeof scores] += ans.weight;
            }
        });

        // Determine Traits by comparing scores
        const traits = {
            investment: (scores.investment >= scores.test ? "投资" : "测试") as "投资" | "测试",
            rationality: (scores.rational >= scores.emotional ? "理性" : "感性") as "理性" | "感性",
            openness: (scores.rationalization >= scores.avoidant ? "合理解释" : "回避") as "合理解释" | "回避"
        };

        try {
            const response = await fetch(`${getApiUrl()}/analyze-profile`, {
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
            const fallbackResult = {
                archetype: "未知类型",
                analysis: "无法连接到分析服务器，但我们已经记录了她的性格特征。",
                traits: traits
            };
            setAnalysisResult(fallbackResult);

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
                                <div className="w-full max-w-4xl space-y-8">
                                    {/* Progress */}
                                    <div className="max-w-2xl mx-auto space-y-2">
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
                                    <div className="text-center space-y-6 mb-8 max-w-2xl mx-auto">
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{currentQuestion.text}</h2>
                                    </div>

                                    {/* Options - Responsive Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Option A */}
                                        <button
                                            onClick={() => handleAnswer(0)}
                                            className="group relative p-8 rounded-3xl bg-white/60 hover:bg-white border-2 border-transparent hover:border-pastel-purple/50 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-6 h-full min-h-[240px] justify-center backdrop-blur-sm"
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-pastel-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="text-2xl font-bold text-pastel-purple">A</span>
                                            </div>
                                            <p className="text-lg font-medium text-foreground/90 group-hover:text-foreground leading-relaxed">
                                                {currentQuestion.options[0].text}
                                            </p>
                                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pastel-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </button>

                                        {/* Option B */}
                                        <button
                                            onClick={() => handleAnswer(1)}
                                            className="group relative p-8 rounded-3xl bg-white/60 hover:bg-white border-2 border-transparent hover:border-pastel-blue/50 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-6 h-full min-h-[240px] justify-center backdrop-blur-sm"
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-pastel-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="text-2xl font-bold text-pastel-blue">B</span>
                                            </div>
                                            <p className="text-lg font-medium text-foreground/90 group-hover:text-foreground leading-relaxed">
                                                {currentQuestion.options[1].text}
                                            </p>
                                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pastel-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </button>
                                    </div>

                                    {/* Navigation Actions */}
                                    <div className="flex items-center justify-center gap-6 pt-8">
                                        <button
                                            onClick={() => {
                                                if (currentQuestionIdx > 0) {
                                                    setCurrentQuestionIdx(prev => prev - 1);
                                                    setAnswers(prev => prev.slice(0, -1));
                                                }
                                            }}
                                            disabled={currentQuestionIdx === 0}
                                            className={cn(
                                                "text-base font-medium px-8 py-4 rounded-full transition-all duration-200 flex items-center gap-3",
                                                currentQuestionIdx === 0
                                                    ? "text-muted-foreground/50 cursor-not-allowed"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 active:scale-95"
                                            )}
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                            <span>上一题</span>
                                        </button>

                                        <div className="h-8 w-px bg-black/10" />

                                        <button
                                            onClick={() => handleAnswer(-1)}
                                            className="text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-3 px-8 py-4 rounded-full hover:bg-black/5 active:scale-95"
                                        >
                                            <HelpCircle className="h-5 w-5" />
                                            <span>跳过 / 不确定</span>
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
