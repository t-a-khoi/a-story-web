"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, BookOpen, Heart, ShieldCheck, Mail, Menu } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Import thêm Variants để fix lỗi TypeScript

// Dữ liệu mẫu cho FAQ
const FAQS = [
  {
    question: "Thông tin của tôi có được bảo mật không?",
    answer: "Tuyệt đối an toàn. Nền tảng được thiết kế với tiêu chí 'Riêng tư mặc định'. Câu chuyện của bạn chỉ được chia sẻ với những người bạn đích thân lựa chọn. Không có quảng cáo, không theo dõi người dùng.",
  },
  {
    question: "Tôi không rành công nghệ thì có sử dụng được không?",
    answer: "Hoàn toàn được. Giao diện được thiết kế với chữ lớn, màu sắc rõ ràng và các nút bấm dễ chạm, loại bỏ mọi tính năng phức tạp để bạn chỉ cần tập trung vào việc viết.",
  },
  {
    question: "Làm sao để chia sẻ câu chuyện cho con cháu?",
    answer: "Sau khi hoàn thành một câu chuyện, bạn có thể tạo một liên kết xem riêng tư và gửi nó qua Zalo, Email hoặc tin nhắn cho người thân. Họ không cần tạo tài khoản vẫn có thể đọc được.",
  },
];

