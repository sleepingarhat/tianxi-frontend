import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { Card, PageHead } from "@/components/tx/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "帳戶登入 · 天喜 TIANXI" },
      { name: "description", content: "登入天喜帳戶，進入內部監控台與會員功能。" },
      { property: "og:title", content: "帳戶登入 · 天喜 TIANXI" },
      { property: "og:description", content: "登入天喜帳戶，進入內部監控台與會員功能。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/admin" });
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setMsg("已建立帳戶。如需電郵確認，請先檢查收件箱，然後回來登入。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.navigate({ to: "/admin" });
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) setErr(error.message);
  }

  return (
    <AppShell ticker="帳戶登入 · 內部監控台需管理員權限">
      <PageHead en="Account Sign In" title="帳戶登入" desc="內部監控台需要管理員權限；一般帳戶登入後只會看到會員區。" />

      <Card title={mode === "signin" ? "登入" : "註冊"} en="Auth">
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-[11px] text-ink-3">
            電郵
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </label>
          <label className="block text-[11px] text-ink-3">
            密碼
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[8px] bg-deep px-3 py-2 font-serif-tc text-[13px] text-deep-fg disabled:opacity-50"
          >
            {busy ? "處理中…" : mode === "signin" ? "登入" : "建立帳戶"}
          </button>
        </form>

        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[13px] text-ink"
        >
          用 Google 繼續
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
            setMsg(null);
          }}
          className="mt-3 text-[11px] text-ink-3 underline"
        >
          {mode === "signin" ? "未有帳戶？註冊" : "已有帳戶？登入"}
        </button>

        {err && <p className="mt-3 text-[12px] text-lose">{err}</p>}
        {msg && <p className="mt-3 text-[12px] text-win">{msg}</p>}
      </Card>
    </AppShell>
  );
}
