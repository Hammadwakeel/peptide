"use client";

import { getPasswordStrength } from "@/lib/apply/validation";

type PasswordStrengthIndicatorProps = {
  password: string;
};

const BAR_COLORS = [
  "bg-coral-blush",
  "bg-coral-blush/80",
  "bg-pacific-teal/35",
  "bg-pacific-teal/70",
  "bg-pacific-teal",
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= strength.score ? BAR_COLORS[strength.score] : "bg-deep-teal/10"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-deep-teal/55">
        Strength: <span className="font-light text-deep-teal">{strength.label}</span>
      </p>
      <ul className="grid grid-cols-2 gap-1 text-[10px] text-deep-teal/45">
        <li className={strength.checks.length ? "text-pacific-teal" : ""}>8+ characters</li>
        <li className={strength.checks.uppercase ? "text-pacific-teal" : ""}>Uppercase letter</li>
        <li className={strength.checks.lowercase ? "text-pacific-teal" : ""}>Lowercase letter</li>
        <li className={strength.checks.number ? "text-pacific-teal" : ""}>Number</li>
      </ul>
    </div>
  );
}
