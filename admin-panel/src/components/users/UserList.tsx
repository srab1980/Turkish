'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { User, UserRole, QueryParams } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface UserListProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
}

export default function UserList({ onCreateUser, onEditUser, onViewUser }: UserListProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const queryParams: QueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    filters: {
      role: selectedRole !== 'all' ? selectedRole : undefined,
      isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
    },
  }), [searchQuery, selectedRole, selectedStatus]);

  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => apiClient.getUsers(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      apiClient.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });

  const users = usersResponse?.data?.data?.items || [];
  const totalUsers = usersResponse?.data?.data?.total || 0;

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.fullName}"?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(id => apiClient.deleteUser(id)));
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} users deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete some users');
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: 'bg-error-100 text-error-800',
      [UserRole.INSTRUCTOR]: 'bg-warning-100 text-warning-800',
      [UserRole.STUDENT]: 'bg-primary-100 text-primary-800',
    };
    return colors[role] || 'bg-secondary-100 text-secondary-800';
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.ADMIN]: ShieldCheckIcon,
      [UserRole.INSTRUCTOR]: ShieldExclamationIcon,
      [UserRole.STUDENT]: UserPlusIcon,
    };
    return icons[role] || UserPlusIcon;
  };

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-error-600">Failed to load users</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
            className="mt-2 text-sm text-primary-600 hover:text-primary-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <button
          onClick={onCreateUser}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="block w-full rounded-lg border border-secondary-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-secondary-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              showFilters
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
            )}
          >
            <FunnelIcon className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">
              {selectedUsers.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center rounded-lg bg-error-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-error-700"
            >
              <TrashIcon className="mr-1 h-4 w-4" />
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-secondary-600 hover:text-secondary-900"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-secondary-200 bg-white p-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          Showing {users.length} of {totalUsers} users
        </p>
        {users.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={selectedUsers.length === users.length ? clearSelection : selectAllUsers}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg border border-secondary-200 bg-white p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-secondary-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-secondary-200 rounded w-16"></div>
                <div className="h-6 bg-secondary-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <UserPlusIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No users found</h3>
          <p className="mt-1 text-sm text-secondary-500">Get started by adding a new user.</p>
          <button
            onClick={onCreateUser}
            className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Add user
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUsers.includes(user.id)}
              onSelect={() => toggleUserSelection(user.id)}
              onEdit={() => onEditUser(user)}
              onView={() => onViewUser(user)}
              onDelete={() => handleDeleteUser(user)}
              onToggleStatus={() => handleToggleUserStatus(user)}
              getRoleColor={getRoleColor}
              getRoleIcon={getRoleIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  getRoleColor: (role: UserRole) => string;
  getRoleIcon: (role: UserRole) => React.ComponentType<{ className?: string }>;
}

function UserCard({
  user,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  getRoleColor,
  getRoleIcon,
}: UserCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const RoleIcon = getRoleIcon(user.role);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-secondary-200'
      )}
    >
      <div className="flex items-center space-x-4">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
        />

        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-200">
              <span className="text-sm font-medium text-secondary-600">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user.fullName}
            </p>
            {!user.isActive && (
              <span className="inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-secondary-500 truncate">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getRoleColor(user.role))}>
              <RoleIcon className="mr-1 h-3 w-3" />
              {user.role}
            </span>
            {user.lastLoginAt && (
              <span className="text-xs text-secondary-500">
                Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          {user.isActive ? (
            <CheckCircleIcon className="h-5 w-5 text-success-500" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-error-500" />
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 z-10 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <div className="py-1">
                  <button
                    onClick={() => { onView(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <EyeIcon className="mr-3 h-4 w-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <PencilIcon className="mr-3 h-4 w-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => { onToggleStatus(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    {user.isActive ? (
                      <>
                        <XCircleIcon className="mr-3 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="mr-3 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                  >
                    <TrashIcon className="mr-3 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
