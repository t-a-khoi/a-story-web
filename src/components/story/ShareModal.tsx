"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Users, Send, AlertCircle } from "lucide-react";
import { storyService } from "@/services/story.service";
import { contactService, ContactsResponse } from "@/services/contact.service";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    storyId: string | number;
    storyTitle: string;
}

export default function ShareModal({ isOpen, onClose, storyId, storyTitle }: ShareModalProps) {
    // States quản lý danh bạ
    const [contacts, setContacts] = useState<ContactsResponse[]>([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [contactError, setContactError] = useState("");

    // States quản lý việc gửi
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Gọi API lấy danh bạ mỗi khi Modal được mở
    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        } else {
            // Reset state khi đóng modal
            setIsSuccess(false);
            setSelectedUserId(null);
        }
    }, [isOpen]);

    const fetchContacts = async () => {
        setIsLoadingContacts(true);
        setContactError("");
        try {
            const data = await contactService.getContacts(0, 50); // Lấy tối đa 50 người
            setContacts(data.content || []);
        } catch (error) {
            console.error("Lỗi lấy danh bạ:", error);
            setContactError("Không thể tải danh bạ lúc này. Vui lòng thử lại sau.");
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const handleShare = async () => {
        if (!selectedUserId) return;

        setIsSending(true);
        try {
            await storyService.shareStory({
                storyId: Number(storyId),
                sharedUserId: selectedUserId // Truyền đúng userId của Contact
            });
            setIsSuccess(true);
        } catch (error) {
            console.error("Lỗi khi chia sẻ:", error);
            alert("Đã có lỗi xảy ra. Không thể chia sẻ lúc này.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/60 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* HEADER */}
                <div className="bg-stone-50 px-6 py-5 md:px-8 border-b border-stone-200 flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-800" />
                        Gửi câu chuyện
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-3 bg-stone-200 hover:bg-stone-300 rounded-full text-stone-700 transition-colors"
                    >
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 md:p-8">
                    {isSuccess ? (
                        /* TRẠNG THÁI THÀNH CÔNG */
                        <div className="text-center space-y-6 py-8">
                            <CheckCircle2 className="w-24 h-24 text-emerald-600 mx-auto" />
                            <h3 className="text-3xl font-bold text-stone-900">Đã gửi thành công!</h3>
                            <p className="text-xl text-stone-600 font-medium">
                                Câu chuyện <span className="font-bold text-emerald-800">"{storyTitle}"</span> đã được chia sẻ an toàn.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 min-h-[56px] px-8 bg-stone-800 hover:bg-stone-900 text-white text-xl font-bold rounded-xl transition-colors"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    ) : (
                        /* TRẠNG THÁI CHỌN NGƯỜI NHẬN */
                        <div className="space-y-8">
                            <p className="text-xl text-stone-700 font-medium leading-relaxed">
                                Bạn muốn gửi bài viết <span className="font-bold text-emerald-800">"{storyTitle}"</span> cho ai trong danh bạ gia đình?
                            </p>

                            {/* Danh sách người thân */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {isLoadingContacts ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-stone-500 gap-3">
                                        <Loader2 className="w-10 h-10 animate-spin text-emerald-800" />
                                        <span className="text-lg font-bold">Đang tải danh bạ...</span>
                                    </div>
                                ) : contactError ? (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                                        <AlertCircle className="w-6 h-6" />
                                        <span className="text-lg">{contactError}</span>
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <div className="text-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                                        <p className="text-xl text-stone-600 font-bold mb-2">Danh bạ của bạn đang trống.</p>
                                        <p className="text-lg text-stone-500">Hãy thêm người thân vào danh bạ trước khi chia sẻ nhé.</p>
                                    </div>
                                ) : (
                                    contacts.map((contact) => (
                                        <button
                                            key={contact.id} // Vẫn dùng contact.id làm key cho React
                                            onClick={() => setSelectedUserId(contact.userId)} // LƯU Ý: Lấy userId để xử lý logic
                                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedUserId === contact.userId
                                                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                                                    : "bg-white border-stone-200 hover:border-emerald-300"
                                                }`}
                                        >
                                            <div>
                                                {/* Hiển thị Tên đầy đủ */}
                                                <div className="text-2xl font-bold text-stone-900">{contact.fullname}</div>
                                                {/* Hiển thị Mối quan hệ hoặc Tên danh mục */}
                                                <div className="text-lg text-stone-500 font-medium">
                                                    {contact.preferenceName || contact.name || "Người thân"}
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedUserId === contact.userId ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300"}`}>
                                                {selectedUserId === contact.userId && <CheckCircle2 className="w-6 h-6" />}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Nút Submit */}
                            <button
                                onClick={handleShare}
                                disabled={isSending || !selectedUserId || contacts.length === 0}
                                className="w-full flex justify-center items-center gap-3 min-h-[64px] bg-emerald-800 hover:bg-emerald-900 text-white text-2xl font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                            >
                                {isSending ? (
                                    <><Loader2 className="w-7 h-7 animate-spin" /> Đang gửi...</>
                                ) : (
                                    <><Send className="w-7 h-7" /> Gửi câu chuyện</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}