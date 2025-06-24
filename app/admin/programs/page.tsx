'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Program, School } from '@/types';
import { Search, Plus, Edit, Trash2, Clock, DollarSign, Globe } from 'lucide-react';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
    fetchSchools();
  }, []);

  useEffect(() => {
    const filtered = programs.filter(program =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.fieldOfStudy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.degreeType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [programs, searchTerm]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch programs',
        variant: 'destructive'
      });
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown School';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Program deleted successfully'
        });
        fetchPrograms();
      } else {
        throw new Error('Failed to delete program');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete program',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600">Manage academic programs</p>
        </div>
        <Link href="/admin/programs/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search programs by name, field, or degree type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{program.name}</CardTitle>
                  <div className="text-sm text-gray-600 mb-2">
                    {getSchoolName(program.schoolId)}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{program.degreeType}</Badge>
                    <Badge variant="secondary">{program.mode}</Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Link href={`/admin/programs/${program.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(program.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">{program.fieldOfStudy}</div>
                  {program.subfield && (
                    <div className="text-sm text-gray-500">{program.subfield}</div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {program.duration}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {program.tuitionFees.international.toLocaleString()} {program.tuitionFees.currency}
                  <span className="text-xs text-gray-500 ml-1">(Int'l)</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {program.languages.slice(0, 2).map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {language}
                    </Badge>
                  ))}
                  {program.languages.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{program.languages.length - 2} more
                    </Badge>
                  )}
                </div>

                {program.programSummary && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {program.programSummary}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No programs found</div>
          <div className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first program to get started'}
          </div>
        </div>
      )}
    </div>
  );
}