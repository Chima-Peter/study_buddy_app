"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { profileSchema, type ProfileInput } from "@/lib/utils/validators";
import { deleteMe, getMe, updateMe } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { THEME_STORAGE_KEY } from "@/config/constants";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/page-header";
import { useLogout } from "@/lib/hooks/use-logout";
import {
  LogOut,
  Monitor,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const clearSession = useSessionStore((s) => s.clearSession);
  const router = useRouter();
  const { toast } = useToast();
  const handleLogout = useLogout();
  const [theme, setTheme] = useState<"dark" | "light" | "system">("light");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as
      | "dark"
      | "light"
      | "system"
      | null;
    setTheme(stored ?? "light");
    getMe()
      .then((me) => {
        setUser(me);
        reset({
          name: me.name ?? "",
          email: me.email ?? "",
          gender: me.gender ?? "",
          university: me.university ?? "",
          bio: me.bio ?? "",
          timezone: me.timezone ?? "",
        });
      })
      .catch(() => undefined);
  }, [reset, setUser]);

  const applyTheme = (value: "dark" | "light" | "system") => {
    setTheme(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
    const resolved =
      value === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
    document.documentElement.setAttribute("data-theme", resolved);
  };

  const onSave = handleSubmit(async (values) => {
    try {
      const updated = await updateMe(values);
      setUser(updated);
      toast({ title: "Profile updated", variant: "success" });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    }
  });

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteMe();
      clearSession();
      router.replace(routes.login);
    } catch (err) {
      toast({
        title: "Could not delete account",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, appearance, and account"
      />

      <Card className="overflow-hidden p-0">
        <CardHeader className="mb-0 border-b border-border bg-surface-tertiary/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-700">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-base">Profile information</CardTitle>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {user
                  ? `Member since ${formatDate(user.created_at)}`
                  : "Your personal and academic details"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={onSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input label="University" {...register("university")} />
              <Input label="Gender" {...register("gender")} />
              <Input
                label="Timezone"
                className="sm:max-w-md"
                {...register("timezone")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Bio
              </label>
              <textarea
                className="min-h-[110px] w-full resize-y rounded-md border border-border bg-surface-tertiary px-3 py-2 text-sm outline-none transition-colors focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500"
                placeholder="Tell us a little about yourself and what you're studying"
                {...register("bio")}
              />
              {errors.bio?.message && (
                <p className="text-xs text-error">{errors.bio.message}</p>
              )}
            </div>
            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardHeader className="mb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary-700" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose how StudyBuddy looks on this device.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                  theme === value
                    ? "border-primary-500 bg-primary-500/10 text-primary-700"
                    : "border-border hover:bg-surface-tertiary",
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  className="sr-only"
                  checked={theme === value}
                  onChange={() => applyTheme(value)}
                />
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Current session</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Sign out of StudyBuddy on this device.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              try {
                await handleLogout();
              } finally {
                setLoggingOut(false);
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out…" : "Log out"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-error/30 p-5">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Delete account</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Permanently delete your account and all associated data.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete account?"
        description="This action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={deleting} onClick={onDelete}>
            {deleting ? "Deleting..." : "Delete forever"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
