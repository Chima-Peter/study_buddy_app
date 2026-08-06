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
import { LogOut } from "lucide-react";

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
          password: "",
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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          {user && (
            <p className="text-sm text-[var(--text-secondary)]">
              Joined {formatDate(user.created_at)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="University" {...register("university")} />
            <Input label="Gender" {...register("gender")} />
            <Input label="Timezone" {...register("timezone")} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Bio</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-border bg-surface-tertiary px-3 py-2 text-sm"
                {...register("bio")}
              />
              {errors.bio?.message && (
                <p className="text-xs text-error">{errors.bio.message}</p>
              )}
            </div>
            <Input
              label="New password (optional)"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(["light", "dark", "system"] as const).map((value) => (
              <label key={value} className="flex min-touch items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === value}
                  onChange={() => applyTheme(value)}
                />
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
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

      <Card status="error">
        <CardHeader>
          <CardTitle className="text-base">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            This will permanently delete your account and all associated data.
          </p>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
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
