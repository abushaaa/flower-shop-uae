'use client';

import { useLanguageStore, useUIStore } from '@/lib/stores';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const { locale } = useLanguageStore();

  return (
    <motion.a
      href="https://wa.me/971501234567"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all ${
        locale === 'ar' ? 'left-4' : 'right-4'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
      transition={{
        delay: 1,
        type: 'spring',
        stiffness: 200,
        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      }}
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
