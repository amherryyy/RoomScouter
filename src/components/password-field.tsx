"use client";

import { type InputHTMLAttributes, useState } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
};

export function PasswordField({ id, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-field">
      <input id={id} type={isVisible ? "text" : "password"} {...props} />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={`${isVisible ? "Hide" : "Show"} password`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
