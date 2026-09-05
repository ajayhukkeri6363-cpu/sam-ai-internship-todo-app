/**
 * SAM AI Technologies — Web Development Internship
 * Task 2: Smart Task & To-Do Management Web App
 * Author: Ajay Hukkeri
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Storage & State Management
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'sam_ai_tasks_data';
  const THEME_KEY = 'sam_todo_theme';

  // Default initial sample tasks for first-time visitors
  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Design responsive portfolio website layout (Task 3)',
      priority: 'high',
      completed: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task-2',
      title: 'Build interactive To-Do App with LocalStorage (Task 2)',
      priority: 'high',
      completed: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Develop JavaScript Web Music Player (Task 4)',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];

  let tasks = loadTasks();
  let currentFilter = 'all';
  let searchQuery = '';

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading tasks from LocalStorage:', e);
    }
    return DEFAULT_TASKS;
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to LocalStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 2. DOM Elements
  // --------------------------------------------------------------------------
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const prioritySelect = document.getElementById('priority-select');
  const inputError = document.getElementById('input-error');

  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  const filterTabs = document.querySelectorAll('.filter-tab');
  const countAll = document.getElementById('count-all');
  const countActive = document.getElementById('count-active');
  const countCompleted = document.getElementById('count-completed');

  const statsCounter = document.getElementById('stats-counter');
  const statsPercentage = document.getElementById('stats-percentage');
  const progressFill = document.getElementById('progress-fill');

  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  const toast = document.getElementById('toast');

  // --------------------------------------------------------------------------
  // 3. Theme Management
  // --------------------------------------------------------------------------
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    });
  }

  // --------------------------------------------------------------------------
  // 4. Toast Notification
  // --------------------------------------------------------------------------
  let toastTimer;
  function showToast(message, type = 'success') {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.className = 'toast';

    if (type === 'error') {
      toast.classList.add('error');
    } else if (type === 'info') {
      toast.classList.add('info');
    }

    toast.textContent = message;
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // --------------------------------------------------------------------------
  // 5. Render Functions
  // --------------------------------------------------------------------------
  function render() {
    // 1. Calculate Statistics
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = totalCount - completedCount;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Update Counts & Badges
    countAll.textContent = totalCount;
    countActive.textContent = activeCount;
    countCompleted.textContent = completedCount;

    statsCounter.textContent = `${completedCount} of ${totalCount} completed`;
    statsPercentage.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;

    // 2. Filter & Search Tasks
    let filtered = tasks.filter(task => {
      // Filter by status
      if (currentFilter === 'active' && task.completed) return false;
      if (currentFilter === 'completed' && !task.completed) return false;

      // Filter by search query
      if (searchQuery.trim() !== '') {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    // 3. Render List / Empty State
    taskList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';

      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const dateStr = new Date(task.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });

        li.innerHTML = `
          <button class="task-checkbox" aria-label="Toggle task completion" title="${task.completed ? 'Mark Active' : 'Mark Completed'}">
            <i class="fa-solid fa-check"></i>
          </button>
          <div class="task-details">
            <span class="task-text">${escapeHtml(task.title)}</span>
            <div class="task-meta">
              <span class="priority-tag priority-${task.priority}">${task.priority}</span>
              <span class="task-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="action-btn edit" aria-label="Edit task" title="Edit Task">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete" aria-label="Delete task" title="Delete Task">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `;

        taskList.appendChild(li);
      });
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --------------------------------------------------------------------------
  // 6. Form Submission (Add Task)
  // --------------------------------------------------------------------------
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    inputError.textContent = '';

    const text = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!text) {
      inputError.textContent = 'Please enter a task description.';
      taskInput.focus();
      return;
    }

    if (text.length < 3) {
      inputError.textContent = 'Task description must be at least 3 characters.';
      taskInput.focus();
      return;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: text,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    render();

    taskInput.value = '';
    taskInput.focus();
    showToast('Task added successfully!');
  });

  // Clear error on typing
  taskInput.addEventListener('input', () => {
    if (inputError.textContent) inputError.textContent = '';
  });

  // --------------------------------------------------------------------------
  // 7. Event Delegation for Task Actions (Toggle, Delete, Edit)
  // --------------------------------------------------------------------------
  taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Toggle Completion
    if (e.target.closest('.task-checkbox')) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      saveTasks();
      render();
      showToast(tasks[taskIndex].completed ? 'Task marked as completed!' : 'Task marked active.');
      return;
    }

    // Delete Task
    if (e.target.closest('.action-btn.delete')) {
      tasks.splice(taskIndex, 1);
      saveTasks();
      render();
      showToast('Task removed.', 'info');
      return;
    }

    // Edit Task
    if (e.target.closest('.action-btn.edit')) {
      startEditing(taskItem, tasks[taskIndex]);
      return;
    }
  });

  function startEditing(taskItem, task) {
    const textSpan = taskItem.querySelector('.task-text');
    const originalText = task.title;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = originalText;

    textSpan.replaceWith(input);
    input.focus();
    input.select();

    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== originalText) {
        task.title = newText;
        saveTasks();
        showToast('Task updated successfully.');
      }
      render();
    };

    const cancelEdit = () => {
      render();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });

    input.addEventListener('blur', () => {
      saveEdit();
    });
  }

  // --------------------------------------------------------------------------
  // 8. Filters & Search Controls
  // --------------------------------------------------------------------------
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      currentFilter = tab.dataset.filter;
      render();
    });
  });

  // Search Input Handler
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    render();
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.', 'info');
      return;
    }

    if (confirm(`Are you sure you want to remove ${completedCount} completed task(s)?`)) {
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      render();
      showToast(`Cleared ${completedCount} completed task(s).`);
    }
  });

  // Initial render
  render();
});
