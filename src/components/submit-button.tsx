"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ children, pendingLabel, disabled, type = "submit", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button {...props} type={type} disabled={disabled || pending} aria-busy={pending || undefined}>
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </button>
  );
}
