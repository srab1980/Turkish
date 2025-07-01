'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Search, Filter, Edit, Trash2, Mail, Phone, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  progress?: number;
}

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      progress: 75
    },
    {
      id: '2',
      name: 'Fatma Demir',
      email: 'fatma@example.com',
      role: 'teacher',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-19'
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-18',
      progress: 45
    },
    {
      id: '4',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-01',
      lastLogin: '2024-01-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined: {user.joinDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last Login: {user.lastLogin}</span>
              </div>
              {user.progress && (
                <div className="flex items-center gap-2">
                  <span>Progress: {user.progress}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${user.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage students, teachers, and administrators</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Tabs defaultValue="all-users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="mt-6">
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No users found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="students">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {users.filter(u => u.role === 'student').map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {users.filter(u => u.role === 'teacher').map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {users.filter(u => u.role === 'admin').map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
