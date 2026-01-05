"use client";

import { useState, useTransition, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { Sparkles, Check } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SettingsContentProps {
  user: User;
}

function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setMounted(true);
    // Load settings from localStorage
    const savedEmailNotifications = localStorage.getItem("emailNotifications") !== "false";
    const savedBudgetAlerts = localStorage.getItem("budgetAlerts") !== "false";
    setEmailNotifications(savedEmailNotifications);
    setBudgetAlerts(savedBudgetAlerts);
    // TODO: Check Pro status from database or Supabase metadata
  }, []);

  const handleSignOut = async () => {
    startTransition(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Failed to sign out");
      } else {
        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
      }
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as "USD" | "JPY" | "BRL");
    toast.success("Currency updated");
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem("emailNotifications", checked.toString());
    toast.success("Email notifications updated");
  };

  const handleBudgetAlertsChange = (checked: boolean) => {
    setBudgetAlerts(checked);
    localStorage.setItem("budgetAlerts", checked.toString());
    toast.success("Budget alerts updated");
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast.success("Theme updated");
  };

  const handleUpgradeToPro = () => {
    // TODO: Implement Pro subscription flow
    toast.info("Pro subscription coming soon!");
  };

  if (!mounted) {
    return null;
  }

  const currencies = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
    { value: "BRL", label: "Brazilian Real (R$)", symbol: "R$" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your email address cannot be changed
            </p>
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              value={user.id}
              disabled
              className="bg-muted font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Set your preferred currency for displaying amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used to display all monetary amounts throughout the app
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary"></div>
            </label>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you exceed your budget limits
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => handleBudgetAlertsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme || "system"} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pro Subscription */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Pro Subscription</CardTitle>
          </div>
          <CardDescription>
            Unlock advanced features and unlimited access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <div className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <p className="font-medium">You are currently on Pro plan</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Pro Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Unlimited transactions</li>
                  <li>Advanced analytics and reports</li>
                  <li>Export data to CSV/Excel</li>
                  <li>Priority support</li>
                  <li>Custom categories and tags</li>
                </ul>
              </div>
              <Button onClick={handleUpgradeToPro} className="w-full">
                Upgrade to Pro
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Danger Zone</Label>
            <p className="text-sm text-muted-foreground">
              Irreversible and destructive actions
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isPending}
            >
              {isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsContent;
