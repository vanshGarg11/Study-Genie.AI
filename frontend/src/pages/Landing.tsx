import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Counter from '../components/Counter';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles, Brain, Layers, Trophy, MessageSquare, Video, Volume2, Upload, GraduationCap, ArrowRight, Menu, X, Zap, Shield, Bot, Mail, CheckCircle2, Copy, RotateCw, Flame, Download
} from 'lucide-react';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 group-hover:bg-violet-500/30 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StudyGenie<span className="text-violet-500">.AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-item text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="nav-item text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="nav-item text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="btn-ghost px-4 py-2 text-sm font-medium rounded-lg text-slate-200 hover:text-white transition-colors">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="btn-violet px-5 py-2 text-sm font-medium rounded-lg flex items-center gap-2">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-300 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden absolute top-full left-0 right-0"
          >
            <div className="p-4 flex flex-col gap-4">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Features</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">How It Works</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Pricing</a>
              <div className="h-px bg-white/5 my-2"></div>
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Login</button>
              <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="w-full btn-violet py-2 rounded-lg text-center">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden hero-gradient bg-grid">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Study Smarter, Not Harder
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6"
          >
            Your <span className="text-gradient-vc">AI-Powered</span><br/>Study Companion
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your PDFs and lectures into smart notes, flashcards, and quizzes in seconds. Chat with your documents and master any subject with our Live2D AI Teacher.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto btn-violet px-8 py-3.5 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto btn-ghost px-8 py-3.5 rounded-xl text-lg font-semibold border border-white/10 hover:bg-white/5 transition-all text-white">
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* Floating Mockups */}
        <div className="relative max-w-5xl mx-auto h-[400px] mt-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute left-0 lg:-left-10 top-20 w-72 z-20 animate-float"
            style={{ animationDelay: '0s' }}
          >
            <div className="neon-card p-4 rounded-2xl glass border border-white/10 bg-surface/80 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><Trophy className="w-4 h-4"/></div>
                <div className="text-sm font-semibold text-white">Quiz Arena</div>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-slate-300 font-medium">What is the powerhouse of the cell?</div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex justify-between">
                  <span>A. Mitochondria</span>
                  <Zap className="w-3 h-3"/>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-xs">B. Nucleus</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[400px] z-30 animate-float"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="neon-card p-5 rounded-2xl glass border border-violet-500/30 bg-surface/90 backdrop-blur-xl shadow-2xl shadow-violet-500/10">
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400"><Brain className="w-5 h-5"/></div>
                <div className="font-semibold text-white">AI Smart Notes</div>
                <div className="ml-auto badge-violet text-[10px] px-2 py-0.5 rounded-full">Generated</div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-slate-400">#biology</span>
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-slate-400">#chapter1</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute right-0 lg:-right-10 top-16 w-64 z-20 animate-float"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="neon-card p-4 rounded-2xl glass border border-white/10 bg-surface/80 backdrop-blur-md shadow-2xl">
               <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Layers className="w-4 h-4"/></div>
                <div className="text-sm font-semibold text-white">Flashcards</div>
              </div>
              <div className="aspect-[4/3] bg-gradient-to-br from-cyan-900/40 to-violet-900/40 rounded-xl border border-white/10 flex items-center justify-center p-4 text-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                <span className="text-sm font-medium text-white">Click to flip card</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TrustStrip = () => {
  const techs = [
    { name: "Powered by Gemini AI", icon: <Bot className="w-4 h-4"/> },
    { name: "React 19", icon: <Zap className="w-4 h-4"/> },
    { name: "MongoDB", icon: <Layers className="w-4 h-4"/> },
    { name: "Razorpay", icon: <Shield className="w-4 h-4"/> },
    { name: "Live2D Teacher", icon: <Video className="w-4 h-4"/> },
    { name: "PDF Intelligence", icon: <MessageSquare className="w-4 h-4"/> },
    { name: "Spaced Repetition", icon: <Brain className="w-4 h-4"/> },
    { name: "Voice Narration", icon: <Volume2 className="w-4 h-4"/> }
  ];

  return (
    <div className="py-8 border-y border-white/5 bg-dark/50 backdrop-blur-sm overflow-hidden flex relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-dark to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-dark to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex gap-8 whitespace-nowrap min-w-full animate-[marquee_30s_linear_infinite]">
        {[...techs, ...techs].map((tech, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 text-slate-300 text-sm">
             <span className="text-violet-400">{tech.icon}</span>
             {tech.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const Features = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    { icon: <Brain className="w-6 h-6"/>, name: "AI Smart Notes", desc: "Instantly generate comprehensive, structured notes from any PDF or text input.", color: "violet" },
    { icon: <Layers className="w-6 h-6"/>, name: "3D Flashcard Decks", desc: "Master concepts with auto-generated flashcards and spaced repetition algorithms.", color: "cyan" },
    { icon: <Trophy className="w-6 h-6"/>, name: "Interactive Quiz Arena", desc: "Test your knowledge with custom quizzes graded instantly by AI.", color: "rose" },
    { icon: <MessageSquare className="w-6 h-6"/>, name: "PDF Document Chat", desc: "Ask questions directly to your textbooks and documents and get cited answers.", color: "amber" },
    { icon: <Video className="w-6 h-6"/>, name: "Live2D AI Teacher", desc: "Interact with a virtual AI tutor that explains complex topics visually.", color: "emerald" },
    { icon: <Volume2 className="w-6 h-6"/>, name: "Voice Narration", desc: "Listen to your notes and flashcards on the go with natural AI voices.", color: "purple" }
  ];

  return (
    <section id="features" className="py-24 relative bg-dark">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to <span className="text-gradient-vr">master any subject</span></h2>
          <p className="text-slate-400">A complete suite of AI-powered tools designed to supercharge your learning process and boost retention.</p>
        </div>

        <motion.div 
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="feature-card glass border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-all group hover:border-white/10">
              <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-${feature.color}-500/10 text-${feature.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const steps = [
    { icon: <Upload className="w-8 h-8"/>, title: "1. Upload Your Content", desc: "Upload PDFs, lecture slides, or paste text directly into StudyGenie." },
    { icon: <Sparkles className="w-8 h-8"/>, title: "2. AI Generates Magic", desc: "Our Gemini-powered AI instantly creates notes, flashcards, and quizzes." },
    { icon: <GraduationCap className="w-8 h-8"/>, title: "3. Master Your Subject", desc: "Study efficiently with active recall, spaced repetition, and our AI tutor." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-surface relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400">Three simple steps to straight A's</p>
        </div>

        <div className="max-w-4xl mx-auto relative" ref={ref}>
          {/* Connecting Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-500/50 to-transparent -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 w-full">
                  <div className={`glass p-8 rounded-3xl border border-white/5 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:border-transparent md:bg-transparent md:p-0`}>
                    <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-400 text-lg">{step.desc}</p>
                  </div>
                </div>
                
                <div className="relative z-10 hidden md:flex w-16 h-16 rounded-full bg-dark border-4 border-surface items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <div className="text-violet-400">{step.icon}</div>
                </div>

                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  
  const stats = [
    { value: 50000, suffix: "+", label: "Students" },
    { value: 2, suffix: "M+", label: "Notes Generated" },
    { value: 500, suffix: "K+", label: "Flashcards" },
    { value: 1, suffix: "M+", label: "Questions Answered" }
  ];

  return (
    <section className="py-20 border-y border-white/5 bg-dark">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
                {inView ? <Counter end={stat.value} duration={1800} /> : '0'}
                {stat.suffix}
              </div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ToolShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const tabs = [
    { label: "AI Notes", icon: Brain },
    { label: "3D Flashcards", icon: Layers },
    { label: "Quiz Arena", icon: Trophy },
    { label: "PDF Chat", icon: MessageSquare },
  ];

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold uppercase tracking-wider">
            ⚡ Interactive Live Preview
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Powerful Tools at Your Fingertips
          </h2>
          <p className="text-slate-400 text-sm">
            Explore the specialized learning engines built to help you master any subject 3x faster.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1.5 bg-[#08090E] glass rounded-2xl border border-white/10 gap-1 shadow-lg">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const active = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx);
                    setCardFlipped(false);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    active
                      ? "bg-violet-600/25 text-white border border-violet-500/50 shadow-md shadow-violet-600/20"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon size={16} className={active ? "text-violet-400" : "text-slate-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mac-Style App Window Frame */}
        <div className="max-w-5xl mx-auto rounded-3xl neon-card overflow-hidden border border-white/15 shadow-2xl bg-[#08090E]">
          {/* Window Titlebar */}
          <div className="px-6 py-3.5 bg-[#0D0F1A] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-3 font-semibold">
                StudyGenie AI Workspace — {tabs[activeTab].label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
              <Sparkles size={12} />
              <span>Gemini 1.5 Flash Grounded</span>
            </div>
          </div>

          {/* Window Canvas */}
          <div className="p-6 sm:p-10 min-h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-6 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded badge-violet">
                          Quantum Computing
                        </span>
                        <span className="text-xs text-slate-400 font-mono">1,420 words • 5 min read</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Quantum Superposition & Qubit State Vectors
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="btn-ghost text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-300">
                        <Copy size={13} /> Copy MD
                      </span>
                      <span className="btn-cyan text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                        <Download size={13} /> Save Summary
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <p>
                      In quantum computing, a <strong className="text-violet-300">qubit</strong> is the basic unit of quantum information. Unlike classical bits that exist strictly as 0 or 1, a qubit exists in a superposition state: <code className="bg-violet-950/50 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs">|ψ⟩ = α|0⟩ + β|1⟩</code>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-violet-400 uppercase block">1. Bloch Sphere Geometry</span>
                        <p className="text-xs text-slate-300">Continuous 3D spatial representation on the unit sphere parameterizing probability amplitudes.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">2. Quantum Entanglement</span>
                        <p className="text-xs text-slate-300">Non-local correlation between multi-qubit systems enabling exponential parallelism in Grover & Shor algorithms.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-cyan-950/30 border border-violet-500/30 flex items-start gap-3">
                      <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-amber-300 block">Exam Revision Takeaway</span>
                        <p className="text-xs text-slate-200 mt-0.5">Measurement collapses the superposition wave function deterministically with probability |α|² and |β|² respectively.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-2xl space-y-5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold uppercase">Card 4 of 12 • Biology / Cell Division</span>
                    <span className="text-slate-400">Click card to flip 3D view</span>
                  </div>

                  <div
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="perspective-1000 w-full h-64 sm:h-72 cursor-pointer select-none"
                  >
                    <motion.div
                      animate={{ rotateY: cardFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="transform-style-3d relative w-full h-full"
                    >
                      {/* Front */}
                      <div className="backface-hidden absolute inset-0 rounded-3xl p-8 flex flex-col justify-between neon-card bg-gradient-to-br from-[#0F172A] via-[#0D0F1A] to-[#0A0D14] border border-cyan-500/40 glow-cyan">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                            Active Recall Question
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <RotateCw size={13} className="text-cyan-400" /> Click to reveal answer
                          </span>
                        </div>
                        <div className="my-auto text-center px-4">
                          <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
                            What is the primary genetic difference between Mitosis and Meiosis?
                          </h4>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                          <span>Active Deck: AP Biology</span>
                          <span>Front View</span>
                        </div>
                      </div>

                      {/* Back */}
                      <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-3xl p-8 flex flex-col justify-between neon-card bg-gradient-to-br from-[#1A102E] via-[#0D0F1A] to-[#0A0D14] border border-violet-500/40 glow-violet">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-300 bg-violet-500/15 px-2.5 py-1 rounded-md border border-violet-500/30">
                            Verified Explanation
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <RotateCw size={13} className="text-violet-400" /> Click to flip back
                          </span>
                        </div>
                        <div className="my-auto text-center px-4 space-y-2">
                          <p className="text-base sm:text-lg text-white font-semibold leading-relaxed">
                            Mitosis produces <strong>2 genetically identical diploid (2n) somatic cells</strong> for growth/repair, whereas Meiosis produces <strong>4 genetically diverse haploid (n) gametes</strong> via crossing over.
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                          <span>Genetic Variation: Crossing Over (Prophase I)</span>
                          <span>Back View</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <span className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-bold">
                      ↻ Review Again (3)
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
                      ✓ Mastered (9)
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-2xl space-y-6 text-left"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold uppercase text-rose-400">
                        Question 3 of 10
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                        <Flame size={14} /> 3 Streak!
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Score: 300 Pts</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    Which layer of the OSI model is responsible for end-to-end host error recovery and flow control?
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-slate-400 text-xs sm:text-sm flex items-center gap-3 opacity-60">
                      <span className="w-7 h-7 rounded-lg bg-black/40 font-mono font-bold text-xs flex items-center justify-center shrink-0">A</span>
                      <span>Network Layer (Layer 3)</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/60 text-white text-xs sm:text-sm flex items-center justify-between glow-emerald-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">B</span>
                        <span className="font-bold">Transport Layer (Layer 4 - TCP/UDP)</span>
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-slate-400 text-xs sm:text-sm flex items-center gap-3 opacity-60">
                      <span className="w-7 h-7 rounded-lg bg-black/40 font-mono font-bold text-xs flex items-center justify-center shrink-0">C</span>
                      <span>Data Link Layer (Layer 2)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">AI Explanation</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The Transport Layer (Layer 4) provides transparent transfer of data between end systems with TCP segment checksums, sliding windows, and acknowledgment numbers.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-4 text-left"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Neural_Networks_Deep_Learning.pdf</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">Grounded Citation: Pages 41-45</span>
                  </div>

                  <div className="space-y-3">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] p-3.5 rounded-2xl bg-violet-600/25 border border-violet-500/40 text-white text-xs sm:text-sm shadow-sm">
                        How does backpropagation compute the gradient of the loss function with respect to weights?
                      </div>
                    </div>

                    {/* AI message */}
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} />
                      </div>
                      <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-slate-200 space-y-2 leading-relaxed">
                        <p>
                          According to <strong>Section 3.2 (p. 43)</strong>, backpropagation utilizes the <strong>multivariate chain rule</strong> to propagate error terms backwards from the output layer:
                        </p>
                        <div className="p-2.5 rounded-xl bg-black/60 font-mono text-xs text-cyan-300 border border-white/[0.06]">
                          ∂L/∂W(l) = δ(l) · (a(l-1))ᵀ
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                          <li><strong>Forward Pass:</strong> Computes activations and intermediate pre-activations z(l).</li>
                          <li><strong>Backward Pass:</strong> Evaluates layer error vector δ(l) via Hadamard product.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                    <span>Ask a question with strict citation grounding...</span>
                    <span className="btn-violet px-3 py-1.5 rounded-xl text-[11px] font-bold">Send Prompt</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const navigate = useNavigate();
  const pricingPlans = [
    {
      id: "starter",
      name: "Scholar Starter",
      coins: 50,
      price: 49,
      popular: false,
      tagline: "Great for quick exam chapter revision",
      features: [
        "25 Full AI Note Syntheses",
        "16 Interactive 3D Flashcard Decks",
        "16 MCQ Quiz Arena Assessments",
        "Instant PDF Document Grounding",
        "Standard Response Priority",
      ],
    },
    {
      id: "scholar",
      name: "Semester Pro",
      coins: 200,
      price: 149,
      popular: true,
      tagline: "Most popular choice for active college students",
      features: [
        "100 Full AI Note Syntheses",
        "66 Interactive 3D Flashcard Decks",
        "66 MCQ Quiz Arena Assessments",
        "Full Multi-Slide Course Lesson Generator",
        "Live2D Interactive Teacher Lectures",
        "Fast-Track GPU Generation Priority",
      ],
    },
    {
      id: "master",
      name: "Master Suite",
      coins: 500,
      price: 299,
      popular: false,
      tagline: "Uncapped power for full academic year mastery",
      features: [
        "250 Full AI Note Syntheses",
        "166 Interactive 3D Flashcard Decks",
        "166 MCQ Quiz Arena Assessments",
        "Unlimited Course Lessons & Quizzes",
        "VIP Priority Support & Live2D Access",
        "Never Expiring Scholar Coins",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-dark relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-violet text-xs font-mono font-semibold uppercase tracking-wider">
            💎 Transparent Coin Packages
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Simple, Pay-As-You-Learn Pricing
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            No expensive recurring monthly subscriptions. Buy scholar coins once and only spend them when generating new AI notes, flashcards, or quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-8 rounded-3xl neon-card flex flex-col justify-between relative transition-all duration-300 ${
                pkg.popular
                  ? "bg-gradient-to-b from-violet-950/40 via-[#0D0F1A] to-[#08090E] border-violet-500/50 glow-violet -translate-y-2"
                  : "bg-[#08090E] border-white/10 hover:border-white/20"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg font-mono uppercase tracking-wider">
                  🔥 Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 pb-6 border-b border-white/[0.08]">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    ₹{pkg.price}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    / {pkg.coins} Coins
                  </span>
                </div>

                <ul className="space-y-3">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate(`/coins`)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pkg.popular
                      ? "btn-violet shadow-lg shadow-violet-600/30"
                      : "btn-cyan shadow-md shadow-cyan-500/20"
                  }`}
                >
                  <span>Recharge {pkg.coins} Coins</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaBanner = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-dark to-cyan-900/40"></div>
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      
      {/* Floating particles (simplified) */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="absolute w-2 h-2 bg-white/20 rounded-full animate-float" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 5}s`
        }}></div>
      ))}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center glass border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden shimmer-border">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to study smarter?</h2>
            <p className="text-xl text-slate-300 mb-10">Join 50,000+ students already using StudyGenie to ace their exams.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto btn-violet px-8 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                Get Started for Free
              </button>
              <button onClick={() => navigate('/pricing')} className="w-full sm:w-auto btn-ghost px-8 py-4 rounded-xl text-lg font-bold text-white border border-white/20">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-dark pt-16 pb-8 border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">StudyGenie<span className="text-violet-500">.AI</span></span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-6">
              Your intelligent companion for mastering any subject. Upload materials, get instant insights, and study efficiently.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all"><Bot className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all"><Sparkles className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all"><Mail className="w-5 h-5"/></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} StudyGenie.AI. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark text-slate-200 selection:bg-violet-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* Global CSS defined in styles or index.css would handle the custom classes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      <Navbar />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Stats />
      <ToolShowcase />
      <PricingSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
