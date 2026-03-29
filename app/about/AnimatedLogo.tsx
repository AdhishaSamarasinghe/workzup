'use client';

import { motion } from 'framer-motion';

export default function AnimatedLogo() {
    return (
        <motion.img
            src="/logo_main.png"
            alt="Workzup Logo"
            className="w-40 md:w-56 object-contain"
            animate={{
                y: [0, -12, 0],
                filter: [
                    'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                    'drop-shadow(0 0 24px rgba(255,255,255,0.75))',
                    'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                ],
            }}
            transition={{
                duration: 3.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
            }}
        />
    );
}
