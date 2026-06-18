import { Inter, Unbounded } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

export default { inter, unbounded };
