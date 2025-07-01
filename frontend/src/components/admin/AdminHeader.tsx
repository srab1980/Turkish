export default function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Turkish Learning Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Student Interface
            </a>
            <div className="text-sm text-gray-500">Admin Panel</div>
          </div>
        </div>
      </div>
    </header>
  );
}
