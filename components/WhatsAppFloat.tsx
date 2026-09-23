"use client";

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

export default function WhatsAppFloat() {
  console.log("WhatsAppFloat: Component rendered");
  
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    console.log("WhatsApp: Opening chat");
    const message = encodeURIComponent("Hi! I'm interested in your exhibition stand services. Can you help me with a quote?");
    const whatsappUrl = `https://wa.me/15551234567?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* WhatsApp Float Button */}
      <div id="whatsapp-float-button" className="fixed bottom-6 right-6 z-50 transition-[bottom] duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-float"
        >
          <FaWhatsapp className="w-6 h-6" />
        </button>
      </div>

      {/* WhatsApp Chat Bubble */}
      {isOpen && (
        <div id="whatsapp-chat-bubble" className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl max-w-sm w-80 overflow-hidden animate-scale-in transition-[bottom] duration-300">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">StandsZone Support</h4>
                <p className="text-xs opacity-90">Typically replies in minutes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-4 bg-gray-50">
            <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
              <p className="text-sm text-gray-700">
                👋 Hi there! Welcome to StandsZone!
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-700">
                How can we help you create an extraordinary exhibition experience today?
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-200"
              >
                💬 Start Chat
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-200"
              >
                📋 Get Quote
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-200"
              >
                📞 Request Call
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-3 text-center">
            <p className="text-xs text-gray-500">
              We're online now! Average response time: 2 minutes
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}