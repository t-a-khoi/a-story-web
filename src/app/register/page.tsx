'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { User, Mail, Lock, Phone, MapPin, CalendarDays, ArrowRight, Briefcase } from 'lucide-react';

const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

// Cập nhật InputField: Bổ sung prop 'error' để đổi màu viền và hiện câu cảnh báo
const InputField = ({ icon: Icon, label, error, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-500' : 'text-stone-400'}`} />
            </div>
            <input
                {...props}
                className={`block w-full pl-11 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 transition-all text-md ${error
                    ? 'border-red-400 text-red-900 placeholder-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-stone-200 text-stone-800 placeholder-stone-400 focus:ring-emerald-300 focus:border-emerald-500'
                    }`}
            />
        </div>
        {/* Hiển thị thông báo lỗi ngay dưới ô input */}
        {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-sm text-red-600 font-medium">
                {error}
            </motion.p>
        )}
    </div>
);

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        userType: 'SENIOR',
        fullname: '',
        phoneNumber: '',
        address: '',
        gender: 'MALE',
        dateOfBirth: '',
    });

    // State lưu trữ lỗi của từng trường
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        email: '',
        password: '',
    });

    // Hàm kiểm tra tính hợp lệ của dữ liệu
    const validateField = (name: string, value: string) => {
        let errorMsg = '';

        if (name === 'username') {
            if (value.length > 0 && value.length < 8) {
                errorMsg = 'Tên đăng nhập phải có ít nhất 8 ký tự.';
            } else if (value.length > 50) {
                errorMsg = 'Tên đăng nhập không được vượt quá 50 ký tự.';
            } else if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
                errorMsg = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).';
            }
        }
        else if (name === 'email') {
            // Regex kiểm tra định dạng email chuẩn
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.length > 0 && !emailRegex.test(value)) {
                errorMsg = 'Vui lòng nhập đúng định dạng email (vd: you@example.com).';
            }
        }
        else if (name === 'password') {
            if (value.length > 0 && value.length < 8) {
                errorMsg = 'Mật khẩu phải có ít nhất 8 ký tự.';
            }
            else if (value.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
                errorMsg = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt.';
            }
        }

        setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg === ''; 
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Tự động xóa lỗi khi người dùng bắt đầu gõ lại
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Kiểm tra khi người dùng click ra ngoài ô input
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'username' || name === 'email' || name === 'password') {
            validateField(name, value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateField('username', formData.username);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
        const validationErrors = {
            username: !isUsernameValid
                ? (formData.username.length === 0
                    ? 'Chưa nhập tên đăng nhập'
                    : formData.username.length < 8
                        ? `Quá ngắn (${formData.username.length}/8 ký tự)`
                        : formData.username.length > 50
                            ? `Quá dài (${formData.username.length}/50 ký tự)`
                            : 'Chứa ký tự không hợp lệ (chỉ cho phép a-z, A-Z, 0-9, _)')
                : '✓ Hợp lệ',
            email: !isEmailValid
                ? (formData.email.length === 0
                    ? 'Chưa nhập email'
                    : 'Sai định dạng email')
                : '✓ Hợp lệ',
            password: !isPasswordValid
                ? (formData.password.length === 0
                    ? 'Chưa nhập mật khẩu'
                    : formData.password.length < 8
                        ? `Quá ngắn (${formData.password.length}/8 ký tự)`
                        : 'Thiếu chữ hoa, chữ số hoặc ký tự đặc biệt (@$!%*?&)')
                : '✓ Hợp lệ',
        };

        console.group('%c[Register] ❌ Submit thất bại — Dữ liệu người dùng nhập', 'color: #ef4444; font-weight: bold;');
        console.log('%cDữ liệu form hiện tại:', 'color: #f59e0b; font-weight: bold;', {
            username:    formData.username    || '(trống)',
            email:       formData.email       || '(trống)',
            password:    formData.password    ? `${'*'.repeat(formData.password.length)} (${formData.password.length} ký tự)` : '(trống)',
            fullname:    formData.fullname    || '(trống)',
            phoneNumber: formData.phoneNumber || '(trống)',
            address:     formData.address     || '(trống)',
            gender:      formData.gender,
            userType:    formData.userType,
            dateOfBirth: formData.dateOfBirth || '(chưa chọn)',
        });
        console.log('%cChi tiết lỗi validation:', 'color: #ef4444; font-weight: bold;', validationErrors);
        console.log('%cHướng dẫn điền đúng:', 'color: #10b981; font-weight: bold;', {
            username: 'Từ 8–50 ký tự, chỉ dùng chữ cái (a-z, A-Z), chữ số (0-9) và dấu gạch dưới (_)',
            email:    'Định dạng hợp lệ: you@example.com',
            password: 'Tối thiểu 8 ký tự, phải có: 1 chữ hoa (A-Z), 1 chữ số (0-9), 1 ký tự đặc biệt (@$!%*?&)',
        });
        console.groupEnd();

        setGlobalError('Vui lòng sửa các lỗi hiển thị trên form trước khi tiếp tục.');
        return;
    }

    setIsLoading(true);
    setGlobalError('');

    try {
        const dobISO = formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toISOString()
            : null;

        // 1. Dữ liệu gửi lên API tạo User
        const registerPayload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullname: formData.fullname,
            gender: formData.gender,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            dateOfBirth: dobISO,
            // Các trường dưới có thể BE không dùng, nhưng cứ gửi nếu DTO yêu cầu
            userType: formData.userType, 
        };

        // 2. LƯU TẠM DỮ LIỆU PROFILE VÀO SESSION STORAGE
        sessionStorage.setItem('pendingProfile', JSON.stringify({
            fullName: formData.fullname,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            gender: formData.gender,
            dateOfBirth: dobISO,
        }));

        await authService.register(registerPayload);

        alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        router.push('/');

    } catch (err: any) {
        // ... (Phần xử lý lỗi bắt giữ nguyên như code cũ của bạn)
        console.error('Lỗi đăng ký:', err);
        // ...
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
            <header className="py-5 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-100">
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/home" className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                            A Story.
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-stone-600">Đã có tài khoản?</span>
                        <Link href="/" className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2">
                            Đăng nhập
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center py-16 px-6">
                <motion.div
                    className="w-full max-w-4xl"
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                >
                    <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-stone-100">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-serif font-extrabold text-emerald-950 leading-tight">
                                Khởi nguồn câu chuyện
                            </h1>
                            <p className="mt-4 text-xl text-stone-600 max-w-xl mx-auto">
                                Tham gia cộng đồng A Story. Thiết lập tài khoản và hồ sơ của bạn chỉ trong một bước.
                            </p>
                        </div>

                        {globalError && (
                            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
                                <div className="p-1 bg-red-100 rounded-full text-red-600 mt-0.5">✕</div>
                                <p>{globalError}</p>
                            </div>
                        )}

                        <form className="space-y-10" onSubmit={handleSubmit}>
                            {/* Khối 1: Thông tin đăng nhập */}
                            <div>
                                <h3 className="text-2xl font-semibold text-emerald-900 mb-6 pb-2 border-b border-stone-100">
                                    1. Thông tin đăng nhập
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <InputField
                                        icon={User}
                                        label="Tên đăng nhập"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={fieldErrors.username}
                                        placeholder="johndoe123"
                                    />
                                    <InputField
                                        icon={Lock}
                                        label="Mật khẩu"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={fieldErrors.password}
                                        placeholder="Tối thiểu 8 ký tự"
                                    />
                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={Mail}
                                            label="Email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={fieldErrors.email}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Khối 2: Thông tin cá nhân */}
                            <div>
                                <h3 className="text-2xl font-semibold text-emerald-900 mb-6 pb-2 border-b border-stone-100">
                                    2. Thông tin cá nhân
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={User}
                                            label="Họ và Tên"
                                            name="fullname"
                                            type="text"
                                            required
                                            value={formData.fullname}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <InputField
                                        icon={Phone}
                                        label="Số điện thoại"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+84 901 234 567"
                                    />
                                    <InputField
                                        icon={CalendarDays}
                                        label="Ngày sinh"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-1.5">Giới tính</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all text-md appearance-none">
                                                <option value="MALE">Nam</option>
                                                <option value="FEMALE">Nữ</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-1.5">Loại tài khoản</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="userType" value={formData.userType} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all text-md appearance-none">
                                                <option value="FAMILY">Gia đình (Family)</option>
                                                <option value="SENIOR">Người lớn tuổi (Senior)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={MapPin}
                                            label="Địa chỉ"
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="TP. Hồ Chí Minh"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Khối Submit */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full min-h-[60px] flex items-center justify-center gap-3 px-8 py-4 bg-emerald-800 text-white rounded-2xl text-lg font-bold shadow-lg hover:bg-emerald-900 hover:scale-[1.01] hover:shadow-xl transition-all disabled:opacity-75 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Tạo tài khoản A Story
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 bg-stone-100 border-t border-stone-200 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-stone-500">
                        © {new Date().getFullYear()} A Story. Crafted with passion for sharing.
                    </p>
                </div>
            </footer>
        </div>
    );
}