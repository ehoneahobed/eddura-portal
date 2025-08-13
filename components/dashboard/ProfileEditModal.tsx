'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Mail, Calendar, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface EditableUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EditableUserProfile;
  onUpdate: (updatedProfile: EditableUserProfile) => void;
}

export default function ProfileEditModal({ isOpen, onClose, profile, onUpdate }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<EditableUserProfile>({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    dateOfBirth: profile.dateOfBirth || '',
    phoneNumber: profile.phoneNumber || '',
    country: profile.country || '',
    city: profile.city || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onUpdate(formData);
        onClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditableUserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-2xl bg-white dark:bg-[var(--eddura-primary-900)] backdrop-blur-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-[var(--eddura-primary-900)] dark:text-white">Edit Profile</CardTitle>
                    <CardDescription className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">
                      Update your personal information
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-[var(--eddura-primary-500)] dark:text-[var(--eddura-primary-400)] hover:text-[var(--eddura-primary-700)] dark:hover:text-[var(--eddura-primary-200)] hover:bg-[var(--eddura-primary-50)] dark:hover:bg-[var(--eddura-primary-800)] transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      Date of Birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      Country
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="country"
                        type="text"
                        value={formData.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your country"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">
                      City
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-500)]" />
                      <Input
                        id="city"
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="pl-10 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] bg-white dark:bg-[var(--eddura-primary-800)] text-[var(--eddura-primary-900)] dark:text-white placeholder-[var(--eddura-primary-400)] dark:placeholder-[var(--eddura-primary-500)] focus:border-[var(--eddura-primary)] focus:ring-[var(--eddura-primary)] dark:focus:ring-[var(--eddura-primary-300)] transition-all duration-200"
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 border-[var(--eddura-primary-200)] dark:border-[var(--eddura-primary-700)] text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)] hover:bg-[var(--eddura-primary-50)] dark:hover:bg-[var(--eddura-primary-800)] hover:border-[var(--eddura-primary-300)] dark:hover:border-[var(--eddura-primary-600)] transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[var(--eddura-primary)] hover:bg-[var(--eddura-primary-600)] text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}