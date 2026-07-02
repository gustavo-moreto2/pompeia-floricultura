"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const savedEmailKey = "pompeia-admin-email";

export function AdminLogin() {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(savedEmailKey);

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    setMessage("");

    const emailValue = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password,
    });

    setIsPending(false);
    if (error) {
      setMessage("Login recusado. Verifique e-mail, senha e usuarios no Supabase.");
      return;
    }

    if (rememberEmail) {
      window.localStorage.setItem(savedEmailKey, emailValue);
    } else {
      window.localStorage.removeItem(savedEmailKey);
    }

    window.location.reload();
  }

  return (
    <form action={onSubmit} autoComplete="on" className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail do proprietario</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberEmail}
          onChange={(event) => setRememberEmail(event.target.checked)}
          className="mt-0.5 size-4"
        />
        <span>
          Lembrar e-mail neste computador. A senha pode ser salva pelo navegador
          quando ele perguntar.
        </span>
      </label>
      <Button type="submit" disabled={isPending}>
        <LogIn data-icon="inline-start" />
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
