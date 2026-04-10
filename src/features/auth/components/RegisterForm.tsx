'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { User, Mail, Lock, Phone, MapPin, CalendarDays, ArrowRight, Briefcase, Loader2 } from 'lucide-react';
import { useTranslation, useLanguageStore } from '@/store/useLanguageStore';

const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const InputField = ({ icon: Icon, label, error, required, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
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
                    : 'border-pearl-200 text-charcoal-900 placeholder-stone-400 focus:ring-navy-300 focus:border-navy-500'
                    }`}
            />
        </div>
        {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-sm text-red-600 font-medium">
                {error}
            </motion.p>
        )}
    </div>
);

export default function RegisterForm() {
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

    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        email: '',
        password: '',
    });

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

        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

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
            setGlobalError(t('register.errorValidation'));
            return;
        }

        setIsLoading(true);
        setGlobalError('');

        try {
            const dobISO = formData.dateOfBirth
                ? new Date(formData.dateOfBirth).toISOString()
                : null;

            const registerPayload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullname: formData.fullname,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                dateOfBirth: dobISO,
                userType: formData.userType,
            };

            // Lưu pendingProfile để hệ thống tự tạo khi đăng nhập
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
            console.error('Registration error:', err);
            // err.message đã được xử lý qua axios interceptor → thông báo thân thiện cụ thể (ví dụ: "Username exists!")
            const displayMsg = err?.message && err.message !== 'An unexpected error occurred processing your request. Please try again later.'
                ? err.message
                : (t('register.serverError') || 'Registration failed. Please try again.');
            setGlobalError(displayMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pearl-50 text-charcoal-800 flex flex-col font-sans">
            <header className="py-5 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-pearl-200">
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/home" className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-pearl-100 transition">
                        <span className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                            A Story.
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <span className="hidden md:inline text-sm text-charcoal-600">
                            {t('register.loginHint')}
                        </span>
                        <Link href="/" className="px-5 py-2.5 bg-white border border-pearl-200 text-charcoal-700 rounded-full text-sm font-semibold hover:bg-pearl-50 transition-colors flex items-center gap-2">
                            {t('register.loginLink')}
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-gold-200/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-navy-200/20 rounded-full blur-[80px] pointer-events-none md:translate-y-1/2 -translate-x-1/2"></div>

                <motion.div
                    className="w-full max-w-4xl relative z-10"
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                >
                    <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-pearl-200">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-serif font-extrabold text-navy-900 leading-tight">
                                {t('register.headerTitle')}
                            </h1>
                            <p className="mt-4 text-xl text-charcoal-600 max-w-xl mx-auto">
                                {t('register.headerSubtitle')}
                            </p>
                        </div>

                        {globalError && (
                            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
                                <div className="p-1 bg-red-100 rounded-full text-red-600 mt-0.5">✕</div>
                                <p>{globalError}</p>
                            </div>
                        )}

                        <form className="space-y-12" onSubmit={handleSubmit}>
                            {/* Khối 1: Thông tin đăng nhập */}
                            <div className="bg-pearl-50 p-6 md:p-8 rounded-3xl border border-pearl-200">
                                <h3 className="flex items-center gap-2 text-2xl font-bold text-navy-800 mb-6 pb-4 border-b border-pearl-200">
                                    <Lock className="w-6 h-6 text-gold-500" />
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
                            <div className="bg-pearl-50 p-6 md:p-8 rounded-3xl border border-pearl-200">
                                <h3 className="flex items-center gap-2 text-2xl font-bold text-navy-800 mb-6 pb-4 border-b border-pearl-200">
                                    <User className="w-6 h-6 text-gold-500" />
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
                                        <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                                            {t('register.fields.gender')}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="gender" required value={formData.gender} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-pearl-200 rounded-xl text-charcoal-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-500 transition-all text-md appearance-none">
                                                <option value="MALE">{t('register.fields.genderMale')}</option>
                                                <option value="FEMALE">{t('register.fields.genderFemale')}</option>
                                                <option value="OTHER">{t('register.fields.genderOther')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                                            {t('register.fields.userType')}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-stone-400" />
                                            </div>
                                            <select name="userType" required value={formData.userType} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-pearl-200 rounded-xl text-charcoal-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-500 transition-all text-md appearance-none">
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
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full min-h-[60px] flex items-center justify-center gap-3 px-8 py-4 bg-white text-navy-700 border-2 border-navy-500 rounded-2xl text-lg font-bold shadow-sm hover:bg-navy-50 hover:scale-[1.01] hover:shadow-md transition-all disabled:opacity-75 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                                            {t('register.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('register.submitButton')}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gold-400" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 bg-pearl-100 border-t border-pearl-200 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-medium text-charcoal-500">
                        © {new Date().getFullYear()} A Story. {t('register.footer')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

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
            className="relative inline-flex items-center w-16 h-8 rounded-full bg-pearl-100 border-2 border-pearl-200 hover:border-pearl-300 focus:outline-none transition-colors shrink-0"
        >
            <span className="absolute left-2 text-[10px] font-bold text-navy-700 select-none">VI</span>
            <span className="absolute right-2 text-[10px] font-bold text-navy-700 select-none">EN</span>

            <span
                className={`z-10 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-pearl-200 transform transition-transform duration-300 ease-in-out ${isVi ? "translate-x-1" : "translate-x-8"
                    }`}
            >
                <span className="text-[14px] leading-none">{isVi ? "🇻🇳" : "🇺🇸"}</span>
            </span>
        </button>
    );
}
