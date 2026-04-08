"use client";

import { useState, useEffect } from 'react';
import { X, Send, Users, Loader2, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { ContactService } from '@/services/contact.service';
import { StoryShareService } from '@/services/storyShare.service';
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
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch danh bạ khi Modal mở
  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        try {
          setIsLoading(true);
          setError(null);
          setSuccessMsg(null);
          const data = await ContactService.getContacts();
          setContacts(data.content || []);
        } catch (err) {
          setError('Không thể tải danh bạ. Vui lòng thử lại.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchContacts();
      setSelectedContactIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleContact = (contactId: number) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  const handleShare = async () => {
    if (selectedContactIds.length === 0) {
      setError("Vui lòng chọn ít nhất một người nhận.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Lấy danh sách userId từ contact đã chọn (contactId -> userId của contact đó)
      const selectedContacts = contacts.filter(c => selectedContactIds.includes(c.id));

      // Gửi từng lượt chia sẻ đến từng người thân được chọn
      await Promise.all(
        selectedContacts.map(contact =>
          StoryShareService.createStoryShare({
            storyId,
            sharedUserId: contact.userId,
          })
        )
      );

      const names = selectedContacts
        .map(c => c.preferenceName || c.fullname)
        .join(', ');

      setSuccessMsg(`Đã gửi câu chuyện thành công đến: ${names}`);
      setSelectedContactIds([]);

      // Tự đóng modal sau 2.5 giây
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 2500);

    } catch (err) {
      console.error('Lỗi khi gửi câu chuyện:', err);
      setError("Có lỗi xảy ra khi gửi. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity"
      aria-labelledby="share-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl">
              <Send className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-xl font-extrabold text-gray-900">
                Send to relatives
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5 line-clamp-1">
                "{storyTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close window"
            disabled={isSending}
          >
            <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="flex items-start gap-3 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <p className="text-base font-semibold leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Thông báo lỗi */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-base font-medium">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-emerald-700">
              <Loader2 className="w-12 h-12 animate-spin" />
              <p className="text-lg font-bold">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 gap-4 px-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 mb-1">No contacts yet</p>
                <p className="text-base text-gray-500 font-medium">
                  Add relatives to the contact list to share special stories.
                </p>
              </div>
              <Link
                href="/contacts"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-base transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add relatives now
              </Link>
            </div>
          ) : (
            <>
              <p className="text-base text-gray-600 font-medium">
                Select relatives to send this story to:
              </p>
              <div className="flex flex-col gap-3">
                {contacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  const displayName = contact.preferenceName || contact.fullname;
                  const subText = contact.name || contact.phoneNumber || contact.email || 'Relative';

                  return (
                    <label
                      key={contact.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all select-none ${isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                    >
                      {/* Avatar chữ cái đầu */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-extrabold flex-shrink-0 transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-lg font-bold text-gray-900 truncate">
                          {displayName}
                        </span>
                        <span className="text-sm text-gray-500 font-medium mt-0.5 truncate">
                          {subText}
                        </span>
                      </div>

                      {/* Checkbox ẩn, dùng custom UI */}
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => toggleContact(contact.id)}
                      />
                      {/* Custom checkmark */}
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-gray-300 bg-white'
                        }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!successMsg && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="flex items-center justify-center min-h-[48px] px-6 py-2.5 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-800 rounded-xl font-bold text-base transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={isLoading || isSending || contacts.length === 0 || selectedContactIds.length === 0}
              className="flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  <span>
                    Send
                    {selectedContactIds.length > 0 && (
                      <span className="ml-1.5 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                        {selectedContactIds.length}
                      </span>
                    )}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}