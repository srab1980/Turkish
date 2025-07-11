// Global data storage
let curriculumData = {
    courses: [],
    units: [],
    lessons: [],
    exercises: []
};

// Initialize the admin interface
document.addEventListener('DOMContentLoaded', function() {
    loadCurriculumData();
});

// Load curriculum data from the frontend API
async function loadCurriculumData() {
    showStatus('Loading curriculum data...', 'info');
    
    try {
        const response = await fetch('http://localhost:3000/api/test-curriculum');
        if (!response.ok) {
            throw new Error('Failed to fetch curriculum data');
        }
        
        const data = await response.json();
        
        // Process the data
        curriculumData.courses = data.courses || [];
        curriculumData.units = data.units || [];
        curriculumData.lessons = data.lessons || [];
        curriculumData.exercises = data.exercises || [];
        
        // Update UI
        updateCounts();
        renderCourses();
        renderUnits();
        renderLessons();
        renderExercises();
        updateAnalytics();
        
        showStatus(`✅ Loaded ${curriculumData.lessons.length} lessons and ${curriculumData.exercises.length} exercises`, 'success');
        
    } catch (error) {
        console.error('Error loading curriculum data:', error);
        showStatus('❌ Failed to load curriculum data. Make sure the main app is running at http://localhost:3000', 'error');
    }
}

// Show status messages
function showStatus(message, type = 'info') {
    const container = document.getElementById('status-messages');
    const colors = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };
    
    container.innerHTML = `
        <div class="border rounded-lg p-4 ${colors[type]}">
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Update counts in tabs
function updateCounts() {
    document.getElementById('courses-count').textContent = curriculumData.courses.length;
    document.getElementById('units-count').textContent = curriculumData.units.length;
    document.getElementById('lessons-count').textContent = curriculumData.lessons.length;
    document.getElementById('exercises-count').textContent = curriculumData.exercises.length;
}

// Tab management
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Activate selected tab button
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    activeButton.classList.remove('border-transparent', 'text-gray-500');
    activeButton.classList.add('border-blue-500', 'text-blue-600');
}

// Render courses
function renderCourses() {
    const container = document.getElementById('courses-grid');
    
    if (curriculumData.courses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 col-span-2">
                <div class="text-gray-400 mb-4">📚</div>
                <p class="text-gray-600">No courses available. Click "Refresh Data" to load courses.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculumData.courses.map(course => `
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold">${course.title}</h3>
                    <p class="text-gray-600 text-sm">${course.description || 'No description'}</p>
                </div>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${course.level || 'A1'}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span class="font-medium">Units:</span> ${course.totalUnits || 0}</div>
                <div><span class="font-medium">Hours:</span> ${course.estimatedHours || 0}</div>
                <div><span class="font-medium">Lessons:</span> ${curriculumData.lessons.length}</div>
                <div><span class="font-medium">Exercises:</span> ${curriculumData.exercises.length}</div>
            </div>
            <div class="flex gap-2">
                <button onclick="previewItem('${course.id}', 'course')" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    👁️ Preview
                </button>
                <button onclick="editItem('${course.id}', 'course')" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    ✏️ Edit
                </button>
                <button onclick="deleteItem('${course.id}', 'course')" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Render units
