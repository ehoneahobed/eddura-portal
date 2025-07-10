"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, UserPlus, Mail, UserCheck } from "lucide-react";
import { AdminRole } from "@/types/admin";
import { z } from "zod";

const inviteSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

const createAccountSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.string().min(1, "Please select a role"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminInvitePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("invite");
  
  const [inviteFormData, setInviteFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });
  
  const [createAccountFormData, setCreateAccountFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
  const [createAccountErrors, setCreateAccountErrors] = useState<Record<string, string>>({});

  const validateInviteForm = () => {
    try {
      inviteSchema.parse(inviteFormData);
      setInviteErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setInviteErrors(newErrors);
      }
      return false;
    }
  };

  const validateCreateAccountForm = () => {
    try {
      createAccountSchema.parse(createAccountFormData);
      setCreateAccountErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setCreateAccountErrors(newErrors);
      }
      return false;
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateInviteForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitation");
      }

      setSuccess("Invitation sent successfully! The admin will receive an email with instructions.");
      
      // Clear form
      setInviteFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateCreateAccountForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: createAccountFormData.firstName,
          lastName: createAccountFormData.lastName,
          email: createAccountFormData.email,
          password: createAccountFormData.password,
          role: createAccountFormData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create admin account");
      }

      setSuccess("Admin account created successfully! The user can now log in with their email and password.");
      
      // Clear form
      setCreateAccountFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create admin account");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    // Super Admin can create other super admins
    ...(session?.user?.role === 'super_admin' ? [
      { value: AdminRole.SUPER_ADMIN, label: "Super Admin", description: "Full system access including admin management" }
    ] : []),
    { value: AdminRole.ADMIN, label: "Admin", description: "Full administrative access" },
    { value: AdminRole.MODERATOR, label: "Moderator", description: "Content moderation and user management" },
    { value: AdminRole.SUPPORT, label: "Support", description: "Basic support and read access" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Admin User</h1>
        <p className="text-gray-600">
          Choose how you want to add a new admin user to the platform.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Email Invite
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Create Account Directly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Email Invitation
              </CardTitle>
              <CardDescription>
                Send an email invitation to the new admin. They will receive a link to set up their account and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-firstName">First Name</Label>
                    <Input
                      id="invite-firstName"
                      type="text"
                      placeholder="John"
                      value={inviteFormData.firstName}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, firstName: e.target.value })}
                      disabled={isLoading}
                      className={inviteErrors.firstName ? "border-red-500" : ""}
                    />
                    {inviteErrors.firstName && (
                      <p className="text-sm text-red-500">{inviteErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-lastName">Last Name</Label>
                    <Input
                      id="invite-lastName"
                      type="text"
                      placeholder="Doe"
                      value={inviteFormData.lastName}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, lastName: e.target.value })}
                      disabled={isLoading}
                      className={inviteErrors.lastName ? "border-red-500" : ""}
                    />
                    {inviteErrors.lastName && (
                      <p className="text-sm text-red-500">{inviteErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                    disabled={isLoading}
                    className={inviteErrors.email ? "border-red-500" : ""}
                  />
                  {inviteErrors.email && (
                    <p className="text-sm text-red-500">{inviteErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Admin Role</Label>
                  <Select
                    value={inviteFormData.role}
                    onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={inviteErrors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {inviteErrors.role && (
                    <p className="text-sm text-red-500">{inviteErrors.role}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending invitation...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Create Admin Account
              </CardTitle>
              <CardDescription>
                Create an admin account directly with a password. The user can immediately log in with their email and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-firstName">First Name</Label>
                    <Input
                      id="create-firstName"
                      type="text"
                      placeholder="John"
                      value={createAccountFormData.firstName}
                      onChange={(e) => setCreateAccountFormData({ ...createAccountFormData, firstName: e.target.value })}
                      disabled={isLoading}
                      className={createAccountErrors.firstName ? "border-red-500" : ""}
                    />
                    {createAccountErrors.firstName && (
                      <p className="text-sm text-red-500">{createAccountErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-lastName">Last Name</Label>
                    <Input
                      id="create-lastName"
                      type="text"
                      placeholder="Doe"
                      value={createAccountFormData.lastName}
                      onChange={(e) => setCreateAccountFormData({ ...createAccountFormData, lastName: e.target.value })}
                      disabled={isLoading}
                      className={createAccountErrors.lastName ? "border-red-500" : ""}
                    />
                    {createAccountErrors.lastName && (
                      <p className="text-sm text-red-500">{createAccountErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">Email Address</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={createAccountFormData.email}
                    onChange={(e) => setCreateAccountFormData({ ...createAccountFormData, email: e.target.value })}
                    disabled={isLoading}
                    className={createAccountErrors.email ? "border-red-500" : ""}
                  />
                  {createAccountErrors.email && (
                    <p className="text-sm text-red-500">{createAccountErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="Enter password"
                      value={createAccountFormData.password}
                      onChange={(e) => setCreateAccountFormData({ ...createAccountFormData, password: e.target.value })}
                      disabled={isLoading}
                      className={createAccountErrors.password ? "border-red-500" : ""}
                    />
                    {createAccountErrors.password && (
                      <p className="text-sm text-red-500">{createAccountErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-confirmPassword">Confirm Password</Label>
                    <Input
                      id="create-confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={createAccountFormData.confirmPassword}
                      onChange={(e) => setCreateAccountFormData({ ...createAccountFormData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      className={createAccountErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {createAccountErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{createAccountErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-role">Admin Role</Label>
                  <Select
                    value={createAccountFormData.role}
                    onValueChange={(value) => setCreateAccountFormData({ ...createAccountFormData, role: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={createAccountErrors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createAccountErrors.role && (
                    <p className="text-sm text-red-500">{createAccountErrors.role}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleOptions.map((role) => (
              <div key={role.value} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{role.label}</h3>
                <p className="text-gray-600 mb-2">{role.description}</p>
                <div className="text-sm text-gray-500">
                  {role.value === AdminRole.ADMIN && (
                    <span>Can manage content, users, and invite other admins</span>
                  )}
                  {role.value === AdminRole.MODERATOR && (
                    <span>Can moderate content and manage users</span>
                  )}
                  {role.value === AdminRole.SUPPORT && (
                    <span>Can view content and provide support</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}