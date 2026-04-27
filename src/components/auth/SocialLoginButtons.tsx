import { Button } from '@/components/ui/button';
import { Chrome, Github, Apple } from 'lucide-react';

interface SocialLoginButtonsProps {
  onGoogleClick?: () => void;
  onGithubClick?: () => void;
  onAppleClick?: () => void;
}

export function SocialLoginButtons({
  onGoogleClick,
  onGithubClick,
  onAppleClick,
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={onGoogleClick}
          aria-label="Sign in with Google"
        >
          <Chrome className="w-4 h-4" />
          <span className="sr-only">Google</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onGithubClick}
          aria-label="Sign in with GitHub"
        >
          <Github className="w-4 h-4" />
          <span className="sr-only">GitHub</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onAppleClick}
          aria-label="Sign in with Apple"
        >
          <Apple className="w-4 h-4" />
          <span className="sr-only">Apple</span>
        </Button>
      </div>
    </div>
  );
}
