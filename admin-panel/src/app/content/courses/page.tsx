'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import CourseList from '@/components/content/CourseList';
import CourseForm from '@/components/content/CourseForm';
import { Course } from '@/types';

export default function CoursesPage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  const handleCreateCourse = () => {
    setEditingCourse(undefined);
    setShowCreateForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleViewCourse = (course: Course) => {
    router.push(`/content/courses/${course.id}`);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingCourse(undefined);
  };

  const handleFormSuccess = (course: Course) => {
    // The CourseList component will automatically refresh via React Query
    setShowCreateForm(false);
    setEditingCourse(undefined);
  };

  return (
    <Layout>
      <div className="p-6">
        <CourseList
          onCreateCourse={handleCreateCourse}
          onEditCourse={handleEditCourse}
          onViewCourse={handleViewCourse}
        />
        
        <CourseForm
          course={editingCourse}
          isOpen={showCreateForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </div>
    </Layout>
  );
}
