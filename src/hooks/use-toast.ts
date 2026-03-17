import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast(input: ToastInput) {
  const title = input.title ?? "Notice";

  if (input.variant === "destructive") {
    sonnerToast.error(title, {
      description: input.description,
    });
    return;
  }

  sonnerToast(title, {
    description: input.description,
  });
}

export function useToast() {
  return { toast };
}

export { toast };
