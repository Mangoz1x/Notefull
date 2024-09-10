'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/elements/Button';
import { GradientCircle } from '@/components/elements/GradientCircle';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative">
      <GradientCircle x="-50%" y="-50%" translateX="25%" translateY="25%" rgb={[65, 105, 225]} />
      <GradientCircle x="100%" y="100%" translateX="-50%" translateY="-50%" rgb={[138, 43, 226]} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1 
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to <span className="text-indigo-400">Notefull</span>
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Revolutionize your study experience with AI-powered note-taking
        </motion.p>
        <motion.div 
          className="space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Button variant="primary" onClick={() => window.location.href = '/auth'}>Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </motion.div>
      </div>
      <motion.div 
        className="mt-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <img 
          src="/notefull-hero.svg" 
          alt="Notefull AI Note-taking" 
          className="max-w-lg mx-auto filter drop-shadow-2xl"
        />
      </motion.div>

    </div>
  );
}
