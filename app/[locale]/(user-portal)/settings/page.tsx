'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  Globe,
  BookOpen,
  Target,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  countryOfResidence?: string;
  nationality?: string;
  city?: string;
  quizCompleted?: boolean;
  quizCompletedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  stats: {
    quizScore: number;
    recommendationsCount: number;
    programsViewed: number;
    applicationsStarted: number;
  };
  careerPreferences?: {
    recommendedFields: string[];
    interests: string[];
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryOfResidence: '',
    nationality: '',
    city: '',
    dateOfBirth: ''
  });

  // Preferences states
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    profileVisibility: 'public',
    language: 'en',
    timezone: 'UTC'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userProfile = await response.json();
        setProfile(userProfile);
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phoneNumber: userProfile.phoneNumber || '',
          countryOfResidence: userProfile.countryOfResidence || userProfile.country || '',
          nationality: userProfile.nationality || '',
          city: userProfile.city || '',
          dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] : ''
        });
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, ...data.user } : null);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success('Preference updated');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">


              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryOfResidence">Country of Residence</Label>
                  <Select value={formData.countryOfResidence} onValueChange={(value) => setFormData(prev => ({ ...prev, countryOfResidence: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country of residence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="af">Afghanistan</SelectItem>
                      <SelectItem value="al">Albania</SelectItem>
                      <SelectItem value="dz">Algeria</SelectItem>
                      <SelectItem value="ad">Andorra</SelectItem>
                      <SelectItem value="ao">Angola</SelectItem>
                      <SelectItem value="ag">Antigua and Barbuda</SelectItem>
                      <SelectItem value="ar">Argentina</SelectItem>
                      <SelectItem value="am">Armenia</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="at">Austria</SelectItem>
                      <SelectItem value="az">Azerbaijan</SelectItem>
                      <SelectItem value="bs">Bahamas</SelectItem>
                      <SelectItem value="bh">Bahrain</SelectItem>
                      <SelectItem value="bd">Bangladesh</SelectItem>
                      <SelectItem value="bb">Barbados</SelectItem>
                      <SelectItem value="by">Belarus</SelectItem>
                      <SelectItem value="be">Belgium</SelectItem>
                      <SelectItem value="bz">Belize</SelectItem>
                      <SelectItem value="bj">Benin</SelectItem>
                      <SelectItem value="bt">Bhutan</SelectItem>
                      <SelectItem value="bo">Bolivia</SelectItem>
                      <SelectItem value="ba">Bosnia and Herzegovina</SelectItem>
                      <SelectItem value="bw">Botswana</SelectItem>
                      <SelectItem value="br">Brazil</SelectItem>
                      <SelectItem value="bn">Brunei</SelectItem>
                      <SelectItem value="bg">Bulgaria</SelectItem>
                      <SelectItem value="bf">Burkina Faso</SelectItem>
                      <SelectItem value="bi">Burundi</SelectItem>
                      <SelectItem value="cv">Cabo Verde</SelectItem>
                      <SelectItem value="kh">Cambodia</SelectItem>
                      <SelectItem value="cm">Cameroon</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="cf">Central African Republic</SelectItem>
                      <SelectItem value="td">Chad</SelectItem>
                      <SelectItem value="cl">Chile</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="co">Colombia</SelectItem>
                      <SelectItem value="km">Comoros</SelectItem>
                      <SelectItem value="cg">Congo</SelectItem>
                      <SelectItem value="cr">Costa Rica</SelectItem>
                      <SelectItem value="hr">Croatia</SelectItem>
                      <SelectItem value="cu">Cuba</SelectItem>
                      <SelectItem value="cy">Cyprus</SelectItem>
                      <SelectItem value="cz">Czech Republic</SelectItem>
                      <SelectItem value="cd">Democratic Republic of the Congo</SelectItem>
                      <SelectItem value="dk">Denmark</SelectItem>
                      <SelectItem value="dj">Djibouti</SelectItem>
                      <SelectItem value="dm">Dominica</SelectItem>
                      <SelectItem value="do">Dominican Republic</SelectItem>
                      <SelectItem value="ec">Ecuador</SelectItem>
                      <SelectItem value="eg">Egypt</SelectItem>
                      <SelectItem value="sv">El Salvador</SelectItem>
                      <SelectItem value="gq">Equatorial Guinea</SelectItem>
                      <SelectItem value="er">Eritrea</SelectItem>
                      <SelectItem value="ee">Estonia</SelectItem>
                      <SelectItem value="sz">Eswatini</SelectItem>
                      <SelectItem value="et">Ethiopia</SelectItem>
                      <SelectItem value="fj">Fiji</SelectItem>
                      <SelectItem value="fi">Finland</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="ga">Gabon</SelectItem>
                      <SelectItem value="gm">Gambia</SelectItem>
                      <SelectItem value="ge">Georgia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="gh">Ghana</SelectItem>
                      <SelectItem value="gr">Greece</SelectItem>
                      <SelectItem value="gd">Grenada</SelectItem>
                      <SelectItem value="gt">Guatemala</SelectItem>
                      <SelectItem value="gn">Guinea</SelectItem>
                      <SelectItem value="gw">Guinea-Bissau</SelectItem>
                      <SelectItem value="gy">Guyana</SelectItem>
                      <SelectItem value="ht">Haiti</SelectItem>
                      <SelectItem value="hn">Honduras</SelectItem>
                      <SelectItem value="hu">Hungary</SelectItem>
                      <SelectItem value="is">Iceland</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="ir">Iran</SelectItem>
                      <SelectItem value="iq">Iraq</SelectItem>
                      <SelectItem value="ie">Ireland</SelectItem>
                      <SelectItem value="il">Israel</SelectItem>
                      <SelectItem value="it">Italy</SelectItem>
                      <SelectItem value="jm">Jamaica</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="jo">Jordan</SelectItem>
                      <SelectItem value="kz">Kazakhstan</SelectItem>
                      <SelectItem value="ke">Kenya</SelectItem>
                      <SelectItem value="ki">Kiribati</SelectItem>
                      <SelectItem value="kw">Kuwait</SelectItem>
                      <SelectItem value="kg">Kyrgyzstan</SelectItem>
                      <SelectItem value="la">Laos</SelectItem>
                      <SelectItem value="lv">Latvia</SelectItem>
                      <SelectItem value="lb">Lebanon</SelectItem>
                      <SelectItem value="ls">Lesotho</SelectItem>
                      <SelectItem value="lr">Liberia</SelectItem>
                      <SelectItem value="ly">Libya</SelectItem>
                      <SelectItem value="li">Liechtenstein</SelectItem>
                      <SelectItem value="lt">Lithuania</SelectItem>
                      <SelectItem value="lu">Luxembourg</SelectItem>
                      <SelectItem value="mg">Madagascar</SelectItem>
                      <SelectItem value="mw">Malawi</SelectItem>
                      <SelectItem value="my">Malaysia</SelectItem>
                      <SelectItem value="mv">Maldives</SelectItem>
                      <SelectItem value="ml">Mali</SelectItem>
                      <SelectItem value="mt">Malta</SelectItem>
                      <SelectItem value="mh">Marshall Islands</SelectItem>
                      <SelectItem value="mr">Mauritania</SelectItem>
                      <SelectItem value="mu">Mauritius</SelectItem>
                      <SelectItem value="mx">Mexico</SelectItem>
                      <SelectItem value="fm">Micronesia</SelectItem>
                      <SelectItem value="md">Moldova</SelectItem>
                      <SelectItem value="mc">Monaco</SelectItem>
                      <SelectItem value="mn">Mongolia</SelectItem>
                      <SelectItem value="me">Montenegro</SelectItem>
                      <SelectItem value="ma">Morocco</SelectItem>
                      <SelectItem value="mz">Mozambique</SelectItem>
                      <SelectItem value="mm">Myanmar</SelectItem>
                      <SelectItem value="na">Namibia</SelectItem>
                      <SelectItem value="nr">Nauru</SelectItem>
                      <SelectItem value="np">Nepal</SelectItem>
                      <SelectItem value="nl">Netherlands</SelectItem>
                      <SelectItem value="nz">New Zealand</SelectItem>
                      <SelectItem value="ni">Nicaragua</SelectItem>
                      <SelectItem value="ne">Niger</SelectItem>
                      <SelectItem value="ng">Nigeria</SelectItem>
                      <SelectItem value="no">Norway</SelectItem>
                      <SelectItem value="om">Oman</SelectItem>
                      <SelectItem value="pk">Pakistan</SelectItem>
                      <SelectItem value="pw">Palau</SelectItem>
                      <SelectItem value="pa">Panama</SelectItem>
                      <SelectItem value="pg">Papua New Guinea</SelectItem>
                      <SelectItem value="py">Paraguay</SelectItem>
                      <SelectItem value="pe">Peru</SelectItem>
                      <SelectItem value="ph">Philippines</SelectItem>
                      <SelectItem value="pl">Poland</SelectItem>
                      <SelectItem value="pt">Portugal</SelectItem>
                      <SelectItem value="qa">Qatar</SelectItem>
                      <SelectItem value="ro">Romania</SelectItem>
                      <SelectItem value="ru">Russia</SelectItem>
                      <SelectItem value="rw">Rwanda</SelectItem>
                      <SelectItem value="kn">Saint Kitts and Nevis</SelectItem>
                      <SelectItem value="lc">Saint Lucia</SelectItem>
                      <SelectItem value="vc">Saint Vincent and the Grenadines</SelectItem>
                      <SelectItem value="ws">Samoa</SelectItem>
                      <SelectItem value="sm">San Marino</SelectItem>
                      <SelectItem value="st">Sao Tome and Principe</SelectItem>
                      <SelectItem value="sa">Saudi Arabia</SelectItem>
                      <SelectItem value="sn">Senegal</SelectItem>
                      <SelectItem value="rs">Serbia</SelectItem>
                      <SelectItem value="sc">Seychelles</SelectItem>
                      <SelectItem value="sl">Sierra Leone</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="sk">Slovakia</SelectItem>
                      <SelectItem value="si">Slovenia</SelectItem>
                      <SelectItem value="sb">Solomon Islands</SelectItem>
                      <SelectItem value="so">Somalia</SelectItem>
                      <SelectItem value="za">South Africa</SelectItem>
                      <SelectItem value="ss">South Sudan</SelectItem>
                      <SelectItem value="es">Spain</SelectItem>
                      <SelectItem value="lk">Sri Lanka</SelectItem>
                      <SelectItem value="sd">Sudan</SelectItem>
                      <SelectItem value="sr">Suriname</SelectItem>
                      <SelectItem value="se">Sweden</SelectItem>
                      <SelectItem value="ch">Switzerland</SelectItem>
                      <SelectItem value="sy">Syria</SelectItem>
                      <SelectItem value="tw">Taiwan</SelectItem>
                      <SelectItem value="tj">Tajikistan</SelectItem>
                      <SelectItem value="tz">Tanzania</SelectItem>
                      <SelectItem value="th">Thailand</SelectItem>
                      <SelectItem value="tl">Timor-Leste</SelectItem>
                      <SelectItem value="tg">Togo</SelectItem>
                      <SelectItem value="to">Tonga</SelectItem>
                      <SelectItem value="tt">Trinidad and Tobago</SelectItem>
                      <SelectItem value="tn">Tunisia</SelectItem>
                      <SelectItem value="tr">Turkey</SelectItem>
                      <SelectItem value="tm">Turkmenistan</SelectItem>
                      <SelectItem value="tv">Tuvalu</SelectItem>
                      <SelectItem value="ug">Uganda</SelectItem>
                      <SelectItem value="ua">Ukraine</SelectItem>
                      <SelectItem value="ae">United Arab Emirates</SelectItem>
                      <SelectItem value="gb">United Kingdom</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uy">Uruguay</SelectItem>
                      <SelectItem value="uz">Uzbekistan</SelectItem>
                      <SelectItem value="vu">Vanuatu</SelectItem>
                      <SelectItem value="va">Vatican City</SelectItem>
                      <SelectItem value="ve">Venezuela</SelectItem>
                      <SelectItem value="vn">Vietnam</SelectItem>
                      <SelectItem value="ye">Yemen</SelectItem>
                      <SelectItem value="zm">Zambia</SelectItem>
                      <SelectItem value="zw">Zimbabwe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select value={formData.nationality} onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="af">Afghanistan</SelectItem>
                      <SelectItem value="al">Albania</SelectItem>
                      <SelectItem value="dz">Algeria</SelectItem>
                      <SelectItem value="ad">Andorra</SelectItem>
                      <SelectItem value="ao">Angola</SelectItem>
                      <SelectItem value="ag">Antigua and Barbuda</SelectItem>
                      <SelectItem value="ar">Argentina</SelectItem>
                      <SelectItem value="am">Armenia</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="at">Austria</SelectItem>
                      <SelectItem value="az">Azerbaijan</SelectItem>
                      <SelectItem value="bs">Bahamas</SelectItem>
                      <SelectItem value="bh">Bahrain</SelectItem>
                      <SelectItem value="bd">Bangladesh</SelectItem>
                      <SelectItem value="bb">Barbados</SelectItem>
                      <SelectItem value="by">Belarus</SelectItem>
                      <SelectItem value="be">Belgium</SelectItem>
                      <SelectItem value="bz">Belize</SelectItem>
                      <SelectItem value="bj">Benin</SelectItem>
                      <SelectItem value="bt">Bhutan</SelectItem>
                      <SelectItem value="bo">Bolivia</SelectItem>
                      <SelectItem value="ba">Bosnia and Herzegovina</SelectItem>
                      <SelectItem value="bw">Botswana</SelectItem>
                      <SelectItem value="br">Brazil</SelectItem>
                      <SelectItem value="bn">Brunei</SelectItem>
                      <SelectItem value="bg">Bulgaria</SelectItem>
                      <SelectItem value="bf">Burkina Faso</SelectItem>
                      <SelectItem value="bi">Burundi</SelectItem>
                      <SelectItem value="cv">Cabo Verde</SelectItem>
                      <SelectItem value="kh">Cambodia</SelectItem>
                      <SelectItem value="cm">Cameroon</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="cf">Central African Republic</SelectItem>
                      <SelectItem value="td">Chad</SelectItem>
                      <SelectItem value="cl">Chile</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="co">Colombia</SelectItem>
                      <SelectItem value="km">Comoros</SelectItem>
                      <SelectItem value="cg">Congo</SelectItem>
                      <SelectItem value="cr">Costa Rica</SelectItem>
                      <SelectItem value="hr">Croatia</SelectItem>
                      <SelectItem value="cu">Cuba</SelectItem>
                      <SelectItem value="cy">Cyprus</SelectItem>
                      <SelectItem value="cz">Czech Republic</SelectItem>
                      <SelectItem value="cd">Democratic Republic of the Congo</SelectItem>
                      <SelectItem value="dk">Denmark</SelectItem>
                      <SelectItem value="dj">Djibouti</SelectItem>
                      <SelectItem value="dm">Dominica</SelectItem>
                      <SelectItem value="do">Dominican Republic</SelectItem>
                      <SelectItem value="ec">Ecuador</SelectItem>
                      <SelectItem value="eg">Egypt</SelectItem>
                      <SelectItem value="sv">El Salvador</SelectItem>
                      <SelectItem value="gq">Equatorial Guinea</SelectItem>
                      <SelectItem value="er">Eritrea</SelectItem>
                      <SelectItem value="ee">Estonia</SelectItem>
                      <SelectItem value="sz">Eswatini</SelectItem>
                      <SelectItem value="et">Ethiopia</SelectItem>
                      <SelectItem value="fj">Fiji</SelectItem>
                      <SelectItem value="fi">Finland</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="ga">Gabon</SelectItem>
                      <SelectItem value="gm">Gambia</SelectItem>
                      <SelectItem value="ge">Georgia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="gh">Ghana</SelectItem>
                      <SelectItem value="gr">Greece</SelectItem>
                      <SelectItem value="gd">Grenada</SelectItem>
                      <SelectItem value="gt">Guatemala</SelectItem>
                      <SelectItem value="gn">Guinea</SelectItem>
                      <SelectItem value="gw">Guinea-Bissau</SelectItem>
                      <SelectItem value="gy">Guyana</SelectItem>
                      <SelectItem value="ht">Haiti</SelectItem>
                      <SelectItem value="hn">Honduras</SelectItem>
                      <SelectItem value="hu">Hungary</SelectItem>
                      <SelectItem value="is">Iceland</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="ir">Iran</SelectItem>
                      <SelectItem value="iq">Iraq</SelectItem>
                      <SelectItem value="ie">Ireland</SelectItem>
                      <SelectItem value="il">Israel</SelectItem>
                      <SelectItem value="it">Italy</SelectItem>
                      <SelectItem value="jm">Jamaica</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="jo">Jordan</SelectItem>
                      <SelectItem value="kz">Kazakhstan</SelectItem>
                      <SelectItem value="ke">Kenya</SelectItem>
                      <SelectItem value="ki">Kiribati</SelectItem>
                      <SelectItem value="kw">Kuwait</SelectItem>
                      <SelectItem value="kg">Kyrgyzstan</SelectItem>
                      <SelectItem value="la">Laos</SelectItem>
                      <SelectItem value="lv">Latvia</SelectItem>
                      <SelectItem value="lb">Lebanon</SelectItem>
                      <SelectItem value="ls">Lesotho</SelectItem>
                      <SelectItem value="lr">Liberia</SelectItem>
                      <SelectItem value="ly">Libya</SelectItem>
                      <SelectItem value="li">Liechtenstein</SelectItem>
                      <SelectItem value="lt">Lithuania</SelectItem>
                      <SelectItem value="lu">Luxembourg</SelectItem>
                      <SelectItem value="mg">Madagascar</SelectItem>
                      <SelectItem value="mw">Malawi</SelectItem>
                      <SelectItem value="my">Malaysia</SelectItem>
                      <SelectItem value="mv">Maldives</SelectItem>
                      <SelectItem value="ml">Mali</SelectItem>
                      <SelectItem value="mt">Malta</SelectItem>
                      <SelectItem value="mh">Marshall Islands</SelectItem>
                      <SelectItem value="mr">Mauritania</SelectItem>
                      <SelectItem value="mu">Mauritius</SelectItem>
                      <SelectItem value="mx">Mexico</SelectItem>
                      <SelectItem value="fm">Micronesia</SelectItem>
                      <SelectItem value="md">Moldova</SelectItem>
                      <SelectItem value="mc">Monaco</SelectItem>
                      <SelectItem value="mn">Mongolia</SelectItem>
                      <SelectItem value="me">Montenegro</SelectItem>
                      <SelectItem value="ma">Morocco</SelectItem>
                      <SelectItem value="mz">Mozambique</SelectItem>
                      <SelectItem value="mm">Myanmar</SelectItem>
                      <SelectItem value="na">Namibia</SelectItem>
                      <SelectItem value="nr">Nauru</SelectItem>
                      <SelectItem value="np">Nepal</SelectItem>
                      <SelectItem value="nl">Netherlands</SelectItem>
                      <SelectItem value="nz">New Zealand</SelectItem>
                      <SelectItem value="ni">Nicaragua</SelectItem>
                      <SelectItem value="ne">Niger</SelectItem>
                      <SelectItem value="ng">Nigeria</SelectItem>
                      <SelectItem value="no">Norway</SelectItem>
                      <SelectItem value="om">Oman</SelectItem>
                      <SelectItem value="pk">Pakistan</SelectItem>
                      <SelectItem value="pw">Palau</SelectItem>
                      <SelectItem value="pa">Panama</SelectItem>
                      <SelectItem value="pg">Papua New Guinea</SelectItem>
                      <SelectItem value="py">Paraguay</SelectItem>
                      <SelectItem value="pe">Peru</SelectItem>
                      <SelectItem value="ph">Philippines</SelectItem>
                      <SelectItem value="pl">Poland</SelectItem>
                      <SelectItem value="pt">Portugal</SelectItem>
                      <SelectItem value="qa">Qatar</SelectItem>
                      <SelectItem value="ro">Romania</SelectItem>
                      <SelectItem value="ru">Russia</SelectItem>
                      <SelectItem value="rw">Rwanda</SelectItem>
                      <SelectItem value="kn">Saint Kitts and Nevis</SelectItem>
                      <SelectItem value="lc">Saint Lucia</SelectItem>
                      <SelectItem value="vc">Saint Vincent and the Grenadines</SelectItem>
                      <SelectItem value="ws">Samoa</SelectItem>
                      <SelectItem value="sm">San Marino</SelectItem>
                      <SelectItem value="st">Sao Tome and Principe</SelectItem>
                      <SelectItem value="sa">Saudi Arabia</SelectItem>
                      <SelectItem value="sn">Senegal</SelectItem>
                      <SelectItem value="rs">Serbia</SelectItem>
                      <SelectItem value="sc">Seychelles</SelectItem>
                      <SelectItem value="sl">Sierra Leone</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                      <SelectItem value="sk">Slovakia</SelectItem>
                      <SelectItem value="si">Slovenia</SelectItem>
                      <SelectItem value="sb">Solomon Islands</SelectItem>
                      <SelectItem value="so">Somalia</SelectItem>
                      <SelectItem value="za">South Africa</SelectItem>
                      <SelectItem value="ss">South Sudan</SelectItem>
                      <SelectItem value="es">Spain</SelectItem>
                      <SelectItem value="lk">Sri Lanka</SelectItem>
                      <SelectItem value="sd">Sudan</SelectItem>
                      <SelectItem value="sr">Suriname</SelectItem>
                      <SelectItem value="se">Sweden</SelectItem>
                      <SelectItem value="ch">Switzerland</SelectItem>
                      <SelectItem value="sy">Syria</SelectItem>
                      <SelectItem value="tw">Taiwan</SelectItem>
                      <SelectItem value="tj">Tajikistan</SelectItem>
                      <SelectItem value="tz">Tanzania</SelectItem>
                      <SelectItem value="th">Thailand</SelectItem>
                      <SelectItem value="tl">Timor-Leste</SelectItem>
                      <SelectItem value="tg">Togo</SelectItem>
                      <SelectItem value="to">Tonga</SelectItem>
                      <SelectItem value="tt">Trinidad and Tobago</SelectItem>
                      <SelectItem value="tn">Tunisia</SelectItem>
                      <SelectItem value="tr">Turkey</SelectItem>
                      <SelectItem value="tm">Turkmenistan</SelectItem>
                      <SelectItem value="tv">Tuvalu</SelectItem>
                      <SelectItem value="ug">Uganda</SelectItem>
                      <SelectItem value="ua">Ukraine</SelectItem>
                      <SelectItem value="ae">United Arab Emirates</SelectItem>
                      <SelectItem value="gb">United Kingdom</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uy">Uruguay</SelectItem>
                      <SelectItem value="uz">Uzbekistan</SelectItem>
                      <SelectItem value="vu">Vanuatu</SelectItem>
                      <SelectItem value="va">Vatican City</SelectItem>
                      <SelectItem value="ve">Venezuela</SelectItem>
                      <SelectItem value="vn">Vietnam</SelectItem>
                      <SelectItem value="ye">Yemen</SelectItem>
                      <SelectItem value="zm">Zambia</SelectItem>
                      <SelectItem value="zw">Zimbabwe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              <Button 
                onClick={handleProfileUpdate} 
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quiz Results */}
          {profile?.quizCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Career Assessment Results</span>
                </CardTitle>
                <CardDescription>
                  Your quiz results and career recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quiz Score</span>
                  <Badge variant="secondary">{profile.stats.quizScore}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed On</span>
                  <span className="text-sm text-muted-foreground">
                    {profile.quizCompletedAt ? formatDate(profile.quizCompletedAt) : 'N/A'}
                  </span>
                </div>
                {profile.careerPreferences?.recommendedFields && (
                  <div>
                    <span className="text-sm font-medium">Recommended Fields</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.careerPreferences.recommendedFields.map((field, index) => (
                        <Badge key={index} variant="outline">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button variant="outline" onClick={() => window.open('/quiz', '_blank')}>
                  <Target className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                View your account details and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Email Verification</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Activity Statistics</span>
              </CardTitle>
              <CardDescription>
                Your activity on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007fbd]">
                    {profile?.stats.quizScore || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Quiz Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007fbd]">
                    {profile?.stats.recommendationsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007fbd]">
                    {profile?.stats.programsViewed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Programs Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#007fbd]">
                    {profile?.stats.applicationsStarted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Applications Started</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional and marketing emails
                  </p>
                </div>
                <Switch
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Privacy & Display</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and display settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  value={preferences.profileVisibility} 
                  onValueChange={(value) => handlePreferenceChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onValueChange={(value) => handlePreferenceChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Password & Security</span>
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                />
              </div>
              <Button variant="outline">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 