function renderUnits() {
    const container = document.getElementById('units-grid');
    
    if (curriculumData.units.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 col-span-2">
                <p class="text-gray-600">No units available.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculumData.units.map(unit => {
        const unitLessons = curriculumData.lessons.filter(l => l.unitId === unit.id);
        const unitExercises = curriculumData.exercises.filter(e => {
            const lesson = curriculumData.lessons.find(l => l.id === e.lessonId);
            return lesson && lesson.unitId === unit.id;
        });
        
        return `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold">Unit ${unit.unitNumber}: ${unit.title}</h4>
                        <p class="text-gray-600 text-sm">${unit.description || 'No description'}</p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div><span class="font-medium">Lessons:</span> ${unitLessons.length}</div>
                    <div><span class="font-medium">Exercises:</span> ${unitExercises.length}</div>
                    <div><span class="font-medium">Hours:</span> ${unit.estimatedHours || 0}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="previewItem('${unit.id}', 'unit')" class="px-2 py-1 bg-blue-600 text-white text-xs rounded">👁️ Preview</button>
                    <button onclick="editItem('${unit.id}', 'unit')" class="px-2 py-1 bg-green-600 text-white text-xs rounded">✏️ Edit</button>
                    <button onclick="deleteItem('${unit.id}', 'unit')" class="px-2 py-1 bg-red-600 text-white text-xs rounded">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Render lessons
function renderLessons() {
    const container = document.getElementById('lessons-grid');
    
    if (curriculumData.lessons.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-600">No lessons available.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculumData.lessons.map(lesson => {
        const lessonExercises = curriculumData.exercises.filter(e => e.lessonId === lesson.id);
        const unit = curriculumData.units.find(u => u.id === lesson.unitId);
        
        return `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-sm transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-medium mb-1">${lesson.title}</h4>
                        <p class="text-gray-600 text-sm mb-2">${lesson.description || 'No description'}</p>
                        <div class="flex gap-4 text-sm text-gray-500">
                            <span>📚 Unit: ${unit?.title || 'Unknown'}</span>
                            <span>⏱️ ${lesson.estimatedMinutes || 0}min</span>
                            <span>📊 ${lesson.difficultyLevel || 1}</span>
                            <span>🎮 ${lessonExercises.length} exercises</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 mt-3">
                    <button onclick="previewItem('${lesson.id}', 'lesson')" class="px-2 py-1 bg-blue-600 text-white text-xs rounded">👁️ Preview</button>
                    <button onclick="editItem('${lesson.id}', 'lesson')" class="px-2 py-1 bg-green-600 text-white text-xs rounded">✏️ Edit</button>
                    <button onclick="deleteItem('${lesson.id}', 'lesson')" class="px-2 py-1 bg-red-600 text-white text-xs rounded">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Render exercises
function renderExercises() {
    const container = document.getElementById('exercises-grid');
    
    if (curriculumData.exercises.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-600">No exercises available.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculumData.exercises.map(exercise => {
        const lesson = curriculumData.lessons.find(l => l.id === exercise.lessonId);
        const unit = curriculumData.units.find(u => u.id === lesson?.unitId);
        
        return `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="font-semibold">${exercise.title || 'Untitled Exercise'}</h3>
                            <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                ${exercise.type?.replace('_', ' ').toUpperCase() || 'EXERCISE'}
                            </span>
                        </div>
                        <p class="text-gray-600 text-sm mb-2">${exercise.description || 'No description'}</p>
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                            <span>⏱️ ${exercise.estimatedMinutes || 0} min</span>
                            <span>📊 Level ${exercise.difficultyLevel || 1}</span>
                            <span>📝 Lesson: ${lesson?.title || 'Unknown'}</span>
                            <span>📚 Unit: ${unit?.title || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="previewItem('${exercise.id}', 'exercise')" class="px-2 py-1 bg-blue-600 text-white text-xs rounded">👁️ Preview</button>
                        <button onclick="editItem('${exercise.id}', 'exercise')" class="px-2 py-1 bg-green-600 text-white text-xs rounded">✏️ Edit</button>
                        <button onclick="deleteItem('${exercise.id}', 'exercise')" class="px-2 py-1 bg-red-600 text-white text-xs rounded">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update analytics
function updateAnalytics() {
    document.getElementById('total-courses').textContent = curriculumData.courses.length;
    document.getElementById('total-units').textContent = curriculumData.units.length;
    document.getElementById('total-lessons').textContent = curriculumData.lessons.length;
    document.getElementById('total-exercises').textContent = curriculumData.exercises.length;
}

// Preview item
function previewItem(id, type) {
    let item;
    switch(type) {
        case 'course':
            item = curriculumData.courses.find(c => c.id === id);
            break;
        case 'unit':
            item = curriculumData.units.find(u => u.id === id);
            break;
        case 'lesson':
            item = curriculumData.lessons.find(l => l.id === id);
            break;
        case 'exercise':
            item = curriculumData.exercises.find(e => e.id === id);
            break;
    }

    if (!item) return;

    document.getElementById('preview-title').textContent = `Preview ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('preview-content').innerHTML = `
        <div class="space-y-4">
            <div><strong>Title:</strong> ${item.title}</div>
            <div><strong>Description:</strong> ${item.description || 'No description'}</div>
            ${type === 'lesson' ? `<div><strong>Estimated Minutes:</strong> ${item.estimatedMinutes || 0}</div>` : ''}
            ${type === 'exercise' ? `<div><strong>Type:</strong> ${item.type || 'Unknown'}</div>` : ''}
            ${type === 'unit' ? `<div><strong>Unit Number:</strong> ${item.unitNumber || 0}</div>` : ''}
            <div><strong>Status:</strong> ${item.isPublished ? 'Published' : 'Draft'}</div>
        </div>
    `;

    showModal('preview-modal');
}

// Edit item
function editItem(id, type) {
    let item;
    switch(type) {
        case 'course':
            item = curriculumData.courses.find(c => c.id === id);
            break;
        case 'unit':
            item = curriculumData.units.find(u => u.id === id);
            break;
        case 'lesson':
            item = curriculumData.lessons.find(l => l.id === id);
            break;
        case 'exercise':
            item = curriculumData.exercises.find(e => e.id === id);
            break;
    }

    if (!item) return;

    document.getElementById('edit-title').textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById('edit-content').innerHTML = `
        <form onsubmit="saveItem(event, '${id}', '${type}')">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Title:</label>
                    <input type="text" id="edit-title-input" value="${item.title}" class="w-full border rounded px-3 py-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Description:</label>
                    <textarea id="edit-description-input" class="w-full border rounded px-3 py-2" rows="3">${item.description || ''}</textarea>
                </div>
                ${type === 'lesson' ? `
                    <div>
                        <label class="block text-sm font-medium mb-1">Estimated Minutes:</label>
                        <input type="number" id="edit-minutes-input" value="${item.estimatedMinutes || 0}" class="w-full border rounded px-3 py-2">
                    </div>
                ` : ''}
                <div class="flex gap-2 pt-4">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">💾 Save Changes</button>
                    <button type="button" onclick="closeModal('edit-modal')" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                </div>
            </div>
        </form>
    `;

    showModal('edit-modal');
}

// Delete item
function deleteItem(id, type) {
    let item;
    switch(type) {
        case 'course':
            item = curriculumData.courses.find(c => c.id === id);
            break;
        case 'unit':
            item = curriculumData.units.find(u => u.id === id);
            break;
        case 'lesson':
            item = curriculumData.lessons.find(l => l.id === id);
            break;
        case 'exercise':
            item = curriculumData.exercises.find(e => e.id === id);
            break;
    }

    if (!item) return;

    document.getElementById('delete-content').innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <div class="text-red-500 text-2xl">⚠️</div>
                <div>
                    <p class="font-medium">Are you sure you want to delete this ${type}?</p>
                    <p class="text-sm text-gray-600">"${item.title}"</p>
                </div>
            </div>
            <p class="text-sm text-gray-600">
                This action cannot be undone.
                ${type === 'unit' ? 'All lessons and exercises in this unit will also be deleted.' : ''}
                ${type === 'lesson' ? 'All exercises in this lesson will also be deleted.' : ''}
            </p>
            <div class="flex gap-2 pt-4">
                <button onclick="confirmDelete('${id}', '${type}')" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">🗑️ Delete ${type}</button>
                <button onclick="closeModal('delete-modal')" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
        </div>
    `;

    showModal('delete-modal');
}

// Save item
function saveItem(event, id, type) {
    event.preventDefault();

    const title = document.getElementById('edit-title-input').value;
    const description = document.getElementById('edit-description-input').value;
    const minutes = document.getElementById('edit-minutes-input')?.value;

    // In a real implementation, this would make an API call
    showStatus(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} "${title}" updated successfully!`, 'success');
    closeModal('edit-modal');
}

// Confirm delete
function confirmDelete(id, type) {
    // In a real implementation, this would make an API call
    showStatus(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
    closeModal('delete-modal');
}

// Modal management
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Refresh data
function refreshData() {
    loadCurriculumData();
}

// Filter functions (simplified for demo)
function filterUnits() {
    renderUnits();
}

function filterLessons() {
    renderLessons();
}

function filterExercises() {
    renderExercises();
}
