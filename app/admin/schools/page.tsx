'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/types';
import SchoolForm from '@/components/forms/SchoolForm';
import { Search, Plus, Edit, Trash2, Globe, MapPin, Users } from 'lucide-react';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [schools, searchTerm]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch schools',
        variant: 'destructive'
      });
    }
  };

  const handleCreate = async (data: Partial<School>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School created successfully'
        });
        fetchSchools();
        setIsModalOpen(false);
        setEditingSchool(null);
      } else {
        throw new Error('Failed to create school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create school',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<School>) => {
    if (!editingSchool) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/${editingSchool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School updated successfully'
        });
        fetchSchools();
        setIsModalOpen(false);
        setEditingSchool(null);
      } else {
        throw new Error('Failed to update school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update school',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School deleted successfully'
        });
        fetchSchools();
      } else {
        throw new Error('Failed to delete school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete school',
        variant: 'destructive'
      });
    }
  };

  const openCreateModal = () => {
    setEditingSchool(null);
    setIsModalOpen(true);
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchool(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600">Manage educational institutions</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add School
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search schools by name, country, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{school.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {school.city}, {school.country}
                  </div>
                  {school.globalRanking && (
                    <div className="text-sm text-blue-600 font-medium">
                      Ranking: #{school.globalRanking}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(school)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(school.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {school.types.slice(0, 2).map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {school.types.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{school.types.length - 2} more
                    </Badge>
                  )}
                </div>

                {school.yearFounded && (
                  <div className="text-sm text-gray-600">
                    Founded: {school.yearFounded}
                  </div>
                )}

                {school.internationalStudentCount && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {school.internationalStudentCount.toLocaleString()} international students
                  </div>
                )}

                {school.websiteUrl && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Globe className="h-4 w-4 mr-1" />
                    <a
                      href={school.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No schools found</div>
          <div className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first school to get started'}
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchool ? 'Edit School' : 'Create New School'}
            </DialogTitle>
          </DialogHeader>
          <SchoolForm
            school={editingSchool || undefined}
            onSubmit={editingSchool ? handleUpdate : handleCreate}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}