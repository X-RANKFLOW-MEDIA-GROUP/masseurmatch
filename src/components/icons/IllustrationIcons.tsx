import { Heart, Shield, TrendingUp, Users } from "lucide-react";

type IconProps = { className?: string; size?: number };

export function ShieldIllustration({ className, size = 40 }: IconProps) {
  return <Shield className={className} size={size} />;
}

export function CommunityIllustration({ className, size = 40 }: IconProps) {
  return <Users className={className} size={size} />;
}

export function GrowthIllustration({ className, size = 40 }: IconProps) {
  return <TrendingUp className={className} size={size} />;
}

export function HeartIllustration({ className, size = 40 }: IconProps) {
  return <Heart className={className} size={size} />;
}
