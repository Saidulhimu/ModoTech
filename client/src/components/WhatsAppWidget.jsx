import { useState } from 'react';
import { FiMessageSquare, FiX, FiPhoneCall, FiCheck, FiSend } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '8801575873496'; // International format for 01575-873496
  const displayPhone = '01575-873496';

  const defaultMessage = 'Hello ModoTech! I have an inquiry about a gadget.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Support Card */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                  <SiWhatsapp size={22} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-dark rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">ModoTech Live Desk</h4>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span>●</span> Typically replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close support"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3 bg-gray-50/60">
            <div className="bg-white rounded-2xl p-3 border border-gray-150 text-xs text-gray-700 leading-relaxed shadow-2xs">
              <p className="font-semibold text-dark mb-1">Assalamu Alaikum! 👋</p>
              Looking for authentic tech gadgets, fast delivery status, or warranty claims? Our team is online on WhatsApp!
            </div>

            <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between px-1">
              <span>Direct Hotline:</span>
              <a href={`tel:${displayPhone}`} className="font-bold text-dark hover:text-primary transition-colors flex items-center gap-1">
                <FiPhoneCall size={11} /> {displayPhone}
              </a>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 space-y-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 transition-all active:scale-[0.99]"
              >
                <SiWhatsapp size={16} /> Chat on WhatsApp
              </a>

              <a
                href={`tel:${displayPhone}`}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-dark border border-gray-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FiPhoneCall size={14} /> Direct Phone Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-neutral-900 to-dark text-white hover:from-black hover:to-neutral-900 pl-3 pr-4 py-3 rounded-full shadow-2xl border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Live Customer Support"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
            <SiWhatsapp size={18} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-dark rounded-full animate-ping" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none">Need Help?</span>
          <span className="text-xs font-black text-white leading-tight">Chat with Us</span>
        </div>
      </button>
    </div>
  );
}
