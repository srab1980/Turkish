export default function CoursesPage() {
  const courses = [
    {
      id: '1',
      title: 'Turkish A1 Complete Course - Istanbul Book',
      level: 'A1',
      description: 'Complete beginner Turkish course with 12 units and 36 lessons',
      estimatedHours: 180,
      isPublished: true,
      totalStudents: 1234,
      totalUnits: 12
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Create and manage course structure and content</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Create New Course
        </button>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Courses</h3>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{course.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                    <div className="flex gap-6 mt-3 text-sm text-gray-500">
                      <span>📊 Level: {course.level}</span>
                      <span>⏱️ {course.estimatedHours} hours</span>
                      <span>📚 {course.totalUnits} units</span>
                      <span>👥 {course.totalStudents} students</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                      View Units
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Courses</h3>
          <p className="text-3xl font-bold text-blue-600">1</p>
          <p className="text-sm text-gray-600 mt-1">Active courses</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-green-600">1,234</p>
          <p className="text-sm text-gray-600 mt-1">Enrolled students</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">68%</p>
          <p className="text-sm text-gray-600 mt-1">Average completion</p>
        </div>
      </div>

      {/* Data Flow Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📊 Course Data Flow</h3>
        <p className="text-blue-800 text-sm">
          Course changes are automatically synced to the student interface. Students will see updated course information immediately.
        </p>
      </div>
    </div>
  );
}
