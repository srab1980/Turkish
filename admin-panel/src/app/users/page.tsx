'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import UserList from '@/components/users/UserList';
import UserForm from '@/components/users/UserForm';
import UserProfile from '@/components/users/UserProfile';
import { User } from '@/types';

export default function UsersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [viewingUser, setViewingUser] = useState<User | undefined>();

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setShowCreateForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowCreateForm(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  const handleFormSuccess = (user: User) => {
    setShowCreateForm(false);
    setEditingUser(undefined);
    // The UserList component will automatically refresh due to React Query
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingUser(undefined);
  };

  const handleProfileClose = () => {
    setViewingUser(undefined);
  };

  const handleProfileEdit = () => {
    if (viewingUser) {
      setViewingUser(undefined);
      handleEditUser(viewingUser);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <UserList
          onCreateUser={handleCreateUser}
          onEditUser={handleEditUser}
          onViewUser={handleViewUser}
        />
      </div>

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={showCreateForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* User Profile Modal */}
      {viewingUser && (
        <UserProfile
          user={viewingUser}
          isOpen={!!viewingUser}
          onClose={handleProfileClose}
          onEdit={handleProfileEdit}
        />
      )}
    </Layout>
  );
}
