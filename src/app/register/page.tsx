'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { User, Mail, Lock, Phone, MapPin, CalendarDays, ArrowRight, Briefcase } from 'lucide-react';
import { useTranslation, useLanguageStore } from '@/store/useLanguageStore';

const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

// Cập nhật InputField: Bổ sung prop 'required' để hiển thị dấu * và 'error' để đổi màu viền
const InputField = ({ icon: Icon, label, error, required, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-500' : 'text-stone-400'}`} />
            </div>
            <input
                {...props}
                required={required}
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
    const { t } = useTranslation();
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
                errorMsg = 'The username must have at least 8 characters.';
            } else if (value.length > 50) {
                errorMsg = 'The username must not exceed 50 characters.';
            } else if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
                errorMsg = 'The username can only contain letters, numbers, and underscores (_).';
            }
        }
        else if (name === 'email') {
            // Regex kiểm tra định dạng email chuẩn
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.length > 0 && !emailRegex.test(value)) {
                errorMsg = 'Please enter a valid email format (e.g., you@example.com).';
            }
        }
        else if (name === 'password') {
            if (value.length > 0 && value.length < 8) {
                errorMsg = 'The password must have at least 8 characters.';
            }
            else if (value.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
                errorMsg = 'The password must contain at least 1 uppercase letter, 1 number, and 1 special character.';
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
                        ? 'Username is required'
                        : formData.username.length < 8
                            ? `Too short (${formData.username.length}/8 characters)`
                            : formData.username.length > 50
                                ? `Too long (${formData.username.length}/50 characters)`
                                : 'Invalid characters (only a-z, A-Z, 0-9, _ allowed)')
                    : '✓ Valid',
                email: !isEmailValid
                    ? (formData.email.length === 0
                        ? 'Email is required'
                        : 'Invalid email format')
                    : '✓ Valid',
                password: !isPasswordValid
                    ? (formData.password.length === 0
                        ? 'Password is required'
                        : formData.password.length < 8
                            ? `Too short (${formData.password.length}/8 characters)`
                            : 'Missing uppercase letter, number, or special character (@$!%*?&)')
                    : '✓ Valid',
            };

            console.group('%c[Register] ❌ Submit failed — User input data', 'color: #ef4444; font-weight: bold;');
            console.log('%cCurrent form data:', 'color: #f59e0b; font-weight: bold;', {
                username: formData.username || '(empty)',
                email: formData.email || '(empty)',
                password: formData.password ? `${'*'.repeat(formData.password.length)} (${formData.password.length} characters)` : '(empty)',
                fullname: formData.fullname || '(empty)',
                phoneNumber: formData.phoneNumber || '(empty)',
                address: formData.address || '(empty)',
                gender: formData.gender,
                userType: formData.userType,
                dateOfBirth: formData.dateOfBirth || '(not selected)',
            });
            console.log('%cValidation errors:', 'color: #ef4444; font-weight: bold;', validationErrors);
            console.log('%cGuidelines:', 'color: #10b981; font-weight: bold;', {
                username: '8–50 characters, only letters (a-z, A-Z), numbers (0-9), and underscores (_)',
                email: 'Valid format: you@example.com',
                password: 'At least 8 characters, must contain: 1 uppercase letter (A-Z), 1 number (0-9), 1 special character (@$!%*?&)',
            });
            console.groupEnd();

            setGlobalError(t('register.errorValidation'));
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

            alert(t('register.successMessage'));
            router.push('/');

        } catch (err: any) {
            // ... (Phần xử lý lỗi bắt giữ nguyên như code cũ của bạn)
            console.error('Registration error:', err);
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
                        <LanguageToggle />
                        <span className="hidden md:inline text-sm text-stone-600">
                            {t('register.loginHint')}
                        </span>
                        <Link href="/" className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-full text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2">
                            {t('register.loginLink')}
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
                                {t('register.headerTitle')}
                            </h1>
                            <p className="mt-4 text-xl text-stone-600 max-w-xl mx-auto">
                                {t('register.headerSubtitle')}
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
                                    {t('register.sectionLogin')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <InputField
                                        icon={User}
                                        label={t('register.fields.username')}
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={fieldErrors.username}
                                        placeholder={t('register.fields.usernamePlaceholder')}
                                    />
                                    <InputField
                                        icon={Lock}
                                        label={t('register.fields.password')}
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={fieldErrors.password}
                                        placeholder={t('register.fields.passwordPlaceholder')}
                                    />
                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={Mail}
                                            label={t('register.fields.email')}
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={fieldErrors.email}
                                            placeholder={t('register.fields.emailPlaceholder')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Khối 2: Thông tin cá nhân */}
                            <div>
                                <h3 className="text-2xl font-semibold text-emerald-900 mb-6 pb-2 border-b border-stone-100">
                                    {t('register.sectionProfile')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={User}
                                            label={t('register.fields.fullname')}
                                            name="fullname"
                                            type="text"
                                            required
                                            value={formData.fullname}
                                            onChange={handleChange}
                                            placeholder={t('register.fields.fullnamePlaceholder')}
                                        />
                                    </div>
                                    <InputField
                                        icon={Phone}
                                        label={t('register.fields.phone')}
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder={t('register.fields.phonePlaceholder')}
                                    />
                                    <InputField
                                        icon={CalendarDays}
                                        label={t('register.fields.dob')}
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-1.5">
                                            {t('register.fields.gender')}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="gender" required value={formData.gender} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all text-md appearance-none">
                                                <option value="MALE">{t('register.fields.genderMale')}</option>
                                                <option value="FEMALE">{t('register.fields.genderFemale')}</option>
                                                <option value="OTHER">{t('register.fields.genderOther')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-1.5">
                                            {t('register.fields.userType')}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="userType" required value={formData.userType} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all text-md appearance-none">
                                                <option value="FAMILY">{t('register.fields.userTypeFamily')}</option>
                                                <option value="SENIOR">{t('register.fields.userTypeSenior')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputField
                                            icon={MapPin}
                                            label={t('register.fields.address')}
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder={t('register.fields.addressPlaceholder')}
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
                                            {t('register.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('register.submitButton')}
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
                        © {new Date().getFullYear()} A Story. {t('register.footer')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

// ─── Language Toggle Component ────────────────────────────────────────────────
function LanguageToggle() {
    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);

    const isVi = language === "vi";

    const toggle = () => {
        setLanguage(isVi ? "en" : "vi");
    };

    return (
        <button
            onClick={toggle}
            type="button"
            title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            className="relative inline-flex items-center w-16 h-8 rounded-full bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 focus:outline-none transition-colors shrink-0"
        >
            <span className="absolute left-2 text-[10px] font-bold text-emerald-800 select-none">VI</span>
            <span className="absolute right-2 text-[10px] font-bold text-emerald-800 select-none">EN</span>

            <span
                className={`z-10 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 transform transition-transform duration-300 ease-in-out ${isVi ? "translate-x-1" : "translate-x-8"
                    }`}
            >
                <span className="text-[14px] leading-none">{isVi ? "🇻🇳" : "🇺🇸"}</span>
            </span>
        </button>
    );
}
