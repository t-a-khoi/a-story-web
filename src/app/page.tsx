"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, BookOpen, Heart, ShieldCheck, Mail, Menu, X } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Link from "next/link";

// ─── FAQ data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    question: "Is my information secure?",
    answer: "Absolutely safe. The platform is designed with a 'Privacy by Default' approach. Your stories are only shared with the people you personally select. No ads, no user tracking.",
  },
  {
    question: "Can I use it if I'm not tech-savvy?",
    answer: "Absolutely. The interface is designed with large text, clear colors, and easy-to-tap buttons, removing all complex features so you can just focus on writing.",
  },
  {
    question: "How do I share my stories with my family?",
    answer: "Once you complete a story, you can generate a private viewing link and send it via messaging apps. They don't need to create an account to read it.",
  },
];

// ─── Framer Motion Variants ───────────────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function LandingPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);

  // Check for expired session parameter
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("expired=1")) {
      setExpiredMsg(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartJourney = async () => {
    try {
      if (accessToken) { router.push("/home"); return; }
      setIsRedirecting(true);

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);

      const authServerUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:9084";
      const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/callback";

      const authUrl = new URL(`${authServerUrl}/oauth2/authorize`);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", "spa-client");
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("scope", "openid profile");
      authUrl.searchParams.append("code_challenge", codeChallenge);
      authUrl.searchParams.append("code_challenge_method", "S256");
      authUrl.searchParams.append("prompt", "login");

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Login redirect error:", error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pearl-50 text-charcoal-900 font-sans selection:bg-navy-100">

      {/* ══════════════════════ NAVIGATION HEADER ══════════════════════ */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-pearl-50/95 backdrop-blur-md shadow-sm border-b border-pearl-200 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo + Nav */}
          <div className="flex items-center gap-10">
            <div className="text-2xl md:text-3xl font-bold text-navy-800 tracking-tight cursor-pointer">
              A Story.
            </div>
            <nav className="hidden lg:flex items-center gap-8 font-medium text-charcoal-600">
              <a href="#how-it-works" className="hover:text-navy-700 transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-navy-700 transition-colors">Stories</a>
              <a href="#faq" className="hover:text-navy-700 transition-colors">FAQ</a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={handleStartJourney}
              disabled={isRedirecting}
              className="hidden md:block font-medium text-charcoal-600 hover:text-navy-700 transition-colors"
            >
              Log in
            </button>
            <Link
              href="/register"
              className="min-h-[44px] px-6 bg-navy-700 text-white rounded-full text-sm font-bold hover:bg-navy-800 shadow-sm transition-all hover:shadow-md flex items-center justify-center"
            >
              Sign up
            </Link>
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="lg:hidden p-2 text-charcoal-600 hover:text-navy-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-pearl-50 border-t border-pearl-200 px-6 py-4 space-y-3"
            >
              {["#how-it-works", "#testimonials", "#faq"].map((href, i) => (
                <a
                  key={i}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 font-medium text-charcoal-700 hover:text-navy-700 transition-colors"
                >
                  {["How it works", "Stories", "FAQ"][i]}
                </a>
              ))}
              <button
                onClick={handleStartJourney}
                className="w-full min-h-[48px] bg-navy-700 text-white rounded-xl font-bold text-base hover:bg-navy-800 transition-colors"
              >
                Log in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* EXPIRED SESSION ALERT */}
        <AnimatePresence>
          {expiredMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 pt-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-6"
            >
              <div className="bg-red-50 text-red-800 px-5 py-4 rounded-2xl shadow-xl border-2 border-red-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-base leading-tight">Phiên đăng nhập đã hết hạn.</p>
                  <p className="text-sm mt-1 text-red-700">Vui lòng đăng nhập lại để tiếp tục sử dụng.</p>
                </div>
                <button onClick={() => setExpiredMsg(false)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════ 1. HERO SECTION ═══════════════════════ */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
          {/* Background decorative blobs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-navy-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-200/30 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8 z-10"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 bg-navy-100 text-navy-700 text-sm font-bold px-4 py-2 rounded-full border border-navy-200">
                  ✦ For seniors & families who cherish memories
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-900 leading-[1.15]">
                Preserve your legacy{" "}
                <br />
                <span className="text-navy-700 italic">in your own words.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-charcoal-600 leading-relaxed max-w-lg">
                A quiet, safe space to reminisce, rewrite the ups and downs of life, and send love to the next generation.
              </motion.p>

              <motion.div variants={fadeInUp} className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartJourney}
                  disabled={isRedirecting}
                  className="min-h-[60px] w-full sm:w-auto px-8 py-3 bg-navy-700 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-navy-800 hover:scale-[1.02] hover:shadow-xl transition-all disabled:opacity-75"
                >
                  {isRedirecting ? "Preparing..." : "Start preserving memories"}
                </button>
                <Link
                  href="/register"
                  className="min-h-[60px] w-full sm:w-auto px-8 py-3 bg-white border-2 border-pearl-300 text-charcoal-700 rounded-xl text-lg font-bold hover:border-navy-400 hover:text-navy-700 transition-all flex items-center justify-center"
                >
                  Create free account →
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 pt-4">
                {[
                  { value: "1,000+", label: "Stories preserved" },
                  { value: "500+", label: "Families connected" },
                  { value: "100%", label: "Free & private" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-extrabold text-navy-700">{stat.value}</div>
                    <div className="text-sm text-charcoal-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[400px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-700"
            >
              <Image
                src="/photo1.avif"
                alt="Two generations sharing a story"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent" />

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-6 left-6 right-6 bg-pearl-50/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pearl-200"
              >
                <p className="text-sm font-bold text-charcoal-900">📖 "The summer of 1975..."</p>
                <p className="text-xs text-charcoal-500 mt-1">Ms. Ngoc Lan just saved a new memory</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════ 2. HOW IT WORKS ═══════════════════════ */}
        <section id="how-it-works" className="py-24 bg-white px-6 border-y border-pearl-200">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto text-center space-y-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal-900">The memory preservation journey</h2>
              <p className="text-xl text-charcoal-600">Three simple steps, taking your time at your own pace.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-pearl-300 z-0" />

              {[
                { icon: BookOpen, title: "1. Get prompts", desc: "A weekly memory-evoking question to spark your emotions without the fear of 'writer's block'." },
                { icon: Heart, title: "2. Write at your pace", desc: "No time pressure, no counting likes. Just you and your most authentic memories." },
                { icon: ShieldCheck, title: "3. Secure storage", desc: "Your writing is strictly confidential. You are the only one who decides who is allowed to read it." },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="relative z-10 flex flex-col items-center text-center space-y-6 group"
                >
                  <div className="w-24 h-24 bg-pearl-100 border-4 border-white rounded-full flex items-center justify-center shadow-md group-hover:bg-navy-50 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-navy-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-900">{step.title}</h3>
                  <p className="text-lg text-charcoal-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════ 3. SOCIAL PROOF ═══════════════════════ */}
        <section id="testimonials" className="py-24 bg-navy-50/50 px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto space-y-16"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-charcoal-900">Stories that have been told</h2>
              <p className="text-xl text-charcoal-600">Thousands of families have connected more deeply through every written page.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote: "At first I thought I had nothing to write about, my life was too ordinary. But when I started answering the prompt questions, childhood memories came flooding back. Now, my children are thrilled whenever I send them a link telling a story about the old days.",
                  name: "Ms. Ngoc Lan",
                  role: "Retired teacher, 62 years old",
                  img: "/photo2.avif"
                },
                {
                  quote: "My children settled abroad and can only visit once a year. By rewriting my stories on this platform, I feel like I'm talking to them every day. They also understand more about their grandparents and their roots despite being far away.",
                  name: "Mr. Hoang Minh",
                  role: "Government official, 68 years old",
                  img: "/photo3.avif"
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-pearl-200 relative flex flex-col h-full hover:border-navy-200 hover:shadow-md transition-all duration-300"
                >
                  <span className="absolute top-6 left-6 text-6xl text-navy-200 font-sans leading-none">"</span>
                  <p className="text-lg md:text-xl text-charcoal-700 italic leading-relaxed relative z-10 flex-grow">
                    {t.quote}
                  </p>
                  <div className="mt-8 flex items-center gap-4 pt-6 border-t border-pearl-200">
                    <div className="w-14 h-14 bg-pearl-200 rounded-full overflow-hidden relative shrink-0">
                      <Image src={t.img} alt={`Ảnh đại diện ${t.name}`} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-charcoal-900">{t.name}</div>
                      <div className="text-charcoal-500 text-sm">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════ 4. FAQ ACCORDION ══════════════════════ */}
        <section id="faq" className="py-24 bg-white px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-charcoal-900 text-center">
              Frequently Asked Questions
            </motion.h2>
            <motion.div variants={fadeInUp} className="space-y-4">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className="border border-pearl-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-navy-300 hover:shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full min-h-[72px] px-6 py-4 flex justify-between items-center text-left bg-white focus:outline-none"
                  >
                    <span className="text-xl font-bold text-charcoal-900">{faq.question}</span>
                    <ChevronDown className={`w-6 h-6 text-charcoal-400 transition-transform duration-300 shrink-0 ${openFaq === index ? "rotate-180 text-navy-700" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-6 overflow-hidden"
                      >
                        <p className="text-lg text-charcoal-600 leading-relaxed border-t border-pearl-200 pt-4 pb-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ══════════════════════ 5. FOOTER ══════════════════════════════ */}
      <footer className="bg-navy-900 text-navy-300 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Left Column */}
          <div className="space-y-6">
            <div className="text-3xl font-bold text-white">A Story.</div>
            <p className="text-lg max-w-sm text-navy-400">
              Preserving memories, strengthening family bonds through every written page.
            </p>
            <button
              onClick={handleStartJourney}
              className="min-h-[56px] px-8 bg-navy-800 text-white rounded-xl text-lg font-medium hover:bg-navy-700 transition-colors border border-navy-700 flex items-center gap-3 w-fit"
            >
              <Mail className="w-5 h-5" /> Get started today
            </button>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">About us</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Team</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">Support</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Contact</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors block">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-navy-800 text-center text-navy-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} A Story. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors block">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors block">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}