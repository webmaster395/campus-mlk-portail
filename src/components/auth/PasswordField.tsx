"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Champ mot de passe avec bouton « afficher / masquer ». */
export default function PasswordField({
  label,
  name,
  autoComplete,
  minLength,
  placeholder,
}: {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="lbl" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="fld pr-12"
          type={visible ? "text" : "password"}
          name={name}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-texte-doux transition-colors hover:text-iris"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
