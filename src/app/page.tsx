"use client";

import { useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import { authService } from "@/services/auth.service";

export default function WelcomePage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStartJourney = async () => {
    try {
      setIsRedirecting(true);

      // 1. Khởi tạo mã bảo mật PKCE
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      // 2. Lưu verifier vào Session Storage để đối chiếu khi Callback trả về
      sessionStorage.setItem("pkce_code_verifier", verifier);

      // 3. Lấy URL trang đăng nhập (Auth Server)
      const loginUrl = authService.getLoginUrl(challenge);

      // 4. Chuyển hướng người dùng đi đăng nhập/đăng ký
      window.location.href = loginUrl;
    } catch (error) {
      console.error("Lỗi khi kết nối đến hệ thống đăng nhập:", error);
      setIsRedirecting(false);
      // Bạn có thể thêm 1 hàm show toast thông báo lỗi ở đây nếu cần
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
      {/* Thẻ nội dung chính với viền nhẹ, bo góc lớn, đệm rộng rãi */}
      <div className="max-w-2xl w-full bg-white p-8 md:p-14 rounded-2xl shadow-sm border border-gray-200 text-center space-y-10">
        
        {/* Tiêu đề: Rất lớn, rõ ràng */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Chào mừng đến với <br className="md:hidden" /> 
          <span className="text-blue-800">A Story</span>
        </h1>

        {/* Căn dặn / Mô tả: Font lớn, màu tối, khoảng cách dòng (leading) thoáng */}
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          Một không gian yên tĩnh và riêng tư để bạn viết lại câu chuyện cuộc đời, 
          lưu giữ những kỷ niệm quý giá và chia sẻ cho những người thân yêu nhất.
        </p>

        {/* Khu vực thao tác (Call to action): Khoảng cách (gap) lớn */}
        <div className="pt-4 flex flex-col items-center gap-6">
          <button
            onClick={handleStartJourney}
            disabled={isRedirecting}
            className="min-h-[64px] w-full sm:w-auto px-10 py-4 bg-blue-700 text-white rounded-xl text-xl font-bold shadow-md hover:bg-blue-800 active:bg-blue-900 transition-all disabled:opacity-75 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {isRedirecting ? "Đang kết nối..." : "Bắt đầu lưu giữ kỷ niệm"}
          </button>

          {/* Dòng text củng cố niềm tin (Trust indicator) */}
          <p className="text-base md:text-lg text-gray-700 font-medium">
            Không có quảng cáo. Không đếm lượt thích. <br className="sm:hidden" /> Chỉ là câu chuyện của bạn.
          </p>
        </div>
      </div>
    </main>
  );
}