"use client";

import { useState, useEffect } from 'react';
import { X, Send, Users, Loader2, AlertCircle } from 'lucide-react';
import { ContactService } from '@/services/contact.service';
import { Contact } from '@/types/contact';


interface ShareModalProps {
  storyId: number;
  storyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ storyId, storyTitle, isOpen, onClose }: ShareModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch danh bạ khi Modal mở
  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await ContactService.getContacts();
          // Lấy mảng content từ PageResponse
          setContacts(data.content || []);
        } catch (err) {
          setError('Không thể tải danh bạ. Vui lòng thử lại.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchContacts();
      // Reset danh sách đã chọn mỗi khi mở lại modal
      setSelectedContactIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleContact = (id: number) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (selectedContactIds.length === 0) {
      alert("Vui lòng chạm để chọn ít nhất một người nhận.");
      return;
    }
    
    try {
      // TODO: Tích hợp API gửi bài viết ở đây
      // await StoryService.shareStory(storyId, selectedContactIds);
      
      console.log(`Đã gửi bài ${storyId} cho các user có ID:`, selectedContactIds);
      alert("Đã gửi câu chuyện thành công!");
      onClose();
    } catch (err) {
      alert("Có lỗi xảy ra khi gửi. Vui lòng thử lại.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 p-4 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-slate-50">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-700" aria-hidden="true" />
            Chia sẻ câu chuyện
          </h2>
          <button 
            onClick={onClose}
            className="flex items-center justify-center p-3 hover:bg-gray-200 rounded-full transition-colors focus:ring-4 focus:ring-gray-300"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-8 h-8 text-gray-700" aria-hidden="true" />
          </button>
        </div>

        {/* Content: Loading, Lỗi, hoặc Danh sách liên hệ */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <p className="text-lg text-gray-800 font-medium mb-2">
            Bạn muốn gửi bài viết <span className="font-bold">"{storyTitle}"</span> cho ai?
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-blue-700">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-xl font-medium">Đang tải danh bạ...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 bg-red-50 text-red-800 p-5 rounded-xl border border-red-200">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-gray-200">
              <p className="text-xl text-gray-700">Danh bạ của bạn hiện đang trống.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                // Ưu tiên hiển thị Tên gợi nhớ (preferenceName), nếu không có dùng tên thật (fullname)
                const displayName = contact.preferenceName || contact.fullname;
                // Nhóm quan hệ hoặc số điện thoại hiển thị mờ bên dưới
                const subText = contact.name || contact.phoneNumber || 'Người thân';

                return (
                  <label 
                    key={contact.id}
                    className={`flex items-center gap-5 p-5 border-2 rounded-xl cursor-pointer transition-colors min-h-[88px] ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Custom Checkbox lớn cho người lớn tuổi dễ nhìn */}
                    <input 
                      type="checkbox" 
                      className="w-8 h-8 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      checked={isSelected}
                      onChange={() => toggleContact(contact.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-gray-900">
                        {displayName}
                      </span>
                      <span className="text-base text-gray-700 mt-1">
                        {subText}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Hành động */}
        <div className="p-6 border-t border-gray-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 bg-white border-2 border-gray-300 hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-colors text-lg"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleShare}
            disabled={isLoading || contacts.length === 0}
            className="flex items-center justify-center gap-3 min-h-[56px] px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium transition-colors text-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-6 h-6" aria-hidden="true" />
            <span>Gửi câu chuyện</span>
          </button>
        </div>

      </div>
    </div>
  );
}