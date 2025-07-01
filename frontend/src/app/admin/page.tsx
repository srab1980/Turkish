export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your Turkish learning platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="text-2xl mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📚</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📝</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">36</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="text-2xl mr-4">🎯</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exercises</p>
              <p className="text-2xl font-bold text-gray-900">75</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/content/curriculum"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📖</div>
            <h3 className="font-medium text-gray-900">Manage Curriculum</h3>
            <p className="text-sm text-gray-600">View and edit the complete Turkish A1 curriculum</p>
          </a>
          
          <a
            href="/admin/content/courses"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🎓</div>
            <h3 className="font-medium text-gray-900">Manage Courses</h3>
            <p className="text-sm text-gray-600">Create and edit course content</p>
          </a>
          
          <a
            href="/admin/content/lessons"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-medium text-gray-900">Manage Lessons</h3>
            <p className="text-sm text-gray-600">Create and edit individual lessons</p>
          </a>
          
          <a
            href="/admin/content/exercises"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-medium text-gray-900">Manage Exercises</h3>
            <p className="text-sm text-gray-600">Create interactive exercises</p>
          </a>
          
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </a>
          
          <a
            href="/admin/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600">Track platform performance</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="text-green-500">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Turkish A1 Curriculum loaded</p>
              <p className="text-xs text-gray-500">12 units, 36 lessons, 75 exercises</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-blue-500">🔄</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Content synced to frontend</p>
              <p className="text-xs text-gray-500">All content available to students</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-purple-500">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Platform ready for students</p>
              <p className="text-xs text-gray-500">Both admin and student interfaces active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
