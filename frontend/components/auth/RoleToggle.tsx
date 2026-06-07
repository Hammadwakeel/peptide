"use client";

import type { UserRole } from "@/lib/auth/types";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "affiliate", label: "Affiliate" },
  { value: "admin", label: "Admin" },
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

type RoleToggleProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <fieldset>
      <legend className="mb-3 block text-sm font-medium text-deep-teal">Role</legend>
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map(({ value: roleValue, label }) => {
          const isSelected = value === roleValue;
          return (
            <label
              key={roleValue}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-xs font-medium transition-all sm:px-3 sm:py-3 sm:text-sm ${
                isSelected
                  ? "border-pacific-teal bg-pacific-teal/10 text-deep-teal ring-2 ring-pacific-teal/25"
                  : "border-deep-teal/15 bg-pure-white text-deep-teal/70 hover:border-deep-teal/25 hover:bg-deep-teal/[0.03]"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={roleValue}
                checked={isSelected}
                onChange={() => onChange(roleValue)}
                className="sr-only"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
