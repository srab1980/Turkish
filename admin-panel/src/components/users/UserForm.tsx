'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { User, UserRole } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

const userSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(UserRole),
  profileImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nativeLanguage: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function UserForm({ user, isOpen, onClose, onSuccess }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [goalInput, setGoalInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: UserRole.STUDENT,
      profileImage: '',
      isActive: true,
      bio: '',
      phoneNumber: '',
      dateOfBirth: '',
      nativeLanguage: '',
      learningGoals: [],
    },
  });

  const watchedGoals = watch('learningGoals') || [];
  const watchedProfileImage = watch('profileImage');

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        password: '', // Don't populate password for editing
        role: user.role,
        profileImage: user.profileImage || '',
        isActive: user.isActive,
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        nativeLanguage: user.nativeLanguage || '',
        learningGoals: user.learningGoals || [],
      });
      setImagePreview(user.profileImage || '');
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
        profileImage: '',
        isActive: true,
        bio: '',
        phoneNumber: '',
        dateOfBirth: '',
        nativeLanguage: '',
        learningGoals: [],
      });
      setImagePreview('');
    }
  }, [user, reset]);

  useEffect(() => {
    setImagePreview(watchedProfileImage || '');
  }, [watchedProfileImage]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      // Remove password if empty for updates
      const formData = { ...data };
      if (user && !formData.password) {
        delete formData.password;
      }

      let response;
      if (user) {
        response = await apiClient.updateUser(user.id, formData);
      } else {
        // For new users, password is required
        if (!formData.password) {
          toast.error('Password is required for new users');
          return;
        }
        response = await apiClient.createUser(formData);
      }

      if (response.success && response.data) {
        toast.success(user ? 'User updated successfully' : 'User created successfully');
        onSuccess(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to save user');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await apiClient.uploadFile(file, 'image');
      if (response.success && response.data) {
        setValue('profileImage', response.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const addGoal = () => {
    const goal = goalInput.trim();
    if (goal && !watchedGoals.includes(goal)) {
      setValue('learningGoals', [...watchedGoals, goal]);
      setGoalInput('');
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setValue('learningGoals', watchedGoals.filter(goal => goal !== goalToRemove));
  };

  const handleGoalInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGoal();
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
          className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                {user ? 'Edit User' : 'Create New User'}
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    className={clsx(
                      'mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.fullName
                        ? 'border-error-300 focus:border-error-500'
                        : 'border-secondary-300 focus:border-primary-500'
                    )}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-error-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={clsx(
                      'mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.email
                        ? 'border-error-300 focus:border-error-500'
                        : 'border-secondary-300 focus:border-primary-500'
                    )}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Password {!user && '*'}
                </label>
                <div className="relative mt-1">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={clsx(
                      'block w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.password
                        ? 'border-error-300 focus:border-error-500'
                        : 'border-secondary-300 focus:border-primary-500'
                    )}
                    placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Role *
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {Object.values(UserRole).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="flex items-center">
                  <Controller
                    name="isActive"
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
                          Active User
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Profile Image
                </label>
                <div className="mt-1 space-y-2">
                  <input
                    {...register('profileImage')}
                    type="url"
                    className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.profileImage && (
                    <p className="text-sm text-error-600">{errors.profileImage.message}</p>
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
                        alt="Profile preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValue('profileImage', '');
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

              {/* Additional Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Phone Number
                  </label>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700">
                    Date of Birth
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Native Language
                </label>
                <input
                  {...register('nativeLanguage')}
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., English, Spanish, Arabic"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-error-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Learning Goals */}
              <div>
                <label className="block text-sm font-medium text-secondary-700">
                  Learning Goals
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyPress={handleGoalInputKeyPress}
                      className="flex-1 rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a learning goal"
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Goals List */}
                  {watchedGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
                        >
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeGoal(goal)}
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
                    {user ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  user ? 'Update User' : 'Create User'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
