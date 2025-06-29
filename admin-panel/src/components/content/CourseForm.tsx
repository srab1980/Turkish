'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Course, CEFRLevel, CreateCourseForm } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  level: z.nativeEnum(CEFRLevel),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  estimatedHours: z.number().min(0, 'Hours must be positive').optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().min(0, 'Order must be positive').optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (course: Course) => void;
}

export default function CourseForm({ course, isOpen, onClose, onSuccess }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      level: CEFRLevel.A1,
      imageUrl: '',
      estimatedHours: 0,
      tags: [],
      isPublished: false,
      order: 0,
    },
  });

  const watchedTags = watch('tags') || [];
  const watchedImageUrl = watch('imageUrl');

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        level: course.level,
        imageUrl: course.imageUrl || '',
        estimatedHours: course.estimatedHours,
        tags: course.tags || [],
        isPublished: course.isPublished,
        order: course.order,
      });
      setImagePreview(course.imageUrl || '');
    } else {
      reset({
        title: '',
        description: '',
        level: CEFRLevel.A1,
        imageUrl: '',
        estimatedHours: 0,
        tags: [],
        isPublished: false,
        order: 0,
      });
      setImagePreview('');
    }
  }, [course, reset]);

  useEffect(() => {
    setImagePreview(watchedImageUrl || '');
  }, [watchedImageUrl]);

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const formData: CreateCourseForm = {
        ...data,
        tags: data.tags?.filter(tag => tag.trim() !== '') || [],
      };

      let response;
      if (course) {
        response = await apiClient.updateCourse(course.id, formData);
      } else {
        response = await apiClient.createCourse(formData);
      }

      if (response.success && response.data) {
        toast.success(course ? 'Course updated successfully' : 'Course created successfully');
        onSuccess(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to save course');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await apiClient.uploadFile(file, 'image');
      if (response.success && response.data) {
        setValue('imageUrl', response.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Course Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className={clsx(
                    'mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.title
                      ? 'border-error-300 focus:border-error-500'
                      : 'border-secondary-300 focus:border-primary-500'
                  )}
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={clsx(
                    'mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    errors.description
                      ? 'border-error-300 focus:border-error-500'
                      : 'border-secondary-300 focus:border-primary-500'
                  )}
                  placeholder="Enter course description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
                )}
              </div>

              {/* Level and Hours */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    CEFR Level *
                  </label>
                  <Controller
                    name="level"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {Object.values(CEFRLevel).map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Estimated Hours
                  </label>
                  <input
                    {...register('estimatedHours', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                  {errors.estimatedHours && (
                    <p className="mt-1 text-sm text-error-600">{errors.estimatedHours.message}</p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Course Image
                </label>
                <div className="mt-1 space-y-2">
                  <input
                    {...register('imageUrl')}
                    type="url"
                    className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-error-600">{errors.imageUrl.message}</p>
                  )}
                  
                  {/* Image Upload */}
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer inline-flex items-center rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50">
                      <PhotoIcon className="mr-2 h-4 w-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="h-32 w-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValue('imageUrl', '');
                          setImagePreview('');
                        }}
                        className="absolute -top-2 -right-2 rounded-full bg-error-500 p-1 text-white hover:bg-error-600"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Tags
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      className="flex-1 rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Tag List */}
                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-800"
                          >
                            <XCircleIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Order
                  </label>
                  <input
                    {...register('order', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <Controller
                    name="isPublished"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm font-medium text-secondary-700">
                          Publish course
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 border-t border-secondary-200 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {course ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  course ? 'Update Course' : 'Create Course'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
