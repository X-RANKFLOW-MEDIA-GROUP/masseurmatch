export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  suggestions: string[];
}

const MIN_LENGTH = 12;
const MIN_SCORE = 2; // Minimum "Fair" strength

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length check
  if (password.length < MIN_LENGTH) {
    feedback.push(`Password must be at least ${MIN_LENGTH} characters long.`);
    suggestions.push("Make your password longer");
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter.");
    suggestions.push("Add uppercase letters (A-Z)");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter.");
    suggestions.push("Add lowercase letters (a-z)");
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push("Password must contain at least one number.");
    suggestions.push("Add numbers (0-9)");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?-]/.test(password)) {
    feedback.push("Password should contain special characters for extra security.");
    suggestions.push("Add special characters (!@#$%^&*...)");
  } else {
    score += 1;
  }

  // Check for common patterns
  if (/^(.)\1+$/.test(password)) {
    feedback.push("Avoid repeating characters.");
    score = Math.max(0, score - 1);
  }

  if (/123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) {
    feedback.push("Avoid sequential characters.");
    score = Math.max(0, score - 1);
  }

  // Map score to strength level
  const strengthScore = Math.min(4, score);

  return {
    isValid: strengthScore >= MIN_SCORE,
    score: strengthScore,
    feedback,
    suggestions: [...new Set(suggestions)],
  };
}

export function getPasswordStrengthLabel(score: number): string {
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return labels[Math.min(4, score)] || "Unknown";
}

export function sanitizePasswordError(error: unknown): string {
  // Never reveal specific password requirements that could be brute-forced
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("password") || message.includes("required") || message.includes("weak")) {
    return "Password does not meet security requirements. Please try a longer password with numbers and special characters.";
  }

  return "Could not update password. Please try again.";
}
