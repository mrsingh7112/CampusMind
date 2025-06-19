import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Department {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  departmentId: string;
}

interface Semester {
  id: string;
  name: string;
}

export default function CreateAnnouncement() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments, courses, and semesters
  const { data: departments } = useSWR<Department[]>('/api/departments', fetcher);
  const { data: courses } = useSWR<Course[]>('/api/courses', fetcher);
  const { data: semesters } = useSWR<Semester[]>('/api/semesters', fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          targetType,
          departments: selectedDepartments,
          courses: selectedCourses,
          semesters: selectedSemesters,
          userTypes: selectedUserTypes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      toast.success('Announcement created successfully');
      // Reset form
      setTitle('');
      setMessage('');
      setTargetType('all');
      setSelectedDepartments([]);
      setSelectedCourses([]);
      setSelectedSemesters([]);
      setSelectedUserTypes([]);
    } catch (error) {
      toast.error('Failed to create announcement');
      console.error('Error creating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
          <BellRing className="w-5 h-5" /> Create Announcement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message"
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="departments">Specific Departments</SelectItem>
                <SelectItem value="courses">Specific Courses</SelectItem>
                <SelectItem value="semesters">Specific Semesters</SelectItem>
                <SelectItem value="userTypes">User Types</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === 'departments' && (
            <div className="space-y-2">
              <Label>Select Departments</Label>
              <div className="grid grid-cols-2 gap-2">
                {departments?.map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept.id}`}
                      checked={selectedDepartments.includes(dept.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDepartments([...selectedDepartments, dept.id]);
                        } else {
                          setSelectedDepartments(selectedDepartments.filter(id => id !== dept.id));
                        }
                      }}
                    />
                    <Label htmlFor={`dept-${dept.id}`}>{dept.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetType === 'courses' && (
            <div className="space-y-2">
              <Label>Select Courses</Label>
              <div className="grid grid-cols-2 gap-2">
                {courses?.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses([...selectedCourses, course.id]);
                        } else {
                          setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                        }
                      }}
                    />
                    <Label htmlFor={`course-${course.id}`}>{course.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetType === 'semesters' && (
            <div className="space-y-2">
              <Label>Select Semesters</Label>
              <div className="grid grid-cols-2 gap-2">
                {semesters?.map((semester) => (
                  <div key={semester.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sem-${semester.id}`}
                      checked={selectedSemesters.includes(semester.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSemesters([...selectedSemesters, semester.id]);
                        } else {
                          setSelectedSemesters(selectedSemesters.filter(id => id !== semester.id));
                        }
                      }}
                    />
                    <Label htmlFor={`sem-${semester.id}`}>{semester.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetType === 'userTypes' && (
            <div className="space-y-2">
              <Label>Select User Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {['STUDENT', 'FACULTY', 'ADMIN'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedUserTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUserTypes([...selectedUserTypes, type]);
                        } else {
                          setSelectedUserTypes(selectedUserTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <Label htmlFor={`type-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Announcement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 