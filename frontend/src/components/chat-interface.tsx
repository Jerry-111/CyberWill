"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, MoreHorizontal, Square } from "lucide-react";
import { useChatStream } from "@/hooks/useChatStream";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export function ChatInterface() {
    const { messages, input, setInput, isLoading, sendMessage, stopGeneration } = useChatStream();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [displayedContent, setDisplayedContent] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, displayedContent]);

    // Smooth Typing Logic
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === "assistant" && isLoading) {
            setIsTyping(true);
            let currentText = displayedContent;
            const targetText = lastMessage.content;

            if (targetText.length > currentText.length) {
                const distance = targetText.length - currentText.length;
                // Adaptive speed: faster if we are far behind to prevent broken markdown
                const delay = distance > 10 ? 2 : 8;

                const timeoutId = setTimeout(() => {
                    setDisplayedContent(targetText.slice(0, currentText.length + 1));
                }, delay);
                return () => clearTimeout(timeoutId);
            }
        } else if (lastMessage?.role === "assistant" && !isLoading) {
            // Ensure full content is displayed when loading stops
            setDisplayedContent(lastMessage.content);
            setIsTyping(false);
        } else {
            setDisplayedContent("");
            setIsTyping(false);
        }
    }, [messages, isLoading, displayedContent]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
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
            <div className="px-8 py-6 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-gradient-to-br from-pastel-purple/30 to-pastel-blue/30 text-pastel-purple"><Bot className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-white"></span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-foreground">赛博教练</h1>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pastel-blue animate-pulse"></span>
                            DeepSeek V3 • Always Online
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4" ref={scrollAreaRef}>
                <div className="space-y-8 max-w-3xl mx-auto py-8 px-4">
                    <AnimatePresence mode="wait">
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="flex flex-col items-center justify-center h-[50vh] text-center space-y-8"
                            >
                                <div className="h-24 w-24 rounded-[2rem] bg-white/50 flex items-center justify-center shadow-xl shadow-pastel-purple/10 backdrop-blur-sm">
                                    <Sparkles className="h-10 w-10 text-pastel-purple" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                        Welcome Back
                                    </h2>
                                    <p className="text-muted-foreground max-w-md mx-auto text-lg">
                                        Ready to level up your dating game?
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-4">
                                    {["Analyze screenshot", "Date ideas", "Reply help", "Profile review"].map((suggestion) => (
                                        <Button
                                            key={suggestion}
                                            variant="outline"
                                            className="h-auto py-3.5 px-6 justify-center text-muted-foreground hover:text-pastel-purple hover:border-pastel-purple/30 hover:bg-white/60 transition-all duration-300 rounded-xl border-black/5 bg-white/30 shadow-sm"
                                            onClick={() => setInput(suggestion)}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className={cn(
                                    "flex gap-4 group",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <Avatar className={cn(
                                    "h-8 w-8 mt-1 shadow-sm transition-opacity duration-300",
                                    msg.role === "user" ? "opacity-0 group-hover:opacity-100" : "opacity-100"
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
                                                ? "bg-gradient-to-br from-pastel-purple to-pastel-blue text-white rounded-tr-sm shadow-md shadow-pastel-blue/20 user-bubble"
                                                : "bg-white/80 border border-white/50 text-foreground rounded-tl-sm backdrop-blur-sm"
                                        )}
                                    >
                                        <div className="prose prose-sm max-w-none break-words">
                                            {msg.role === "assistant" && index === messages.length - 1 ? (
                                                <>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={markdownComponents}
                                                    >
                                                        {displayedContent}
                                                    </ReactMarkdown>
                                                    {isTyping && (
                                                        <motion.span
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: [0, 1, 0] }}
                                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                                            className="inline-block w-2 h-5 ml-1 bg-pastel-purple align-middle rounded-sm shadow-[0_0_10px_rgba(183,168,214,0.5)]"
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={markdownComponents}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>
                                    {msg.role === "assistant" && isLoading && index === messages.length - 1 && !displayedContent && (
                                        <div className="flex items-center gap-1.5 h-6 px-2">
                                            <motion.span
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                                className="w-2 h-2 bg-pastel-purple rounded-full"
                                            />
                                            <motion.span
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                                className="w-2 h-2 bg-pastel-pink rounded-full"
                                            />
                                            <motion.span
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                                className="w-2 h-2 bg-pastel-blue rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
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
                            placeholder="Message Cyber Coach..."
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 px-6 py-3 h-auto text-base placeholder:text-muted-foreground/50 text-foreground"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={isLoading ? stopGeneration : sendMessage}
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
