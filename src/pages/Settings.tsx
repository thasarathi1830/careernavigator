import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useThemeContext } from "@/contexts/ThemeProvider";

const SettingsPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { preferences, updatePreferences, isLoading: themeLoading } = useThemeContext();

  // Account settings schema
  const accountFormSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
  });

  const accountForm = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
    },
  });

  const handleAccountSubmit = async (values) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update account settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: values.name 
        }
      });

      if (error) {
        throw error;
      }

      // Update email if changed (optional)
      if (values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email
        });

        if (emailError) {
          throw emailError;
        }
      }

      toast({
        title: "Account settings updated",
        description: "Your account settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update account settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAssignments: true,
    emailGrades: true,
    emailAnnouncements: false,
    emailDiscussions: true,
    browserAssignments: true,
    browserGrades: true,
    browserAnnouncements: true,
    browserDiscussions: false,
  });

  const handleNotificationChange = (key, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
  };

  const handleSaveNotifications = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    }, 1000);
  };

  // Security settings
  const securityFormSchema = z.object({
    currentPassword: z.string().min(1, {
      message: "Please enter your current password.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const securityForm = useForm({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSecuritySubmit = async (values) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to change your password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // First authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: values.currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      securityForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle appearance settings
  const handleAppearanceChange = async (key, value) => {
    if (themeLoading) return;
    
    try {
      const updatedPreferences = {
        ...preferences,
        [key]: value
      };
      
      await updatePreferences(updatedPreferences);
    } catch (error) {
      console.error("Error updating appearance:", error);
      toast({
        title: "Error",
        description: "Failed to save appearance settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormDescription>
                          We'll use this email for notifications and account recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Assignments & Due Dates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about upcoming and overdue assignments.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailAssignments}
                      onCheckedChange={(checked) => handleNotificationChange("emailAssignments", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Grades & Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when grades are posted.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailGrades}
                      onCheckedChange={(checked) => handleNotificationChange("emailGrades", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Announcements</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important announcements from your courses.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailAnnouncements}
                      onCheckedChange={(checked) => handleNotificationChange("emailAnnouncements", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Discussion Replies</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone replies to your discussions.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailDiscussions}
                      onCheckedChange={(checked) => handleNotificationChange("emailDiscussions", checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Browser Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Assignments & Due Dates</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications for assignments.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.browserAssignments}
                      onCheckedChange={(checked) => handleNotificationChange("browserAssignments", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Grades & Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications when grades are posted.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.browserGrades}
                      onCheckedChange={(checked) => handleNotificationChange("browserGrades", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Course Announcements</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications for course announcements.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.browserAnnouncements}
                      onCheckedChange={(checked) => handleNotificationChange("browserAnnouncements", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Discussion Replies</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications for discussion replies.
                      </p>
                    </div>
                    <Switch 
                      checked={notificationSettings.browserDiscussions}
                      onCheckedChange={(checked) => handleNotificationChange("browserDiscussions", checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Button 
                    variant={preferences?.theme === "light" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "light")}
                    className="h-20"
                    disabled={themeLoading}
                  >
                    Light
                  </Button>
                  <Button 
                    variant={preferences?.theme === "dark" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "dark")}
                    className="h-20"
                    disabled={themeLoading}
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={preferences?.theme === "system" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "system")}
                    className="h-20"
                    disabled={themeLoading}
                  >
                    System
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <Button 
                    variant={preferences?.fontSize === "small" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "small")}
                    disabled={themeLoading}
                  >
                    Small
                  </Button>
                  <Button 
                    variant={preferences?.fontSize === "medium" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "medium")}
                    disabled={themeLoading}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={preferences?.fontSize === "large" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "large")}
                    disabled={themeLoading}
                  >
                    Large
                  </Button>
                  <Button 
                    variant={preferences?.fontSize === "x-large" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "x-large")}
                    disabled={themeLoading}
                  >
                    X-Large
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Accessibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Color Blind Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use colors that are accessible for color blind users.
                      </p>
                    </div>
                    <Switch 
                      checked={preferences?.colorBlindMode || false}
                      onCheckedChange={(checked) => handleAppearanceChange("colorBlindMode", checked)}
                      disabled={themeLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations throughout the interface.
                      </p>
                    </div>
                    <Switch 
                      checked={preferences?.reducedMotion || false}
                      onCheckedChange={(checked) => handleAppearanceChange("reducedMotion", checked)}
                      disabled={themeLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
