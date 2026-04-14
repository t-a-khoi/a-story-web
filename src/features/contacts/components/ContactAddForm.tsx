"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Search,
    UserPlus,
    Loader2,
    CheckCircle2,
    AlertCircle,
    User,
    Phone,
    MapPin,
    Users,
    X,
    ChevronDown,
} from "lucide-react";
import { ProfileService } from "@/services/profile.service";
import { CategoriesService } from "@/services/categories.service";
import { ProfilesResponse } from "@/types/profile";
import { Contact } from "@/types/contact";
import { Category } from "@/types/story";
import { useTranslation } from "@/store/useLanguageStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateContact, useContactsSearch } from "@/hooks/queries/useContacts";
import { QueryRequest } from "@/types/common";

const COUNTRIES = [
    { code: "VN", name: "Việt Nam", dial: "+84", flag: "🇻🇳" },
    { code: "US", name: "Mỹ", dial: "+1", flag: "🇺🇸" },
    { code: "GB", name: "Anh", dial: "+44", flag: "🇬🇧" },
    { code: "JP", name: "Nhật Bản", dial: "+81", flag: "🇯🇵" },
    { code: "KR", name: "Hàn Quốc", dial: "+82", flag: "🇰🇷" },
    { code: "CN", name: "Trung Quốc", dial: "+86", flag: "🇨🇳" },
    { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
];

type SearchTab = "name" | "phone";

export default function ContactAddForm() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<SearchTab>("phone");

    const [existingProfileIds, setExistingProfileIds] = useState<Set<number>>(new Set());

    const [nameKeyword, setNameKeyword] = useState("");

    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");

    const [results, setResults] = useState<ProfilesResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [selectedProfile, setSelectedProfile] = useState<ProfilesResponse | null>(null);
    const [preferenceName, setPreferenceName] = useState("");
    const [addError, setAddError] = useState("");
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

    const phoneInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Queries & Mutations
    const queryRequest: QueryRequest = {
        filters: [
            { field: "user.id", operator: "EQUAL", value: user?.id || 0 },
            { field: "deleted", operator: "EQUAL", value: false },
        ],
        pagination: { page: 0, size: 500 },
        sorts: [{ field: "preferenceName", direction: "ASC" }]
    };

    const { data: contactsData } = useContactsSearch(queryRequest);
    const createMutation = useCreateContact();

    useEffect(() => {
        if (contactsData?.content) {
            const ids = new Set(contactsData.content.map((c: Contact) => c.profileId));
            setExistingProfileIds(ids);
        }
    }, [contactsData]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowCountryDropdown(false);
                setCountrySearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const switchTab = (tab: SearchTab) => {
        setActiveTab(tab);
        setResults([]);
        setHasSearched(false);
        setSearchError("");
        setSelectedProfile(null);
    };

    const handleSearchByName = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const q = nameKeyword.trim();
        if (!q) return;

        setIsSearching(true);
        setSearchError("");
        setHasSearched(true);
        setSelectedProfile(null);

        try {
            const data = await ProfileService.searchProfiles({
                filters: [{ field: "fullname", operator: "LIKE", value: q }],
                pagination: { page: 0, size: 20 },
            });
            setResults(data.content || []);
        } catch {
            setSearchError(t("contacts.add.loadError") || "Không thể tìm kiếm.");
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [nameKeyword, t]);

    const handleSearchByPhone = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const digits = phoneNumber.trim().replace(/\D/g, "");
        if (!digits) return;

        const fullPhone = `${selectedCountry.dial}${digits}`;

        setIsSearching(true);
        setSearchError("");
        setHasSearched(true);
        setSelectedProfile(null);

        try {
            const data = await ProfileService.searchProfiles({
                filters: [{ field: "phoneNumber", operator: "EQUAL", value: fullPhone }],
                pagination: { page: 0, size: 20 },
            });
            setResults(data.content || []);
        } catch {
            setSearchError(t("contacts.add.loadError") || "Không thể tìm kiếm.");
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [phoneNumber, selectedCountry, t]);

    const handleSelectProfile = (profile: ProfilesResponse) => {
        setSelectedProfile(profile);
        setPreferenceName(profile.fullname || "");
        setAddError("");
        setTimeout(() => {
            document.getElementById("add-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const handleAddContact = async () => {
        if (!selectedProfile) return;
        setAddError("");
        
        createMutation.mutate({
            userId: user?.id,
            profileId: selectedProfile.id,
            preferenceName: preferenceName.trim() || selectedProfile.fullname || "",
        }, {
            onSuccess: () => {
                setAddedIds(prev => new Set(prev).add(selectedProfile.id));
                setExistingProfileIds(prev => new Set(prev).add(selectedProfile.id));
                setSelectedProfile(null);
                setPreferenceName("");
                setAddError("");
            },
            onError: (err: any) => {
                // Ưu tiên dùng message đã qua interceptor (thân thiện), fallback về raw
                const msg = err?.message || err?.response?.data?.message || t("contacts.add.addError");
                setAddError(msg);
            },
            onSettled: (_data, error) => {
                // Nếu lỗi, scroll đến form thêm để user thấy thông báo lỗi
                if (error) {
                    document.getElementById("add-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
    };

    const formatGender = (g?: string) => {
        if (g === "MALE") return t("contacts.add.male");
        if (g === "FEMALE") return t("contacts.add.female");
        return "";
    };

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
    );

    const canSearchPhone = phoneNumber.trim().replace(/\D/g, "").length >= 9;
    const canSearchName = nameKeyword.trim().length >= 1;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">

            {/* HEADER BANNER */}
            <div className="bg-teal-50 border border-teal-100 rounded-[30px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Users className="w-32 h-32 text-teal-800" aria-hidden="true" />
                </div>
                <div className="relative z-10 space-y-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-teal-800 hover:text-teal-900 transition-colors font-bold text-lg w-fit bg-white/60 px-4 py-2 rounded-xl"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span>{t("contacts.add.backButton")}</span>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-teal-900 tracking-tight">
                        {t("contacts.add.headerTitle")}
                    </h1>
                    <p className="text-teal-800 text-lg font-medium">
                        {t("contacts.add.headerSubtitle")}
                    </p>
                </div>
            </div>

            {/* THÔNG BÁO ĐÃ THÊM */}
            {addedIds.size > 0 && (
                <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-2xl shadow-sm border-2 border-teal-200">
                    <CheckCircle2 className="w-8 h-8 text-teal-700 flex-shrink-0" />
                    <div>
                        <p className="text-lg font-bold text-teal-800">
                            {t("contacts.add.addedSuccess")} {addedIds.size} {t("contacts.add.addedSuccessSuffix")}
                        </p>
                        <button
                            onClick={() => router.push("/contacts")}
                            className="text-teal-700 hover:text-teal-900 font-bold underline text-base mt-0.5"
                        >
                            {t("contacts.add.viewContacts")}
                        </button>
                    </div>
                </div>
            )}

            {/* KHU VỰC TÌM KIẾM */}
            <div className="bg-white rounded-[30px] shadow-sm border border-pearl-200 p-6 md:p-8 space-y-6">

                <div className="flex gap-1 bg-pearl-50 p-1 rounded-2xl border border-pearl-100">
                    <button
                        onClick={() => switchTab("phone")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === "phone"
                            ? "bg-white text-teal-800 shadow-sm border border-pearl-200"
                            : "text-charcoal-500 hover:text-charcoal-700"
                            }`}
                    >
                        <Phone className="w-5 h-5" />
                        <span>{t("contacts.add.tabPhone")}</span>
                    </button>
                    <button
                        onClick={() => switchTab("name")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === "name"
                            ? "bg-white text-teal-800 shadow-sm border border-pearl-200"
                            : "text-charcoal-500 hover:text-charcoal-700"
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span>{t("contacts.add.tabName")}</span>
                    </button>
                </div>

                {activeTab === "phone" && (
                    <form onSubmit={handleSearchByPhone} className="space-y-4">
                        <label className="text-lg font-bold text-charcoal-700 block">
                            {t("contacts.add.phoneLabel")}
                        </label>

                        <div className="flex gap-3 items-stretch">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCountryDropdown(v => !v);
                                        setCountrySearch("");
                                    }}
                                    className="flex items-center gap-2 h-full min-h-[60px] px-4 bg-white border-2 border-pearl-200 hover:border-teal-300 rounded-xl font-bold text-lg transition-colors whitespace-nowrap"
                                >
                                    <span className="text-2xl">{selectedCountry.flag}</span>
                                    <span className="text-charcoal-800">{selectedCountry.dial}</span>
                                    <ChevronDown className={`w-4 h-4 text-charcoal-400 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                                </button>

                                {showCountryDropdown && (
                                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border-2 border-pearl-100 w-72 max-h-80 flex flex-col overflow-hidden">
                                        <div className="p-3 border-b border-pearl-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                                <input
                                                    type="text"
                                                    value={countrySearch}
                                                    onChange={e => setCountrySearch(e.target.value)}
                                                    placeholder={t("contacts.add.searchCountryPlaceholder")}
                                                    className="w-full pl-9 pr-3 py-2 text-base border border-pearl-200 focus:border-teal-400 rounded-lg outline-none font-medium text-charcoal-900"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {filteredCountries.map(country => (
                                                <button
                                                    key={country.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCountry(country);
                                                        setShowCountryDropdown(false);
                                                        setCountrySearch("");
                                                        phoneInputRef.current?.focus();
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left ${selectedCountry.code === country.code ? "bg-teal-50 text-teal-800" : "text-charcoal-800"
                                                        }`}
                                                >
                                                    <span className="text-2xl flex-shrink-0">{country.flag}</span>
                                                    <span className="flex-1 font-medium text-base">{country.name}</span>
                                                    <span className="font-bold text-base text-charcoal-500">{country.dial}</span>
                                                </button>
                                            ))}
                                            {filteredCountries.length === 0 && (
                                                <p className="text-center text-charcoal-400 py-6 font-medium">{t("contacts.add.noCountry")}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1">
                                <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value.replace(/[^\d\s\-]/g, ""))}
                                    placeholder={t("contacts.add.phonePlaceholder")}
                                    className="w-full px-5 py-4 text-xl border-2 border-pearl-200 hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl outline-none transition-colors font-medium text-charcoal-900 placeholder-charcoal-400"
                                    inputMode="numeric"
                                />
                                {phoneNumber && (
                                    <button
                                        type="button"
                                        onClick={() => { setPhoneNumber(""); phoneInputRef.current?.focus(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-pearl-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-charcoal-400" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!canSearchPhone || isSearching}
                                className="flex items-center gap-2 min-h-[60px] px-6 bg-white hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed text-teal-700 font-bold border-2 border-teal-500 rounded-xl transition-colors text-lg shadow-sm shrink-0"
                            >
                                {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                            </button>
                        </div>

                        {phoneNumber.trim() && (
                            <p className="text-base font-medium text-charcoal-500 pl-1">
                                {t("contacts.add.willSearch")}{" "}
                                <span className="font-extrabold text-teal-800">
                                    {selectedCountry.dial}{phoneNumber.trim().replace(/\D/g, "")}
                                </span>
                            </p>
                        )}
                    </form>
                )}

                {activeTab === "name" && (
                    <form onSubmit={handleSearchByName} className="space-y-4">
                        <label htmlFor="name-search" className="text-lg font-bold text-charcoal-700 block">
                            {t("contacts.add.nameLabel")}
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-charcoal-400 pointer-events-none" />
                                <input
                                    id="name-search"
                                    ref={nameInputRef}
                                    type="text"
                                    value={nameKeyword}
                                    onChange={e => setNameKeyword(e.target.value)}
                                    placeholder={t("contacts.add.namePlaceholder")}
                                    className="w-full pl-12 pr-11 py-4 text-xl border-2 border-pearl-200 hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl outline-none transition-colors font-medium text-charcoal-900 placeholder-charcoal-400"
                                    autoComplete="off"
                                />
                                {nameKeyword && (
                                    <button
                                        type="button"
                                        onClick={() => { setNameKeyword(""); nameInputRef.current?.focus(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-pearl-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-charcoal-400" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!canSearchName || isSearching}
                                className="flex items-center gap-2 min-h-[60px] px-8 bg-white hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed text-teal-700 font-bold border-2 border-teal-500 rounded-xl transition-colors text-xl shadow-sm shrink-0"
                            >
                                {isSearching
                                    ? <Loader2 className="w-6 h-6 animate-spin" />
                                    : <><Search className="w-6 h-6" /><span>{t("contacts.add.search") ?? t("common.search")}</span></>
                                }
                            </button>
                        </div>
                    </form>
                )}

                {searchError && (
                    <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl shadow-sm border-2 border-red-200">
                        <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
                        <p className="text-lg font-bold">{searchError}</p>
                    </div>
                )}

                {isSearching && (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-teal-700">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="text-xl font-bold">{t("contacts.add.searching") ?? t("common.searching")}</p>
                    </div>
                )}

                {hasSearched && !isSearching && !searchError && (
                    <div className="space-y-4 pt-2">
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-pearl-50 rounded-2xl border border-pearl-200 border-dashed">
                                <User className="w-14 h-14 text-pearl-200 mb-3" aria-hidden="true" />
                                <p className="text-xl font-bold text-charcoal-700">{t("contacts.add.noResults")}</p>
                                <p className="text-lg text-charcoal-500 mt-1 font-medium">
                                    {activeTab === "phone"
                                        ? t("contacts.add.noResultsPhoneHint")
                                        : t("contacts.add.noResultsNameHint")}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-base font-bold text-charcoal-500">
                                    {t("contacts.add.foundResults")} {results.length} {t("contacts.add.foundResultsSuffix")}
                                </p>
                                <div className="flex flex-col gap-4">
                                    {results.map(profile => {
                                        const alreadyContact = existingProfileIds.has(profile.id);
                                        const justAdded = addedIds.has(profile.id);
                                        const isSelected = selectedProfile?.id === profile.id;
                                        const isBlocked = alreadyContact || justAdded;

                                        return (
                                            <div
                                                key={profile.id}
                                                className={`bg-white rounded-2xl border-2 p-5 transition-all ${isSelected
                                                    ? "border-teal-400 shadow-md"
                                                    : isBlocked
                                                        ? "border-pearl-100 bg-pearl-50"
                                                        : "border-pearl-200 hover:border-teal-200 hover:shadow-sm"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0 ${isBlocked ? "bg-pearl-100 text-charcoal-400"
                                                        : isSelected ? "bg-teal-700 text-white"
                                                            : "bg-teal-50 text-teal-700"
                                                        }`}>
                                                        {profile.fullname?.charAt(0).toUpperCase() || "?"}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xl font-extrabold truncate ${isBlocked ? "text-charcoal-400" : "text-charcoal-900"}`}>
                                                            {profile.fullname}
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 mt-1 text-base font-medium text-charcoal-400">
                                                            {profile.phoneNumber && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <Phone className="w-4 h-4" />
                                                                    {profile.phoneNumber}
                                                                </span>
                                                            )}
                                                            {profile.gender && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <User className="w-4 h-4" />
                                                                    {formatGender(profile.gender)}
                                                                </span>
                                                            )}
                                                            {profile.address && (
                                                                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                    {profile.address}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isBlocked ? (
                                                        <span className="flex items-center gap-2 px-4 py-2.5 bg-pearl-100 text-charcoal-400 rounded-xl font-bold text-base border border-pearl-200 flex-shrink-0 select-none">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            {t("contacts.add.alreadyContact")}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSelectProfile(profile)}
                                                            className={`flex items-center gap-2 min-h-[48px] px-5 rounded-xl font-bold text-base transition-all flex-shrink-0 border-2 ${isSelected
                                                                ? "bg-teal-50 text-teal-700 border-teal-500"
                                                                : "bg-white hover:bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400"
                                                                }`}
                                                        >
                                                            <UserPlus className="w-5 h-5" />
                                                            {isSelected ? t("contacts.add.selectedButton") : t("contacts.add.selectButton")}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {selectedProfile && (
                <div
                    id="add-form"
                    className="bg-white rounded-[30px] shadow-sm border-2 border-teal-200 p-6 md:p-8 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-charcoal-900 flex items-center gap-3">
                            <UserPlus className="w-7 h-7 text-teal-700" />
                            {t("contacts.add.addFormTitle")}
                        </h2>
                        <button
                            onClick={() => setSelectedProfile(null)}
                            className="flex items-center justify-center w-10 h-10 hover:bg-pearl-100 rounded-xl transition-colors"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5 text-charcoal-500" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-teal-50 rounded-2xl p-5 border border-teal-100">
                        <div className="w-14 h-14 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0">
                            {selectedProfile.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-extrabold text-xl text-charcoal-900">{selectedProfile.fullname}</p>
                            {selectedProfile.phoneNumber && (
                                <p className="text-base text-charcoal-500 font-medium flex items-center gap-1.5 mt-1">
                                    <Phone className="w-4 h-4" />
                                    {selectedProfile.phoneNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="preference-name" className="text-lg font-bold text-charcoal-700 block">
                            {t("contacts.add.preferenceNameLabel")}
                        </label>
                        <input
                            id="preference-name"
                            type="text"
                            value={preferenceName}
                            onChange={e => setPreferenceName(e.target.value)}
                            placeholder={t("contacts.add.preferenceNamePlaceholder")}
                            className="w-full px-5 py-4 text-xl border-2 border-pearl-200 hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 rounded-xl outline-none transition-colors font-medium text-charcoal-900"
                            maxLength={100}
                        />
                        <p className="text-base text-charcoal-400 text-right font-medium">{preferenceName.length}/100</p>
                    </div>

                    {addError && (
                        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-6 rounded-2xl border-2 border-red-200">
                            <AlertCircle className="w-8 h-8 flex-shrink-0" />
                            <p className="text-lg font-bold">{addError}</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            onClick={() => setSelectedProfile(null)}
                            className="flex-1 flex items-center justify-center min-h-[56px] px-8 py-3 bg-white border-2 border-pearl-300 hover:bg-pearl-100 text-charcoal-800 rounded-xl font-bold text-xl transition-colors"
                        >
                            {t("contacts.add.cancelButton")}
                        </button>
                        <button
                            onClick={handleAddContact}
                            disabled={createMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-white hover:bg-teal-50 text-teal-700 border-2 border-teal-500 rounded-xl font-bold text-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createMutation.isPending ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /><span>{t("contacts.add.addingButton")}</span></>
                            ) : (
                                <><UserPlus className="w-6 h-6" /><span>{t("contacts.add.addButton")}</span></>
                            )}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
