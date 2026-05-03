import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand-bg flex flex-col items-center justify-center z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="text-brand-accent"
          >
            <Trophy size={96} strokeWidth={1.5} />
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -bottom-2 -right-2 bg-brand-text text-brand-bg px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase"
          >
            KWAZYYY
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-black text-brand-text tracking-tighter mb-2 italic">
          SHAH <span className="text-brand-accent">MAT!</span>
        </h1>
        
        <div className="w-48 h-1 bg-brand-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-full h-full bg-brand-accent"
          />
        </div>
        
        <p className="mt-4 text-brand-muted font-mono text-xs uppercase tracking-[0.2em]">
          Initializing Engine...
        </p>
      </motion.div>
      
      {/* Background patterns */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-5 pointer-events-none">
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className={((Math.floor(i / 8) + i) % 2 === 0) ? 'bg-brand-text' : 'bg-transparent'} />
        ))}
      </div>
    </div>
  );
};