// Khai báo kiểu Variants cho Framer Motion để hết lỗi gạch đỏ trong VSCode
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

  // Hiệu ứng thay đổi header khi scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartJourney = async () => {
    try {
      if (accessToken) {
        router.push("/home");
        return;
      }
      
      setIsRedirecting(true);
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      sessionStorage.setItem("pkce_code_verifier", verifier);
      window.location.href = authService.getLoginUrl(challenge);
    } catch (error) {
      console.error("Lỗi chuyển hướng:", error);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200">

      {/* HEADER ĐIỀU HƯỚNG CẬP NHẬT */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

          {/* Logo và Menu điều hướng */}
          <div className="flex items-center gap-12">
            <div className="text-2xl md:text-3xl font-bold font-sans text-emerald-900 tracking-tight cursor-pointer">
              A Story.
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 font-medium text-stone-600">
              <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">Cách hoạt động</a>
              <a href="#testimonials" className="hover:text-emerald-800 transition-colors">Câu chuyện</a>
              <a href="#faq" className="hover:text-emerald-800 transition-colors">Hỏi đáp</a>
            </nav>
          </div>

          {/* Nút hành động (Chỉ còn Bắt đầu ngay) */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartJourney}
              className="min-h-[44px] px-6 bg-emerald-800 text-white rounded-full text-md font-medium hover:bg-emerald-900 shadow-sm transition-all hover:shadow-md"
            >
              Bắt đầu ngay
            </button>

            {/* Nút Hamburger cho Mobile */}
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
                Lưu giữ di sản <br />
                <span className="text-emerald-800 italic">bằng ngôn từ của bạn.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-lg">
                Một không gian tĩnh lặng, an toàn để hồi tưởng, viết lại những thăng trầm cuộc đời và gửi gắm yêu thương đến thế hệ sau.
              </motion.p>

              <motion.div variants={fadeInUp} className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartJourney}
                  disabled={isRedirecting}
                  className="min-h-[60px] w-full sm:w-auto px-8 py-3 bg-emerald-800 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-emerald-900 hover:scale-[1.02] hover:shadow-xl transition-all disabled:opacity-75"
                >
                  {isRedirecting ? "Đang chuẩn bị..." : "Bắt đầu lưu giữ kỷ niệm"}
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
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop"
                alt="Hai thế hệ đang chia sẻ câu chuyện"
                fill
                className="object-cover"
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
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-stone-900">Hành trình lưu giữ kỷ niệm</h2>
              <p className="text-xl text-stone-600">Ba bước đơn giản, thong thả theo nhịp độ của riêng bạn.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-stone-300 z-0" />

              {[
                { icon: BookOpen, title: "1. Nhận gợi ý", desc: "Mỗi tuần một câu hỏi gợi mở ký ức để bạn bắt đầu mạch cảm xúc mà không sợ 'bí ý tưởng'." },
                { icon: Heart, title: "2. Viết thong thả", desc: "Không áp lực thời gian, không đếm lượt thích. Chỉ có bạn và những dòng hồi ức chân thực nhất." },
                { icon: ShieldCheck, title: "3. Lưu giữ an toàn", desc: "Tác phẩm được bảo mật tuyệt đối. Bạn là người duy nhất quyết định ai được phép đọc chúng." }
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

        {/* 3. SOCIAL PROOF (Cập nhật 2 câu chuyện) */}
        <section id="testimonials" className="py-24 bg-stone-100 px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto space-y-16"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-sans text-stone-900">Những câu chuyện đã được kể</h2>
              <p className="text-xl text-stone-600">Hàng ngàn gia đình đã kết nối sâu sắc hơn qua từng trang viết.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Câu chuyện 1 */}
              <motion.div variants={fadeInUp} className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-200 relative flex flex-col h-full">
                <span className="absolute top-6 left-6 text-6xl text-emerald-200 font-sans leading-none">"</span>
                <p className="text-lg md:text-xl text-stone-700 font-sans italic leading-relaxed relative z-10 flex-grow">
                  Lúc đầu tôi nghĩ mình chẳng có gì để viết, cuộc đời mình quá đỗi bình thường. Nhưng khi bắt đầu trả lời những câu hỏi gợi ý, ký ức tuổi thơ cứ thế ùa về. Giờ đây, các con tôi rất thích thú mỗi khi tôi gửi cho chúng một đường link kể về ngày xưa.
                </p>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100">
                  <div className="w-14 h-14 bg-stone-300 rounded-full overflow-hidden relative shrink-0">
                    <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Avatar Cô Ngọc Lan" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900">Cô Ngọc Lan</div>
                    <div className="text-stone-500">Giáo viên về hưu, 62 tuổi</div>
                  </div>
                </div>
              </motion.div>

              {/* Câu chuyện 2 */}
              <motion.div variants={fadeInUp} className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-stone-200 relative flex flex-col h-full">
                <span className="absolute top-6 left-6 text-6xl text-emerald-200 font-sans leading-none">"</span>
                <p className="text-lg md:text-xl text-stone-700 font-sans italic leading-relaxed relative z-10 flex-grow">
                  Các con tôi định cư ở nước ngoài, mỗi năm chỉ về thăm được một lần. Nhờ viết lại những câu chuyện trên nền tảng này, tôi cảm thấy như đang trò chuyện với chúng mỗi ngày. Các cháu cũng hiểu hơn về ông bà và cội nguồn của mình dù ở xa.
                </p>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100">
                  <div className="w-14 h-14 bg-stone-300 rounded-full overflow-hidden relative shrink-0">
                    <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" alt="Avatar Chú Hoàng Minh" fill className="object-cover" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-stone-900">Chú Hoàng Minh</div>
                    <div className="text-stone-500">Cán bộ nhà nước, 68 tuổi</div>
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
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold font-sans text-stone-900 text-center">Câu hỏi thường gặp</motion.h2>
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

          {/* Cột trái: Thông tin & Nút CTA */}
          <div className="space-y-6">
            <div className="text-3xl font-bold font-sans text-white">A Story.</div>
            <p className="text-lg max-w-sm">
              Lưu giữ kỷ niệm, thắt chặt tình thân qua từng trang viết.
            </p>
            <button
              onClick={handleStartJourney}
              className="min-h-[56px] px-8 bg-stone-800 text-white rounded-xl text-lg font-medium hover:bg-stone-700 transition-colors border border-stone-700 flex items-center gap-3 w-fit"
            >
              <Mail className="w-5 h-5" /> Bắt đầu ngay hôm nay
            </button>
          </div>

          {/* Cột phải: Navigation Links */}
          <div className="grid grid-cols-2 gap-8"> {/* Đã xóa md:text-right để căn trái đều đặn */}

            {/* Về chúng tôi */}
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">Về chúng tôi</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Sứ mệnh</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Đội ngũ</a></li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div className="space-y-4">
              <h4 className="text-white text-lg font-bold">Hỗ trợ</h4>
              <ul className="space-y-3 list-none p-0 m-0">
                <li><a href="#" className="hover:text-white transition-colors block">Hướng dẫn</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition-colors block">Câu hỏi thường gặp</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-center text-stone-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} A Story. Mọi quyền được bảo lưu.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors block">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors block">Điều khoản sử dụng</a>
          </div>
        </div>
      </footer>
    </div>
  );
}