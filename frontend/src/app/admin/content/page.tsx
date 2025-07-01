export default function ContentManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-1">Manage all aspects of the Turkish learning curriculum</p>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/admin/content/curriculum"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Curriculum</h3>
          <p className="text-gray-600 text-sm mb-4">
            Unified view of the complete Turkish A1 curriculum with 12 units and 36 lessons
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Curriculum →</div>
        </a>

        <a
          href="/admin/content/courses"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create and manage course structure, metadata, and organization
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Courses →</div>
        </a>

        <a
          href="/admin/content/lessons"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lessons</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create and edit individual lessons with unified sub-lesson structure
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Lessons →</div>
        </a>

        <a
          href="/admin/content/exercises"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exercises</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create interactive exercises and activities for student engagement
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Exercises →</div>
        </a>

        <a
          href="/admin/content/vocabulary"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vocabulary</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage vocabulary lists, definitions, and pronunciation guides
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Vocabulary →</div>
        </a>

        <a
          href="/admin/content/grammar"
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Grammar</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create and manage grammar rules, examples, and explanations
          </p>
          <div className="text-blue-600 text-sm font-medium">Manage Grammar →</div>
        </a>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">36</div>
            <div className="text-sm text-gray-600">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">75</div>
            <div className="text-sm text-gray-600">Exercises</div>
          </div>
        </div>
      </div>

      {/* Data Flow Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📊 Content Management Data Flow</h3>
        <p className="text-blue-800 text-sm">
          Changes made in any content section will be reflected in the student interface. 
          Use the curriculum page to sync all content to the frontend.
        </p>
      </div>
    </div>
  );
}
