"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Users, PlusCircle, Trash2, Edit, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { contactService, ContactsResponse } from "@/services/contact.service";

export default function ContactsPage() {
    const [contacts, setContacts] = useState<ContactsResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await contactService.getContacts(0, 50);
            setContacts(data.content || []);
        } catch (err) {
            console.error("Lỗi lấy danh bạ:", err);
            setError("Không thể tải danh sách người thân lúc này.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        // UI/UX 55+: Luôn hiển thị xác nhận rõ ràng bằng tiếng Việt, ghi rõ tên người sắp bị xóa
        if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi danh bạ không? Các câu chuyện đã chia sẻ trước đó sẽ không bị mất.`)) {
            // Tương lai sẽ gọi API: await contactService.deleteContact(id);
            alert("Tính năng xóa đang được cập nhật!");
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8 md:space-y-12">

                {/* HEADER TRANG DANH BẠ */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 flex items-center gap-3">
                            <Users className="w-10 h-10 text-emerald-800" />
                            Danh bạ gia đình
                        </h1>
                        <p className="text-xl text-stone-600 font-medium">
                            Quản lý danh sách người thân để chia sẻ câu chuyện.
                        </p>
                    </div>

                    {/* Nút Thêm mới - To, nổi bật */}
                    <button
                        onClick={() => alert("Mở Pop-up Thêm người thân (Sẽ code ở bước sau)")}
                        className="flex items-center justify-center gap-2 min-h-[64px] px-8 bg-emerald-800 hover:bg-emerald-900 text-white text-xl font-bold rounded-2xl transition-all shadow-md hover:shadow-lg w-full md:w-auto shrink-0"
                    >
                        <PlusCircle className="w-7 h-7" />
                        <span>Thêm người thân</span>
                    </button>
                </div>

                {/* DANH SÁCH NGƯỜI THÂN */}
                <section>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-stone-500 gap-4 bg-white rounded-3xl border border-stone-200 shadow-sm">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-800" />
                            <span className="text-xl font-bold">Đang tải danh bạ...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border-2 border-red-200 flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 shrink-0" />
                            <span className="text-xl font-medium">{error}</span>
                        </div>
                    ) : contacts.length === 0 ? (
                        /* TRẠNG THÁI RỖNG (EMPTY STATE) */
                        <div className="text-center py-24 px-6 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-300 space-y-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-stone-200">
                                <UserPlus className="w-12 h-12 text-stone-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-stone-900">Danh bạ của bạn đang trống</h3>
                                <p className="text-xl text-stone-600 font-medium max-w-lg mx-auto">
                                    Hãy thêm tài khoản của con cháu hoặc bạn bè vào đây để có thể dễ dàng gửi cho họ những câu chuyện bạn vừa viết.
                                </p>
                            </div>
                            <button
                                onClick={() => alert("Mở Pop-up Thêm người thân")}
                                className="mt-4 min-h-[56px] px-8 bg-stone-800 hover:bg-stone-900 text-white text-xl font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                            >
                                <PlusCircle className="w-6 h-6" /> Thêm người đầu tiên
                            </button>
                        </div>
                    ) : (
                        /* LƯỚI DANH BẠ (GRID CARD) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="bg-white p-6 rounded-2xl border-2 border-stone-200 hover:border-emerald-300 transition-colors shadow-sm flex flex-col justify-between space-y-6 group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar giả lập màu sắc nhẹ nhàng */}
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-2xl shrink-0 uppercase">
                                            {contact.fullname.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold text-stone-900 line-clamp-1">{contact.fullname}</h3>
                                            <p className="text-lg text-emerald-700 font-medium">{contact.preferenceName || "Người thân"}</p>
                                            <p className="text-lg text-stone-500 line-clamp-1">{contact.email || "Chưa có email"}</p>
                                        </div>
                                    </div>

                                    {/* Hành động (Actions) - Nút bự, chữ rõ ràng */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                                        <button
                                            className="flex items-center justify-center gap-2 min-h-[48px] bg-stone-100 hover:bg-stone-200 text-stone-800 text-lg font-bold rounded-xl transition-colors"
                                            title="Chỉnh sửa thông tin"
                                        >
                                            <Edit className="w-5 h-5" /> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact.id, contact.fullname)}
                                            className="flex items-center justify-center gap-2 min-h-[48px] bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-lg font-bold rounded-xl transition-colors border border-transparent hover:border-red-200"
                                            title="Xóa khỏi danh bạ"
                                        >
                                            <Trash2 className="w-5 h-5" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </MainLayout>
    );
}   