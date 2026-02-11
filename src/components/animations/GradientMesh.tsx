import { motion } from "framer-motion";

const blobs = [
  {
    size: 600,
    x: [-20, 30, -10],
    y: [-10, 20, -20],
    scale: [1, 1.3, 1],
    duration: 20,
    opacity: 0.12,
  },
  {
    size: 500,
    x: [30, -20, 20],
    y: [20, -30, 10],
    scale: [1.1, 0.9, 1.1],
    duration: 25,
    opacity: 0.1,
  },
  {
    size: 400,
    x: [-30, 10, -20],
    y: [10, -10, 30],
    scale: [0.9, 1.2, 0.9],
    duration: 18,
    opacity: 0.15,
  },
  {
    size: 350,
    x: [20, -30, 30],
    y: [-20, 10, -10],
    scale: [1, 1.1, 1],
    duration: 22,
    opacity: 0.08,
  },
];

export const GradientMesh = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ filter: "blur(60px)" }}>
    {blobs.map((blob, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: blob.size,
          height: blob.size,
          background: `radial-gradient(circle, rgba(255,255,255,${blob.opacity}) 0%, transparent 70%)`,
          top: `${20 + i * 15}%`,
          left: `${10 + i * 20}%`,
        }}
        animate={{
          x: blob.x,
          y: blob.y,
          scale: blob.scale,
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: blob.duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    ))}
    <div className="absolute inset-0 noise-bg opacity-30" />
  </div>
);
