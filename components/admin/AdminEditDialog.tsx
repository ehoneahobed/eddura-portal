"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X } from "lucide-react";

interface AdminUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'super_admin' | 'moderator' | 'support';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
}

interface AdminEditDialogProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (adminData: Partial<AdminUser>) => Promise<void>;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'admin:create', label: 'Create Admins' },
  { key: 'admin:read', label: 'View Admins' },
  { key: 'admin:update', label: 'Update Admins' },
  { key: 'admin:delete', label: 'Delete Admins' },
  { key: 'admin:invite', label: 'Invite Admins' },
  { key: 'user:read', label: 'View Users' },
  { key: 'user:update', label: 'Update Users' },
  { key: 'user:delete', label: 'Delete Users' },
  { key: 'content:create', label: 'Create Content' },
  { key: 'content:read', label: 'View Content' },
  { key: 'content:update', label: 'Update Content' },
  { key: 'content:delete', label: 'Delete Content' },
  { key: 'analytics:read', label: 'View Analytics' },
  { key: 'settings:read', label: 'View Settings' },
  { key: 'settings:update', label: 'Update Settings' },
  { key: 'system:manage', label: 'System Management' },
];

const ROLE_PERMISSIONS = {
  super_admin: AVAILABLE_PERMISSIONS.map(p => p.key),
  admin: [
    'admin:read', 'admin:update', 'admin:invite',
    'user:read', 'user:update',
    'content:create', 'content:read', 'content:update', 'content:delete',
    'analytics:read', 'settings:read'
  ],
  moderator: [
    'user:read', 'user:update',
    'content:read', 'content:update',
    'analytics:read'
  ],
  support: [
    'user:read', 'content:read', 'analytics:read'
  ]
};

export default function AdminEditDialog({ admin, isOpen, onClose, onSave }: AdminEditDialogProps) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (admin) {
      setFormData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        phoneNumber: admin.phoneNumber || '',
        department: admin.department || '',
        position: admin.position || '',
      });
      setSelectedPermissions(admin.permissions || []);
    }
  }, [admin]);

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role: role as any });
    // Auto-set permissions based on role
    setSelectedPermissions(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []);
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev: string[]) => 
      prev.includes(permission) 
        ? prev.filter((p: string) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        permissions: selectedPermissions,
      });
      onClose();
    } catch (error) {
      console.error('Error saving admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.firstName && formData.lastName && formData.role;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {admin ? 'Edit Admin User' : 'Create Admin User'}
          </DialogTitle>
          <DialogDescription>
            Update admin user information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Enter position"
              />
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role & Status</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <p className="text-sm text-gray-600">
              Select specific permissions for this admin user
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <div key={permission.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.key}
                    checked={selectedPermissions.includes(permission.key)}
                    onCheckedChange={() => handlePermissionToggle(permission.key)}
                  />
                  <Label htmlFor={permission.key} className="text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedPermissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {/* Current Admin Info */}
          {admin && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {admin.lastLoginAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Login:</span>
                    <span className="text-sm font-medium">
                      {new Date(admin.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {admin.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created By:</span>
                    <span className="text-sm font-medium">{admin.createdBy}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}