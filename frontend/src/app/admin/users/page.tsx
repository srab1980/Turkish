export default function UsersPage() {
  const users = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      role: 'Student',
      level: 'A1',
      progress: 45,
      lastActive: '2 hours ago',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Student',
      level: 'A1',
      progress: 78,
      lastActive: '1 day ago',
      joinDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin',
      level: '-',
      progress: 0,
      lastActive: 'Now',
      joinDate: '2024-01-01'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage student accounts and progress</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add New User
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Active Students</h3>
          <p className="text-2xl font-bold text-green-600">890</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">New This Week</h3>
          <p className="text-2xl font-bold text-blue-600">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Avg Progress</h3>
          <p className="text-2xl font-bold text-purple-600">68%</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Active</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{user.level}</td>
                    <td className="py-3 px-4">
                      {user.progress > 0 ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{user.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.lastActive}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          View
                        </button>
                        <button className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
