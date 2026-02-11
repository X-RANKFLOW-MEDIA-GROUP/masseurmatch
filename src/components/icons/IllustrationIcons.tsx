import { motion } from "framer-motion";

interface IllustrationIconProps {
  className?: string;
  size?: number;
}

export const ShieldIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <path
      d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
    <motion.path
      d="M24 8L10 14v10c0 9 6 14.5 14 16.5"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
      fill="none"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay: 0.3 }}
    />
    <motion.path
      d="M17 24l4 4 10-10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.6 }}
    />
    <circle cx="24" cy="24" r="1" fill="currentColor" opacity="0.15" />
  </motion.svg>
);

export const CommunityIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    {/* Center person */}
    <circle cx="24" cy="16" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15 36c0-5 4-9 9-9s9 4 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Left person */}
    <motion.g opacity="0.5" initial={{ x: -5, opacity: 0 }} whileInView={{ x: 0, opacity: 0.5 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
      <circle cx="10" cy="20" r="3.5" stroke="currentColor" strokeWidth="1" />
      <path d="M3 34c0-4 3-7 7-7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </motion.g>
    {/* Right person */}
    <motion.g opacity="0.5" initial={{ x: 5, opacity: 0 }} whileInView={{ x: 0, opacity: 0.5 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
      <circle cx="38" cy="20" r="3.5" stroke="currentColor" strokeWidth="1" />
      <path d="M45 34c0-4-3-7-7-7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </motion.g>
    {/* Connection lines */}
    <motion.path
      d="M14 22l6 2M34 22l-6 2"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.2"
      strokeDasharray="2 2"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.5 }}
    />
  </motion.svg>
);

export const GrowthIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    {/* Graph line */}
    <motion.path
      d="M6 38L16 28l8 6 12-20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay: 0.2 }}
    />
    {/* Arrow tip */}
    <motion.path
      d="M34 14l2 0 0 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1 }}
    />
    {/* Bars background */}
    <motion.g opacity="0.15">
      <rect x="8" y="32" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="16" y="26" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="24" y="22" width="4" height="18" rx="1" fill="currentColor" />
      <rect x="32" y="16" width="4" height="24" rx="1" fill="currentColor" />
    </motion.g>
    {/* Base line */}
    <line x1="4" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </motion.svg>
);

export const StarIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, rotate: -30 }}
    whileInView={{ opacity: 1, rotate: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, type: "spring" }}
  >
    <motion.path
      d="M24 4l5.5 12.5L43 18l-10 9 2.5 13.5L24 34l-11.5 6.5L15 27 5 18l13.5-1.5L24 4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    />
    <motion.path
      d="M24 12l3 7 7.5 1-5.5 5 1.5 7.5L24 29"
      fill="currentColor"
      opacity="0.08"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.08 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 }}
    />
    {/* Sparkles */}
    <motion.circle cx="38" cy="8" r="1" fill="currentColor" opacity="0.4"
      animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.circle cx="8" cy="12" r="0.8" fill="currentColor" opacity="0.3"
      animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.8, 1.3, 0.8] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
    />
  </motion.svg>
);

export const HeartIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <motion.path
      d="M24 42S4 28 4 16c0-6.5 5-12 12-12 4 0 6.5 2 8 4 1.5-2 4-4 8-4 7 0 12 5.5 12 12 0 12-20 26-20 26z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
    />
    {/* Pulse effect */}
    <motion.path
      d="M24 42S4 28 4 16c0-6.5 5-12 12-12 4 0 6.5 2 8 4 1.5-2 4-4 8-4 7 0 12 5.5 12 12 0 12-20 26-20 26z"
      fill="currentColor"
      opacity="0.05"
      animate={{ opacity: [0.03, 0.08, 0.03] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Heartbeat line */}
    <motion.path
      d="M10 24h6l3-6 4 12 3-6h12"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.8 }}
    />
  </motion.svg>
);

export const VerifiedIllustration = ({ className = "", size = 48 }: IllustrationIconProps) => (
  <motion.svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    fill="none"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    {/* Hexagonal badge */}
    <motion.path
      d="M24 4L40 13v14L24 44 8 27V13L24 4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    />
    <motion.path
      d="M24 10L36 17v10L24 38 12 27V17L24 10z"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.2"
      strokeLinejoin="round"
    />
    {/* Check */}
    <motion.path
      d="M17 24l4 4 10-10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.6 }}
    />
  </motion.svg>
);
