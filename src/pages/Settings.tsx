
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

const SettingsPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

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
      name: "John Doe",
      email: "john.doe@university.edu",
    },
  });

  const handleAccountSubmit = (values) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Account settings updated",
        description: "Your account settings have been updated successfully.",
      });
    }, 1000);
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

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "medium",
    colorBlindMode: false,
    reducedMotion: false,
  });

  const handleAppearanceChange = (key, value) => {
    setAppearance({
      ...appearance,
      [key]: value,
    });
  };

  const handleSaveAppearance = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Appearance settings updated",
        description: "Your appearance settings have been saved.",
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

  const handleSecuritySubmit = (values) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      securityForm.reset();
    }, 1000);
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
                    variant={appearance.theme === "light" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "light")}
                    className="h-20"
                  >
                    Light
                  </Button>
                  <Button 
                    variant={appearance.theme === "dark" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "dark")}
                    className="h-20"
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={appearance.theme === "system" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("theme", "system")}
                    className="h-20"
                  >
                    System
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <Button 
                    variant={appearance.fontSize === "small" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "small")}
                  >
                    Small
                  </Button>
                  <Button 
                    variant={appearance.fontSize === "medium" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "medium")}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={appearance.fontSize === "large" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "large")}
                  >
                    Large
                  </Button>
                  <Button 
                    variant={appearance.fontSize === "x-large" ? "default" : "outline"} 
                    onClick={() => handleAppearanceChange("fontSize", "x-large")}
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
                      checked={appearance.colorBlindMode}
                      onCheckedChange={(checked) => handleAppearanceChange("colorBlindMode", checked)}
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
                      checked={appearance.reducedMotion}
                      onCheckedChange={(checked) => handleAppearanceChange("reducedMotion", checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveAppearance} disabled={saving}>
                {saving ? "Saving..." : "Save Appearance Settings"}
              </Button>
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
