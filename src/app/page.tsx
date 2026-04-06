"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, BookOpen, Heart, ShieldCheck, Mail, Menu } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Link from "next/link"; // <-- Thêm dòng này

// Sample FAQ data
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

// Variants for Framer Motion
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);
  console.log("accessToken", accessToken);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartJourney = async () => {
    try {
      if (accessToken) {
        // If logged in, redirect to Home
        router.push("/home");
        return;
      }

      setIsRedirecting(true);

      // 1. Generate Code Verifier and Challenge
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);

      // 2. Redirect to Auth Server
      const authServerUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:9084";
      const clientId = "spa-client";
      const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/callback";

      const authUrl = new URL(`${authServerUrl}/oauth2/authorize`);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", clientId);
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200">

      {/* NAVIGATION HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo and Nav Menu */}
          <div className="flex items-center gap-12">
            <div className="text-2xl md:text-3xl font-bold font-sans text-emerald-900 tracking-tight cursor-pointer">
              A Story.
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 font-medium text-stone-600">
              <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-emerald-800 transition-colors">Stories</a>
              <a href="#faq" className="hover:text-emerald-800 transition-colors">FAQ</a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Nút Đăng nhập (gọi OAuth2) */}
            <button
              onClick={handleStartJourney}
              disabled={isRedirecting}
              className="hidden md:block font-medium text-stone-600 hover:text-emerald-800 transition-colors"
            >
              Log in
            </button>

            {/* Nút Đăng ký (chuyển sang trang /register) */}
            <Link
              href="/register"
              className="min-h-[44px] px-6 bg-emerald-800 text-white rounded-full text-md font-medium hover:bg-emerald-900 shadow-sm transition-all hover:shadow-md flex items-center justify-center"
            >
              Sign up
            </Link>

            {/* Mobile Hamburger Button */}
            <button className="lg:hidden p-2 text-stone-600 hover:text-emerald-800">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8 z-10"
            >
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-stone-900 leading-[1.15]">
                Preserve your legacy <br />
                <span className="text-emerald-800 italic">in your own words.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-lg">
                A quiet, safe space to reminisce, rewrite the ups and downs of life, and send love to the next generation.
              </motion.p>

              <motion.div variants={fadeInUp} className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartJourney}
                  disabled={isRedirecting}
                  className="min-h-[60px] w-full sm:w-auto px-8 py-3 bg-emerald-800 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-emerald-900 hover:scale-[1.02] hover:shadow-xl transition-all disabled:opacity-75"
                >
                  {isRedirecting ? "Preparing..." : "Start preserving memories"}
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.01] duration-700"
            >
              <Image
                src="/photo1.avif"
                alt="Two generations sharing a story"
                fill
                className="object-cover"
                placeholder="empty"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
            </motion.div>
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-white px-6 border-y border-stone-200">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto text-center space-y-16"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-stone-900">The memory preservation journey</h2>
              <p className="text-xl text-stone-600">Three simple steps, taking your time at your own pace.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-stone-300 z-0" />

              {[
                { icon: BookOpen, title: "1. Get prompts", desc: "A weekly memory-evoking question to spark your emotions without the fear of 'writer's block'." },
                { icon: Heart, title: "2. Write at your pace", desc: "No time pressure, no counting likes. Just you and your most authentic memories." },
                { icon: ShieldCheck, title: "3. Secure storage", desc: "Your writing is strictly confidential. You are the only one who decides who is allowed to read it." }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="relative z-10 flex flex-col items-center text-center space-y-6 group"
                >
                  <div className="w-24 h-24 bg-stone-50 border-4 border-white rounded-full flex items-center justify-center shadow-md group-hover:bg-emerald-50 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-emerald-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900">{step.title}</h3>
                  <p className="text-lg text-stone-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 3. SOCIAL PROOF */}
        <section id="testimonials" className="py-24 bg-stone-100 px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto space-y-16"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-stone-900">Stories that have been told</h2>
              <p className="text-xl text-stone-600">Thousands of families have connected more deeply through every written page.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <motion.div variants={fadeInUp} className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-200 relative flex flex-col h-full">
                <span className="absolute top-6 left-6 text-6xl text-emerald-200 font-sans leading-none">"</span>
                <p className="text-lg md:text-xl text-stone-700 font-sans italic leading-relaxed relative z-10 flex-grow">
                  At first I thought I had nothing to write about, my life was too ordinary. But when I started answering the prompt questions, childhood memories came flooding back. Now, my children are thrilled whenever I send them a link telling a story about the old days.
                </p>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100">
                  <div className="w-14 h-14 bg-stone-300 rounded-full overflow-hidden relative shrink-0">
                    <Image src="/photo2.avif" alt="Avatar Ms. Ngoc Lan" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900">Ms. Ngoc Lan</div>
                    <div className="text-stone-500">Retired teacher, 62 years old</div>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div variants={fadeInUp} className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-200 relative flex flex-col h-full">
                <span className="absolute top-6 left-6 text-6xl text-emerald-200 font-sans leading-none">"</span>
                <p className="text-lg md:text-xl text-stone-700 font-sans italic leading-relaxed relative z-10 flex-grow">
                  My children settled abroad and can only visit once a year. By rewriting my stories on this platform, I feel like I'm talking to them every day. They also understand more about their grandparents and their roots despite being far away.
                </p>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100">
                  <div className="w-14 h-14 bg-stone-300 rounded-full overflow-hidden relative shrink-0">
                    <Image src="/photo3.avif" alt="Avatar Mr. Hoang Minh" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900">Mr. Hoang Minh</div>
                    <div className="text-stone-500">Government official, 68 years old</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 4. FAQ ACCORDION */}
        <section id="faq" className="py-24 bg-white px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold font-sans text-stone-900 text-center">Frequently Asked Questions</motion.h2>
            <motion.div variants={fadeInUp} className="space-y-4">
              {FAQS.map((faq, index) => (
                <div key={index} className="border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-200 hover:shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full min-h-[72px] px-6 py-4 flex justify-between items-center text-left bg-white focus:outline-none"
                  >
                    <span className="text-xl font-bold text-stone-900">{faq.question}</span>
                    <ChevronDown className={`w-6 h-6 text-stone-400 transition-transform duration-300 shrink-0 ${openFaq === index ? "rotate-180 text-emerald-800" : ""}`} />
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
                        <p className="text-lg text-stone-600 leading-relaxed border-t border-stone-100 pt-4 pb-6">
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

      {/* 5. FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Left Column: Info & CTA Button */}
          <div className="space-y-6">
            <div className="text-3xl font-bold font-sans text-white">A Story.</div>
            <p className="text-lg max-w-sm">
              Preserving memories, strengthening family bonds through every written page.
            </p>
            <button
              onClick={handleStartJourney}
              className="min-h-[56px] px-8 bg-stone-800 text-white rounded-xl text-lg font-medium hover:bg-stone-700 transition-colors border border-stone-700 flex items-center gap-3 w-fit"
            >
              <Mail className="w-5 h-5" /> Get started today
            </button>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="grid grid-cols-2 gap-8">

            {/* About us */}
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">About us</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Team</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">Support</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">FAQ</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-center text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4">
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