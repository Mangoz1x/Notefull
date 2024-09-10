import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function Button({ 
    children, 
    variant = 'primary', 
    onClick, 
    className = ''
}) {
  const baseClasses = "font-bold py-3 px-6 rounded-lg transition duration-300";
  const variantClasses = {
    primary: twMerge("bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700", className),
    secondary: twMerge("bg-gray-800 text-gray-200 hover:bg-gray-700", className),
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}