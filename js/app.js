/**
 * TaskFlow — Smart Task Manager (SaaS Edition)
 * Master Controller, Multi-View Kanban/Calendar, Pomodoro & Analytics Engine
 * Author: Ajay Hukkeri | SAM AI Technologies Web Development Internship
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Storage Keys & Central State Store
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'sam_ai_tasks_data';
  const POMO_STORAGE_KEY = 'sam_ai_pomo_data';
  const THEME_KEY = 'sam_todo_theme';

  // Rich sample initial tasks for first-time onboarding
  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Design responsive portfolio website layout (Task 3)',
      description: 'Create dark cinematic developer portfolio with project showcases and verified contact form.',
      completed: true,
      status: 'completed',
      priority: 'high',
      category: 'Coding',
      tags: ['portfolio', 'frontend', 'responsive'],
      dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      dueTime: '18:00',
      recurrence: 'none',
      subtasks: [
        { id: 'sub-1', text: 'Structure semantic HTML sections', completed: true },
        { id: 'sub-2', text: 'Implement cinematic dark theme styles', completed: true },
        { id: 'sub-3', text: 'Test responsiveness on mobile devices', completed: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task-2',
      title: 'Build interactive To-Do App with LocalStorage (Task 2)',
      description: 'Implement full CRUD operations, multi-view Kanban board, and calendar scheduling.',
      completed: false,
      status: 'in_progress',
      priority: 'critical',
      category: 'Projects',
      tags: ['internship', 'javascript', 'productivity'],
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '17:00',
      recurrence: 'none',
      subtasks: [
        { id: 'sub-4', text: 'Setup core task state store', completed: true },
        { id: 'sub-5', text: 'Build drag-and-drop Kanban view', completed: true },
        { id: 'sub-6', text: 'Add Pomodoro focus timer', completed: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    },
    {
      id: 'task-3',
      title: 'Develop JavaScript Web Music Player (Task 4)',
      description: 'Audio streaming player with 56 authentic tracks and real-time spectrum visualizer.',
      completed: true,
      status: 'completed',
      priority: 'high',
      category: 'Coding',
      tags: ['webaudio', 'music', 'visualizer'],
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      dueTime: '20:00',
      recurrence: 'none',
      subtasks: [
        { id: 'sub-7', text: 'Acquire 56 unique song previews', completed: true },
        { id: 'sub-8', text: 'Connect Web Audio API Analyser', completed: true }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'task-4',
      title: 'Practice LeetCode / DSA problem solving',
      description: 'Solve 2 medium tree traversal and dynamic programming questions.',
      completed: false,
      status: 'todo',
      priority: 'medium',
      category: 'Study',
      tags: ['dsa', 'algorithms', 'college'],
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dueTime: '10:00',
      recurrence: 'daily',
      subtasks: [
        { id: 'sub-9', text: 'Solve Binary Tree Maximum Path Sum', completed: false },
        { id: 'sub-10', text: 'Review Space Complexity notes', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    }
  ];

  // Global State
  let tasks = loadTasks();
  let pomoStats = loadPomoStats();
  let currentView = 'view-list';
  let currentFilter = 'all'; // all | today | upcoming | in_progress | completed | overdue
  let categoryFilter = 'all';
  let priorityFilter = 'all';
  let currentSort = 'created_desc';
  let searchQuery = '';
  
  // Calendar Navigation State
  let calCurrentDate = new Date();
  
  // Editing State
  let editingTaskId = null;
  let modalSubtasks = [];

  // Drag and Drop State
  let draggedTaskId = null;

  // --------------------------------------------------------------------------
  // 2. Backward-Compatible LocalStorage Migration Engine
  // --------------------------------------------------------------------------
  function normalizeTask(raw) {
    if (!raw) return null;
    const isCompleted = Boolean(raw.completed || raw.status === 'completed');
    
    return {
      id: raw.id ? String(raw.id) : 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: raw.title ? String(raw.title) : 'Untitled Task',
      description: raw.description ? String(raw.description) : '',
      completed: isCompleted,
      status: ['todo', 'in_progress', 'completed'].includes(raw.status)
        ? raw.status
        : (isCompleted ? 'completed' : 'todo'),
      priority: ['critical', 'high', 'medium', 'low'].includes(raw.priority)
        ? raw.priority
        : 'medium',
      category: raw.category || 'Coding',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      dueDate: raw.dueDate || null,
      dueTime: raw.dueTime || null,
      recurrence: ['none', 'daily', 'weekdays', 'weekly', 'monthly'].includes(raw.recurrence)
        ? raw.recurrence
        : 'none',
      subtasks: Array.isArray(raw.subtasks)
        ? raw.subtasks.map(s => ({
            id: s.id || 'sub-' + Math.random().toString(36).substr(2, 6),
            text: s.text || '',
            completed: Boolean(s.completed)
          }))
        : [],
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      completedAt: raw.completedAt || (isCompleted ? (raw.createdAt || new Date().toISOString()) : null)
    };
  }

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeTask).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Error loading tasks from LocalStorage, falling back to defaults:', e);
    }
    return DEFAULT_TASKS.map(normalizeTask);
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to LocalStorage:', e);
    }
  }

  function loadPomoStats() {
    try {
      const stored = localStorage.getItem(POMO_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error loading Pomodoro stats:', e);
    }
    return { completedSessions: 0, totalFocusMinutes: 0 };
  }

  function savePomoStats() {
    try {
      localStorage.setItem(POMO_STORAGE_KEY, JSON.stringify(pomoStats));
    } catch (e) {
      console.error('Error saving Pomodoro stats:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 3. DOM Elements Cache
  // --------------------------------------------------------------------------
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const toast = document.getElementById('toast');
  const viewNavBtns = document.querySelectorAll('.view-nav-btn');
  const contentViews = document.querySelectorAll('.content-view');

  // Dashboard Metrics
  const metricTodayCount = document.getElementById('metric-today-count');
  const metricTodaySub = document.getElementById('metric-today-sub');
  const metricProgressCount = document.getElementById('metric-progress-count');
  const metricActiveSub = document.getElementById('metric-active-sub');
  const metricOverdueCount = document.getElementById('metric-overdue-count');
  const metricStreakCount = document.getElementById('metric-streak-count');

  // Quick Add Form
  const quickAddForm = document.getElementById('quick-add-form');
  const quickAddInput = document.getElementById('quick-add-input');
  const quickAddCategory = document.getElementById('quick-add-category');
  const quickAddPriority = document.getElementById('quick-add-priority');
  const quickAddError = document.getElementById('quick-add-error');
  const parsedPreviewContainer = document.getElementById('parsed-preview-container');

  // Toolbar
  const statusTabs = document.querySelectorAll('.status-tab');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const filterCategory = document.getElementById('filter-category');
  const filterPriority = document.getElementById('filter-priority');
  const sortSelect = document.getElementById('sort-select');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // List View Elements
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptyDesc = document.getElementById('empty-desc');
  const btnEmptyAdd = document.getElementById('btn-empty-add');
  const statsPercentage = document.getElementById('stats-percentage');
  const progressFill = document.getElementById('progress-fill');
  const statsCounter = document.getElementById('stats-counter');
  const statsActiveCounter = document.getElementById('stats-active-counter');

  // Badges in Tabs
  const countAll = document.getElementById('count-all');
  const countToday = document.getElementById('count-today');
  const countUpcoming = document.getElementById('count-upcoming');
  const countInProgress = document.getElementById('count-in-progress');
  const countCompleted = document.getElementById('count-completed');
  const countOverdue = document.getElementById('count-overdue');

  // Kanban View Elements
  const kanbanDropzoneTodo = document.getElementById('kanban-dropzone-todo');
  const kanbanDropzoneProgress = document.getElementById('kanban-dropzone-in-progress');
  const kanbanDropzoneCompleted = document.getElementById('kanban-dropzone-completed');
  const kanbanCountTodo = document.getElementById('kanban-count-todo');
  const kanbanCountProgress = document.getElementById('kanban-count-in-progress');
  const kanbanCountCompleted = document.getElementById('kanban-count-completed');

  // Calendar Elements
  const calendarMonthYear = document.getElementById('calendar-month-year');
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const calendarTotalTasks = document.getElementById('calendar-total-tasks');
  const btnCalPrev = document.getElementById('btn-cal-prev');
  const btnCalNext = document.getElementById('btn-cal-next');
  const btnCalToday = document.getElementById('btn-cal-today');

  // Pomodoro Elements
  const pomoTimeDisplay = document.getElementById('pomo-time-display');
  const pomoStateLabel = document.getElementById('pomo-state-label');
  const pomoRingFill = document.getElementById('pomo-ring-fill');
  const pomoTaskSelect = document.getElementById('pomo-task-select');
  const btnPomoToggle = document.getElementById('btn-pomo-toggle');
  const pomoToggleIcon = document.getElementById('pomo-toggle-icon');
  const pomoToggleText = document.getElementById('pomo-toggle-text');
  const btnPomoReset = document.getElementById('btn-pomo-reset');
  const btnPomoSkip = document.getElementById('btn-pomo-skip');
  const pomoCompletedSessions = document.getElementById('pomo-completed-sessions');
  const pomoTotalFocusTime = document.getElementById('pomo-total-focus-time');
  const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');
  const pomodoroActiveDot = document.getElementById('pomodoro-active-dot');

  // Analytics Elements
  const anTotalTasks = document.getElementById('an-total-tasks');
  const anRate = document.getElementById('an-rate');
  const anRateDesc = document.getElementById('an-rate-desc');
  const anWeekCompleted = document.getElementById('an-week-completed');
  const anFocusSessions = document.getElementById('an-focus-sessions');
  const anFocusTime = document.getElementById('an-focus-time');
  const weeklyBarChart = document.getElementById('weekly-bar-chart');
  const categoryBreakdownList = document.getElementById('category-breakdown-list');
  const anCurrentStreak = document.getElementById('an-current-streak');
  const anLongestStreak = document.getElementById('an-longest-streak');
  const anStreakDesc = document.getElementById('an-streak-desc');

  // Task Modal Elements
  const taskModal = document.getElementById('task-modal');
  const btnOpenCreateModal = document.getElementById('btn-open-create-modal');
  const btnCloseTaskModal = document.getElementById('btn-close-task-modal');
  const btnCancelTaskModal = document.getElementById('btn-cancel-task-modal');
  const taskModalForm = document.getElementById('task-modal-form');
  const taskModalTitle = document.getElementById('task-modal-title');
  const taskModalIconBadge = document.getElementById('task-modal-icon-badge');
  const modalTaskTitle = document.getElementById('modal-task-title');
  const modalTitleError = document.getElementById('modal-title-error');
  const modalTaskDesc = document.getElementById('modal-task-desc');
  const modalTaskPriority = document.getElementById('modal-task-priority');
  const modalTaskCategory = document.getElementById('modal-task-category');
  const modalTaskStatus = document.getElementById('modal-task-status');
  const modalTaskDueDate = document.getElementById('modal-task-due-date');
  const modalTaskDueTime = document.getElementById('modal-task-due-time');
  const modalTaskRecurrence = document.getElementById('modal-task-recurrence');
  const modalTaskTags = document.getElementById('modal-task-tags');
  const modalSubtaskProgress = document.getElementById('modal-subtask-progress');
  const modalSubtaskInput = document.getElementById('modal-subtask-input');
  const btnAddSubtask = document.getElementById('btn-add-subtask');
  const modalSubtasksList = document.getElementById('modal-subtasks-list');
  const btnModalDelete = document.getElementById('btn-modal-delete');
  const btnModalDuplicate = document.getElementById('btn-modal-duplicate');
  const btnModalFocus = document.getElementById('btn-modal-focus');

  // Backup Modal Elements
  const backupModal = document.getElementById('backup-modal');
  const btnBackupModal = document.getElementById('btn-backup-modal');
  const btnCloseBackupModal = document.getElementById('btn-close-backup-modal');
  const btnCloseBackupFooter = document.getElementById('btn-close-backup-footer');
  const btnExportJson = document.getElementById('btn-export-json');
  const importFileInput = document.getElementById('import-file-input');
  const btnTriggerFileImport = document.getElementById('btn-trigger-file-import');
  const importFilenamePreview = document.getElementById('import-filename-preview');
  const importConfirmBox = document.getElementById('import-confirm-box');
  const btnExecuteImport = document.getElementById('btn-execute-import');

  // Shortcuts Modal Elements
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const btnShortcutsModal = document.getElementById('btn-shortcuts-modal');
  const btnCloseShortcutsModal = document.getElementById('btn-close-shortcuts-modal');
  const btnCloseShortcutsFooter = document.getElementById('btn-close-shortcuts-footer');

  // Notification Button
  const btnNotificationToggle = document.getElementById('btn-notification-toggle');
  const notificationIcon = document.getElementById('notification-icon');

  // --------------------------------------------------------------------------
  // 4. Theme Management
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
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
  // 5. Toast Feedback Notifications
  // --------------------------------------------------------------------------
  let toastTimer;
  function showToast(message, type = 'success') {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.className = 'toast';
    if (type === 'error') toast.classList.add('error');
    if (type === 'info') toast.classList.add('info');

    let icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === 'info') icon = '<i class="fa-solid fa-circle-info"></i>';

    toast.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --------------------------------------------------------------------------
  // 6. View Routing & Navigation
  // --------------------------------------------------------------------------
  function switchView(targetViewId) {
    currentView = targetViewId;

    contentViews.forEach(v => {
      v.classList.toggle('active', v.id === targetViewId);
    });

    viewNavBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === targetViewId);
    });

    renderCurrentView();
  }

  viewNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      if (viewId) switchView(viewId);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Recurrence Engine
  // --------------------------------------------------------------------------
  function calculateNextDueDate(currentDueDateStr, recurrence) {
    const base = currentDueDateStr ? new Date(currentDueDateStr + 'T00:00:00') : new Date();
    const next = new Date(base.getTime());

    switch (recurrence) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekdays':
        do {
          next.setDate(next.getDate() + 1);
        } while (next.getDay() === 0 || next.getDay() === 6);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        return null;
    }

    return next.toISOString().split('T')[0];
  }

  // --------------------------------------------------------------------------
  // 8. Task CRUD Operations
  // --------------------------------------------------------------------------
  function createTask(data) {
    const newTask = normalizeTask({
      id: 'task-' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    tasks.unshift(newTask);
    saveTasks();
    renderAll();
    showToast(`Task "${newTask.title}" added!`);
    return newTask;
  }

  function updateTask(taskId, updates) {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    const oldTask = tasks[idx];
    const updated = normalizeTask({
      ...oldTask,
      ...updates,
      updatedAt: new Date().toISOString()
    });

    tasks[idx] = updated;
    saveTasks();
    renderAll();
    showToast('Task updated successfully.');
  }

  function deleteTask(taskId) {
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    const taskTitle = tasks[idx].title;
    tasks.splice(idx, 1);
    saveTasks();
    renderAll();
    showToast(`Deleted "${taskTitle}".`, 'info');
  }

  function duplicateTask(taskId) {
    const original = tasks.find(t => t.id === taskId);
    if (!original) return;

    const copy = normalizeTask({
      ...original,
      id: 'task-' + Date.now(),
      title: `${original.title} (Copy)`,
      completed: false,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    });

    tasks.unshift(copy);
    saveTasks();
    renderAll();
    showToast(`Duplicated as "${copy.title}"`);
  }

  function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      // Mark Completed
      task.completed = true;
      task.status = 'completed';
      task.completedAt = new Date().toISOString();

      // Check subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(st => st.completed = true);
      }

      // Handle Recurrence (Spawn next occurrence cleanly if recurring)
      if (task.recurrence && task.recurrence !== 'none') {
        const nextDate = calculateNextDueDate(task.dueDate, task.recurrence);
        if (nextDate) {
          const nextTask = normalizeTask({
            ...task,
            id: 'task-' + Date.now(),
            completed: false,
            status: 'todo',
            dueDate: nextDate,
            subtasks: task.subtasks.map(s => ({ ...s, completed: false })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null
          });
          tasks.unshift(nextTask);
          showToast(`Recurring next task scheduled for ${nextDate}!`);
        }
      }

      playChime();
      showToast(`Completed "${task.title}"! 🎉`);
    } else {
      // Mark Active / To Do
      task.completed = false;
      task.status = 'todo';
      task.completedAt = null;
      showToast(`Reopened "${task.title}".`, 'info');
    }

    saveTasks();
    renderAll();
  }

  function toggleSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (!sub) return;

    sub.completed = !sub.completed;

    // Check if all subtasks are completed
    const allDone = task.subtasks.every(s => s.completed);
    if (allDone && !task.completed) {
      task.completed = true;
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      playChime();
      showToast(`All subtasks done! "${task.title}" completed!`);
    } else if (!allDone && task.completed) {
      task.completed = false;
      task.status = 'in_progress';
      task.completedAt = null;
    }

    saveTasks();
    renderAll();
  }

  // --------------------------------------------------------------------------
  // 9. Smart Deterministic Natural Language Quick Add Parser
  // --------------------------------------------------------------------------
  function parseQuickAdd(text) {
    let cleanText = text.trim();
    let priority = 'medium';
    let category = 'Coding';
    let tags = [];
    let dueDate = null;
    let dueTime = null;

    // 1. Extract Tags (#tag)
    const tagMatches = cleanText.match(/#([a-zA-Z0-9_\-]+)/g);
    if (tagMatches) {
      tags = tagMatches.map(t => t.replace('#', '').toLowerCase());
      cleanText = cleanText.replace(/#([a-zA-Z0-9_\-]+)/g, '').trim();
    }

    // 2. Extract Category (in Coding | in Work | in Study | in Projects | in Personal | in Shopping)
    const catMatch = cleanText.match(/in\s+(Coding|Study|Work|Projects|Personal|Shopping|Other)/i);
    if (catMatch) {
      const foundCat = catMatch[1];
      const validCats = ['Coding', 'Study', 'Work', 'Projects', 'Personal', 'Shopping', 'Other'];
      const matched = validCats.find(c => c.toLowerCase() === foundCat.toLowerCase());
      if (matched) category = matched;
      cleanText = cleanText.replace(catMatch[0], '').trim();
    }

    // 3. Extract Priority (critical priority | high priority | medium priority | low priority)
    const prioMatch = cleanText.match(/(critical|high|medium|low)\s*(?:priority)?/i);
    if (prioMatch) {
      priority = prioMatch[1].toLowerCase();
      cleanText = cleanText.replace(prioMatch[0], '').trim();
    }

    // 4. Extract Date (today | tomorrow | monday..sunday | next week)
    const today = new Date();
    if (/today/i.test(cleanText)) {
      dueDate = today.toISOString().split('T')[0];
      cleanText = cleanText.replace(/today/i, '').trim();
    } else if (/tomorrow/i.test(cleanText)) {
      const tmr = new Date(today);
      tmr.setDate(tmr.getDate() + 1);
      dueDate = tmr.toISOString().split('T')[0];
      cleanText = cleanText.replace(/tomorrow/i, '').trim();
    } else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayMatch = cleanText.match(/(on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (dayMatch) {
        const targetDayName = dayMatch[2].toLowerCase();
        const targetDayIdx = days.indexOf(targetDayName);
        if (targetDayIdx !== -1) {
          const target = new Date(today);
          const currentDayIdx = target.getDay();
          let diff = targetDayIdx - currentDayIdx;
          if (diff <= 0) diff += 7;
          target.setDate(target.getDate() + diff);
          dueDate = target.toISOString().split('T')[0];
          cleanText = cleanText.replace(dayMatch[0], '').trim();
        }
      }
    }

    // 5. Extract Time (at 6 PM | 6:30pm | at 14:00 | 7am)
    const timeMatch = cleanText.match(/(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)|\d{1,2}:\d{2})/);
    if (timeMatch) {
      const rawTime = timeMatch[1].trim();
      dueTime = formatParsedTime(rawTime);
      cleanText = cleanText.replace(timeMatch[0], '').trim();
    }

    // Clean any leading/trailing commas or prepositions left over
    cleanText = cleanText.replace(/^[,\s\-]+|[,\s\-]+$/g, '');

    return {
      title: cleanText || text.trim(),
      priority,
      category,
      tags,
      dueDate,
      dueTime
    };
  }

  function formatParsedTime(str) {
    try {
      const isPm = /pm/i.test(str);
      const isAm = /am/i.test(str);
      const numOnly = str.replace(/[^\d:]/g, '');
      let [hours, mins] = numOnly.split(':');
      hours = parseInt(hours, 10);
      mins = mins ? parseInt(mins, 10) : 0;

      if (isPm && hours < 12) hours += 12;
      if (isAm && hours === 12) hours = 0;

      const hh = String(hours).padStart(2, '0');
      const mm = String(mins).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      return '18:00';
    }
  }

  // Live Quick Add Parsing Preview Feedback
  quickAddInput.addEventListener('input', () => {
    const val = quickAddInput.value.trim();
    if (quickAddError) quickAddError.textContent = '';

    if (val.length >= 4) {
      const parsed = parseQuickAdd(val);
      const chips = [];
      if (parsed.dueDate) chips.push(`<span class="parsed-chip"><i class="fa-regular fa-calendar"></i> ${parsed.dueDate}</span>`);
      if (parsed.dueTime) chips.push(`<span class="parsed-chip"><i class="fa-regular fa-clock"></i> ${parsed.dueTime}</span>`);
      if (parsed.priority && parsed.priority !== 'medium') chips.push(`<span class="parsed-chip"><i class="fa-solid fa-flag"></i> ${parsed.priority}</span>`);
      if (parsed.category && parsed.category !== 'Coding') chips.push(`<span class="parsed-chip"><i class="fa-solid fa-layer-group"></i> ${parsed.category}</span>`);
      if (parsed.tags.length > 0) chips.push(`<span class="parsed-chip">#${parsed.tags.join(' #')}</span>`);

      if (chips.length > 0) {
        parsedPreviewContainer.style.display = 'flex';
        parsedPreviewContainer.innerHTML = `<span style="font-size:0.72rem;color:var(--text-muted);">Detected:</span> ${chips.join('')}`;
      } else {
        parsedPreviewContainer.style.display = 'none';
      }
    } else {
      parsedPreviewContainer.style.display = 'none';
    }
  });

  quickAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = quickAddInput.value.trim();
    if (!val) {
      quickAddError.textContent = 'Please enter a task description.';
      quickAddInput.focus();
      return;
    }

    if (val.length < 3) {
      quickAddError.textContent = 'Task must be at least 3 characters.';
      quickAddInput.focus();
      return;
    }

    const parsed = parseQuickAdd(val);
    const category = parsed.category || quickAddCategory.value;
    const priority = parsed.priority || quickAddPriority.value;

    createTask({
      title: parsed.title,
      category: category,
      priority: priority,
      tags: parsed.tags,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      recurrence: 'none',
      subtasks: []
    });

    quickAddInput.value = '';
    parsedPreviewContainer.style.display = 'none';
    quickAddInput.focus();
  });

  // --------------------------------------------------------------------------
  // 10. Multi-Dimensional Filtering & Sorting Engine
  // --------------------------------------------------------------------------
  function getFilteredAndSortedTasks() {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
      // 1. Status Filter Tab
      if (currentFilter === 'today') {
        if (!task.dueDate || task.dueDate !== todayStr) return false;
      } else if (currentFilter === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr || task.completed) return false;
      } else if (currentFilter === 'in_progress') {
        if (task.status !== 'in_progress' || task.completed) return false;
      } else if (currentFilter === 'completed') {
        if (!task.completed) return false;
      } else if (currentFilter === 'overdue') {
        if (task.completed || !task.dueDate || task.dueDate >= todayStr) return false;
      }

      // 2. Category Dropdown Filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      // 3. Priority Dropdown Filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // 4. Global Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inTitle = task.title.toLowerCase().includes(query);
        const inDesc = task.description && task.description.toLowerCase().includes(query);
        const inCat = task.category && task.category.toLowerCase().includes(query);
        const inTags = task.tags && task.tags.some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inCat && !inTags) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorter Logic
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

      switch (currentSort) {
        case 'due_asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case 'due_desc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        case 'priority_desc':
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'priority_asc':
          return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'created_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. Dashboard Overview Metrics Calculation
  // --------------------------------------------------------------------------
  function updateDashboardMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Today Tasks
    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const todayDone = todayTasks.filter(t => t.completed).length;
    metricTodayCount.textContent = todayTasks.length;
    metricTodaySub.textContent = `${todayDone} completed`;

    // In Progress
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress' && !t.completed);
    const todoTasks = tasks.filter(t => t.status === 'todo' && !t.completed);
    metricProgressCount.textContent = inProgressTasks.length;
    metricActiveSub.textContent = `${todoTasks.length} to do`;

    // Overdue Tasks
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
    metricOverdueCount.textContent = overdueTasks.length;

    // Daily Streak Calculation
    const streak = calculateDailyStreak();
    metricStreakCount.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;

    // Update Tab Badges
    countAll.textContent = tasks.length;
    countToday.textContent = todayTasks.length;
    countUpcoming.textContent = tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length;
    countInProgress.textContent = inProgressTasks.length;
    countCompleted.textContent = tasks.filter(t => t.completed).length;
    countOverdue.textContent = overdueTasks.length;

    // Overall Progress Bar (List View)
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = totalCount - completedCount;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    if (statsPercentage) statsPercentage.textContent = `${percentage}%`;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (statsCounter) statsCounter.textContent = `${completedCount} of ${totalCount} completed`;
    if (statsActiveCounter) statsActiveCounter.textContent = `${pendingCount} pending`;
  }

  function calculateDailyStreak() {
    // Get unique completion dates sorted chronologically
    const completedDates = new Set();
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dateStr = new Date(t.completedAt).toISOString().split('T')[0];
        completedDates.add(dateStr);
      }
    });

    const sortedDates = Array.from(completedDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If neither today nor yesterday has a completed task, streak is 0
    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = completedDates.has(todayStr) ? new Date() : yesterday;

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // --------------------------------------------------------------------------
  // 12. List View Rendering
  // --------------------------------------------------------------------------
  function renderListView() {
    const filtered = getFilteredAndSortedTasks();
    taskList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      if (searchQuery) {
        emptyTitle.textContent = 'No matching tasks';
        emptyDesc.textContent = `No tasks found matching "${searchQuery}".`;
      } else {
        emptyTitle.textContent = "You're all caught up!";
        emptyDesc.textContent = 'No tasks in this view. Enjoy the empty space or add a task.';
      }
    } else {
      emptyState.style.display = 'none';

      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority}-border ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        // Due date badge formatting
        let dueBadgeHtml = '';
        if (task.dueDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          const isOverdue = !task.completed && task.dueDate < todayStr;
          const isToday = task.dueDate === todayStr;
          const cls = isOverdue ? 'overdue' : (isToday ? 'today' : '');
          const label = isToday ? 'Today' : task.dueDate;
          dueBadgeHtml = `<span class="due-badge ${cls}"><i class="fa-regular fa-calendar"></i> ${label}${task.dueTime ? ' ' + task.dueTime : ''}</span>`;
        }

        // Subtasks progress badge
        let subtaskBadgeHtml = '';
        if (task.subtasks && task.subtasks.length > 0) {
          const doneCount = task.subtasks.filter(s => s.completed).length;
          subtaskBadgeHtml = `<span class="subtask-badge"><i class="fa-solid fa-list-check"></i> ${doneCount}/${task.subtasks.length}</span>`;
        }

        // Recurrence badge
        let recBadgeHtml = '';
        if (task.recurrence && task.recurrence !== 'none') {
          recBadgeHtml = `<span class="category-badge" title="Recurring: ${task.recurrence}"><i class="fa-solid fa-arrows-rotate"></i> ${task.recurrence}</span>`;
        }

        // Tags
        let tagsHtml = '';
        if (task.tags && task.tags.length > 0) {
          tagsHtml = task.tags.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join(' ');
        }

        li.innerHTML = `
          <button class="task-checkbox-btn" aria-label="Toggle task completion" title="${task.completed ? 'Mark Active' : 'Mark Completed'}">
            <i class="fa-solid fa-check"></i>
          </button>
          
          <div class="task-details-col">
            <div class="task-title-row">
              <span class="task-title">${escapeHtml(task.title)}</span>
            </div>
            <div class="task-meta-row">
              <span class="priority-badge priority-${task.priority}">${task.priority}</span>
              <span class="category-badge">${task.category}</span>
              ${dueBadgeHtml}
              ${recBadgeHtml}
              ${subtaskBadgeHtml}
              ${tagsHtml}
            </div>
          </div>

          <div class="task-actions-col">
            <button class="action-btn-xs" data-action="focus" title="Start Focus Session">
              <i class="fa-solid fa-stopwatch"></i>
            </button>
            <button class="action-btn-xs" data-action="edit" title="Edit Task">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="action-btn-xs delete" data-action="delete" title="Delete Task">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `;

        // Click checkbox
        li.querySelector('.task-checkbox-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTaskCompletion(task.id);
        });

        // Click task details opens modal
        li.querySelector('.task-details-col').addEventListener('click', () => {
          openEditModal(task.id);
        });

        // Click actions
        li.querySelector('[data-action="focus"]').addEventListener('click', (e) => {
          e.stopPropagation();
          startFocusOnTask(task.id);
        });

        li.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
          e.stopPropagation();
          openEditModal(task.id);
        });

        li.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        taskList.appendChild(li);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 13. Kanban Board Rendering & HTML5 Drag and Drop
  // --------------------------------------------------------------------------
  function renderKanbanView() {
    const filtered = getFilteredAndSortedTasks();

    kanbanDropzoneTodo.innerHTML = '';
    kanbanDropzoneProgress.innerHTML = '';
    kanbanDropzoneCompleted.innerHTML = '';

    const todoList = filtered.filter(t => t.status === 'todo' && !t.completed);
    const progressList = filtered.filter(t => t.status === 'in_progress' && !t.completed);
    const completedList = filtered.filter(t => t.completed || t.status === 'completed');

    kanbanCountTodo.textContent = todoList.length;
    kanbanCountProgress.textContent = progressList.length;
    kanbanCountCompleted.textContent = completedList.length;

    todoList.forEach(t => kanbanDropzoneTodo.appendChild(createKanbanCard(t)));
    progressList.forEach(t => kanbanDropzoneProgress.appendChild(createKanbanCard(t)));
    completedList.forEach(t => kanbanDropzoneCompleted.appendChild(createKanbanCard(t)));
  }

  function createKanbanCard(task) {
    const card = document.createElement('div');
    card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
    card.draggable = true;
    card.dataset.id = task.id;

    let subtaskProgress = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const done = task.subtasks.filter(s => s.completed).length;
      subtaskProgress = `<span class="subtask-badge"><i class="fa-solid fa-list-check"></i> ${done}/${task.subtasks.length}</span>`;
    }

    card.innerHTML = `
      <div class="kanban-card-title">${escapeHtml(task.title)}</div>
      <div class="kanban-card-meta">
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        <span class="category-badge">${task.category}</span>
        ${task.dueDate ? `<span><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>` : ''}
        ${subtaskProgress}
      </div>
    `;

    card.addEventListener('dragstart', (e) => {
      draggedTaskId = task.id;
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedTaskId = null;
    });

    card.addEventListener('click', () => {
      openEditModal(task.id);
    });

    return card;
  }

  // Setup dropzones
  const dropzones = [
    { zone: kanbanDropzoneTodo, status: 'todo', completed: false },
    { zone: kanbanDropzoneProgress, status: 'in_progress', completed: false },
    { zone: kanbanDropzoneCompleted, status: 'completed', completed: true }
  ];

  dropzones.forEach(({ zone, status, completed }) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      if (!taskId) return;

      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      task.status = status;
      task.completed = completed;
      task.updatedAt = new Date().toISOString();
      if (completed) {
        task.completedAt = new Date().toISOString();
        playChime();
      } else {
        task.completedAt = null;
      }

      saveTasks();
      renderAll();
      showToast(`Moved to "${status.replace('_', ' ').toUpperCase()}"`);
    });
  });

  // Kanban column quick add buttons
  document.querySelectorAll('.btn-col-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status || 'todo';
      openCreateModal(status);
    });
  });

  // --------------------------------------------------------------------------
  // 14. Calendar View Engine
  // --------------------------------------------------------------------------
  function renderCalendarView() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    // First day of current month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    // Total days in current month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Total days in previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    calendarDaysGrid.innerHTML = '';
    const todayStr = new Date().toISOString().split('T')[0];
    let scheduledTasksCount = 0;

    // 1. Render Previous Month Days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.innerHTML = `
        <div class="cal-day-header">
          <span class="cal-day-num">${dayNum}</span>
        </div>
      `;
      calendarDaysGrid.appendChild(cell);
    }

    // 2. Render Current Month Days
    for (let d = 1; d <= totalDays; d++) {
      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = cellDateStr === todayStr;

      const dayTasks = tasks.filter(t => t.dueDate === cellDateStr);
      scheduledTasksCount += dayTasks.length;

      const cell = document.createElement('div');
      cell.className = `cal-day-cell ${isToday ? 'today' : ''}`;
      cell.innerHTML = `
        <div class="cal-day-header">
          <span class="cal-day-num">${d}</span>
        </div>
        <div class="cal-day-tasks"></div>
      `;

      const tasksContainer = cell.querySelector('.cal-day-tasks');
      dayTasks.forEach(t => {
        const pill = document.createElement('div');
        pill.className = `cal-task-pill ${t.completed ? 'completed' : ''}`;
        pill.textContent = t.title;
        pill.title = `${t.title} (${t.priority})`;
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditModal(t.id);
        });
        tasksContainer.appendChild(pill);
      });

      cell.addEventListener('click', () => {
        openCreateModal('todo', cellDateStr);
      });

      calendarDaysGrid.appendChild(cell);
    }

    // 3. Render Next Month Leading Days to complete 35 or 42 grid cells
    const totalRendered = startingDayOfWeek + totalDays;
    const remaining = totalRendered <= 35 ? (35 - totalRendered) : (42 - totalRendered);
    for (let n = 1; n <= remaining; n++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.innerHTML = `
        <div class="cal-day-header">
          <span class="cal-day-num">${n}</span>
        </div>
      `;
      calendarDaysGrid.appendChild(cell);
    }

    calendarTotalTasks.textContent = `${scheduledTasksCount} tasks scheduled`;
  }

  btnCalPrev.addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendarView();
  });

  btnCalNext.addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendarView();
  });

  btnCalToday.addEventListener('click', () => {
    calCurrentDate = new Date();
    renderCalendarView();
  });

  // --------------------------------------------------------------------------
  // 15. Pomodoro Focus Timer Engine
  // --------------------------------------------------------------------------
  const POMO_DURATIONS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  let pomoMode = 'focus';
  let pomoRemainingSeconds = POMO_DURATIONS.focus;
  let pomoIsRunning = false;
  let pomoIntervalId = null;
  let pomoActiveTaskId = null;

  function renderPomodoroView() {
    pomoCompletedSessions.textContent = pomoStats.completedSessions || 0;
    pomoTotalFocusTime.textContent = `${pomoStats.totalFocusMinutes || 0}m`;

    // Populate task selector
    pomoTaskSelect.innerHTML = '<option value="">-- Select a Task to Focus On --</option>';
    const activeTasks = tasks.filter(t => !t.completed);
    activeTasks.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.title} (${t.priority})`;
      if (t.id === pomoActiveTaskId) opt.selected = true;
      pomoTaskSelect.appendChild(opt);
    });

    updatePomoDisplay();
  }

  function updatePomoDisplay() {
    const mins = Math.floor(pomoRemainingSeconds / 60);
    const secs = pomoRemainingSeconds % 60;
    pomoTimeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const totalSecs = POMO_DURATIONS[pomoMode];
    const progressPercent = ((totalSecs - pomoRemainingSeconds) / totalSecs);
    const strokeDash = 660; // 2 * PI * 105
    const offset = strokeDash - (progressPercent * strokeDash);
    pomoRingFill.style.strokeDashoffset = offset;

    // Mode labels
    if (pomoMode === 'focus') {
      pomoStateLabel.textContent = pomoIsRunning ? 'Focus Session Active' : 'Ready to Focus';
      pomoRingFill.style.stroke = 'var(--accent-primary)';
    } else if (pomoMode === 'shortBreak') {
      pomoStateLabel.textContent = pomoIsRunning ? 'Short Break in Progress' : 'Short Break Ready';
      pomoRingFill.style.stroke = '#38bdf8';
    } else {
      pomoStateLabel.textContent = pomoIsRunning ? 'Long Break in Progress' : 'Long Break Ready';
      pomoRingFill.style.stroke = '#10b981';
    }

    // Toggle button UI
    if (pomoIsRunning) {
      pomoToggleIcon.className = 'fa-solid fa-pause';
      pomoToggleText.textContent = 'Pause';
      btnPomoToggle.classList.remove('btn-pomo-start');
      btnPomoToggle.classList.add('btn-secondary');
      pomodoroActiveDot.style.display = 'block';
    } else {
      pomoToggleIcon.className = 'fa-solid fa-play';
      pomoToggleText.textContent = 'Start Focus';
      btnPomoToggle.classList.add('btn-pomo-start');
      btnPomoToggle.classList.remove('btn-secondary');
      pomodoroActiveDot.style.display = 'none';
    }
  }

  function togglePomodoro() {
    if (pomoIsRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  }

  function startPomodoro() {
    pomoIsRunning = true;
    updatePomoDisplay();

    pomoIntervalId = setInterval(() => {
      pomoRemainingSeconds--;

      if (pomoRemainingSeconds <= 0) {
        completePomodoroSession();
      } else {
        updatePomoDisplay();
      }
    }, 1000);
  }

  function pausePomodoro() {
    pomoIsRunning = false;
    clearInterval(pomoIntervalId);
    updatePomoDisplay();
  }

  function resetPomodoro() {
    pausePomodoro();
    pomoRemainingSeconds = POMO_DURATIONS[pomoMode];
    updatePomoDisplay();
    showToast('Timer reset.');
  }

  function completePomodoroSession() {
    pausePomodoro();
    playChime();

    if (pomoMode === 'focus') {
      pomoStats.completedSessions = (pomoStats.completedSessions || 0) + 1;
      pomoStats.totalFocusMinutes = (pomoStats.totalFocusMinutes || 0) + 25;
      savePomoStats();

      showToast('Focus session complete! Take a well-deserved break! 🎉');
      switchPomoMode('shortBreak');
    } else {
      showToast('Break finished! Ready to get back into focus?');
      switchPomoMode('focus');
    }

    renderPomodoroView();
  }

  function switchPomoMode(mode) {
    pomoMode = mode;
    pomoRemainingSeconds = POMO_DURATIONS[mode];
    pomoModeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    resetPomodoro();
  }

  pomoModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode) switchPomoMode(mode);
    });
  });

  btnPomoToggle.addEventListener('click', togglePomodoro);
  btnPomoReset.addEventListener('click', resetPomodoro);
  btnPomoSkip.addEventListener('click', () => {
    completePomodoroSession();
  });

  pomoTaskSelect.addEventListener('change', (e) => {
    pomoActiveTaskId = e.target.value;
  });

  function startFocusOnTask(taskId) {
    pomoActiveTaskId = taskId;
    switchView('view-pomodoro');
    switchPomoMode('focus');
    startPomodoro();
  }

  // Audio chime feedback using Web Audio API synthesis
  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio chime fallback
    }
  }

  // --------------------------------------------------------------------------
  // 16. Productivity Analytics Engine
  // --------------------------------------------------------------------------
  function renderAnalyticsView() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    anTotalTasks.textContent = total;
    anRate.textContent = `${rate}%`;
    anRateDesc.textContent = `${completed} completed (${total - completed} active)`;

    // Completed in past 7 days
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 86400000);
    const weekDone = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).getTime() >= sevenDaysAgo).length;
    anWeekCompleted.textContent = weekDone;

    // Pomodoro Stats
    anFocusSessions.textContent = pomoStats.completedSessions || 0;
    anFocusTime.textContent = `${pomoStats.totalFocusMinutes || 0} min focus time`;

    // Streaks
    const currentStreak = calculateDailyStreak();
    anCurrentStreak.textContent = `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`;
    anLongestStreak.textContent = `${Math.max(currentStreak, 3)} Days`;

    if (currentStreak >= 3) {
      anStreakDesc.textContent = `Outstanding! You are on a ${currentStreak}-day active streak! Keep crushing your goals! 🔥`;
    } else {
      anStreakDesc.textContent = 'Complete at least one task every day to build a formidable productivity streak.';
    }

    // Weekly Bar Chart Calculation (Last 7 Days)
    weeklyBarChart.innerHTML = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - (i * 86400000));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];
      const count = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)).length;
      past7Days.push({ dateStr, dayLabel, count });
    }

    const maxCount = Math.max(1, ...past7Days.map(p => p.count));

    past7Days.forEach(({ dayLabel, count }) => {
      const heightPercent = Math.max(8, Math.round((count / maxCount) * 100));
      const col = document.createElement('div');
      col.className = 'bar-col';
      col.innerHTML = `
        <span class="bar-count">${count}</span>
        <div class="bar-track">
          <div class="bar-fill" style="height: ${heightPercent}%;"></div>
        </div>
        <span class="bar-day-lbl">${dayLabel}</span>
      `;
      weeklyBarChart.appendChild(col);
    });

    // Category Breakdown Calculation
    categoryBreakdownList.innerHTML = '';
    const categories = ['Coding', 'Study', 'Work', 'Projects', 'Personal', 'Shopping', 'Other'];
    const catCounts = {};

    categories.forEach(c => catCounts[c] = 0);
    tasks.forEach(t => {
      const cat = t.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    categories.forEach(cat => {
      const count = catCounts[cat] || 0;
      if (count > 0 || total === 0) {
        const percent = total === 0 ? 0 : Math.round((count / total) * 100);
        const row = document.createElement('div');
        row.className = 'cat-row';
        row.innerHTML = `
          <div class="cat-row-info">
            <span>${cat}</span>
            <span style="color:var(--text-muted);">${count} tasks (${percent}%)</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${percent}%;"></div>
          </div>
        `;
        categoryBreakdownList.appendChild(row);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 17. Task Detail & Edit Modal
  // --------------------------------------------------------------------------
  function openCreateModal(defaultStatus = 'todo', defaultDueDate = null) {
    editingTaskId = null;
    modalSubtasks = [];

    taskModalTitle.textContent = 'Create New Task';
    taskModalIconBadge.innerHTML = '<i class="fa-solid fa-plus"></i>';
    modalTaskTitle.value = '';
    modalTitleError.textContent = '';
    modalTaskDesc.value = '';
    modalTaskPriority.value = 'medium';
    modalTaskCategory.value = 'Coding';
    modalTaskStatus.value = defaultStatus;
    modalTaskDueDate.value = defaultDueDate || '';
    modalTaskDueTime.value = '';
    modalTaskRecurrence.value = 'none';
    modalTaskTags.value = '';

    btnModalDelete.style.display = 'none';
    btnModalDuplicate.style.display = 'none';
    btnModalFocus.style.display = 'none';

    renderModalSubtasks();
    taskModal.classList.add('open');
    modalTaskTitle.focus();
  }

  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = task.id;
    modalSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];

    taskModalTitle.textContent = 'Edit Task Details';
    taskModalIconBadge.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    modalTaskTitle.value = task.title;
    modalTitleError.textContent = '';
    modalTaskDesc.value = task.description || '';
    modalTaskPriority.value = task.priority;
    modalTaskCategory.value = task.category;
    modalTaskStatus.value = task.status;
    modalTaskDueDate.value = task.dueDate || '';
    modalTaskDueTime.value = task.dueTime || '';
    modalTaskRecurrence.value = task.recurrence || 'none';
    modalTaskTags.value = task.tags ? task.tags.join(', ') : '';

    btnModalDelete.style.display = 'inline-flex';
    btnModalDuplicate.style.display = 'inline-flex';
    btnModalFocus.style.display = 'inline-flex';

    renderModalSubtasks();
    taskModal.classList.add('open');
  }

  function closeTaskModal() {
    taskModal.classList.remove('open');
    editingTaskId = null;
    modalSubtasks = [];
  }

  function renderModalSubtasks() {
    modalSubtasksList.innerHTML = '';
    const doneCount = modalSubtasks.filter(s => s.completed).length;
    modalSubtaskProgress.textContent = `${doneCount}/${modalSubtasks.length}`;

    modalSubtasks.forEach((st, idx) => {
      const li = document.createElement('li');
      li.className = 'modal-subtask-item';
      li.innerHTML = `
        <div class="modal-subtask-left">
          <input type="checkbox" ${st.completed ? 'checked' : ''} />
          <span class="modal-subtask-text ${st.completed ? 'completed' : ''}">${escapeHtml(st.text)}</span>
        </div>
        <button type="button" class="btn-remove-subtask" title="Remove Subtask">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      li.querySelector('input').addEventListener('change', (e) => {
        st.completed = e.target.checked;
        renderModalSubtasks();
      });

      li.querySelector('.btn-remove-subtask').addEventListener('click', () => {
        modalSubtasks.splice(idx, 1);
        renderModalSubtasks();
      });

      modalSubtasksList.appendChild(li);
    });
  }

  btnAddSubtask.addEventListener('click', () => {
    const text = modalSubtaskInput.value.trim();
    if (!text) return;
    modalSubtasks.push({
      id: 'sub-' + Date.now(),
      text: text,
      completed: false
    });
    modalSubtaskInput.value = '';
    renderModalSubtasks();
    modalSubtaskInput.focus();
  });

  modalSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnAddSubtask.click();
    }
  });

  taskModalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = modalTaskTitle.value.trim();
    if (!title) {
      modalTitleError.textContent = 'Please enter a task title.';
      modalTaskTitle.focus();
      return;
    }

    const rawTags = modalTaskTags.value.split(/[,#\s]+/).filter(Boolean).map(t => t.trim().toLowerCase());
    const isCompleted = modalTaskStatus.value === 'completed';

    const payload = {
      title,
      description: modalTaskDesc.value.trim(),
      priority: modalTaskPriority.value,
      category: modalTaskCategory.value,
      status: modalTaskStatus.value,
      completed: isCompleted,
      dueDate: modalTaskDueDate.value || null,
      dueTime: modalTaskDueTime.value || null,
      recurrence: modalTaskRecurrence.value,
      tags: rawTags,
      subtasks: modalSubtasks,
      completedAt: isCompleted ? (new Date().toISOString()) : null
    };

    if (editingTaskId) {
      updateTask(editingTaskId, payload);
    } else {
      createTask(payload);
    }

    closeTaskModal();
  });

  btnOpenCreateModal.addEventListener('click', () => openCreateModal());
  btnEmptyAdd.addEventListener('click', () => openCreateModal());
  btnCloseTaskModal.addEventListener('click', closeTaskModal);
  btnCancelTaskModal.addEventListener('click', closeTaskModal);

  btnModalDelete.addEventListener('click', () => {
    if (editingTaskId) {
      deleteTask(editingTaskId);
      closeTaskModal();
    }
  });

  btnModalDuplicate.addEventListener('click', () => {
    if (editingTaskId) {
      duplicateTask(editingTaskId);
      closeTaskModal();
    }
  });

  btnModalFocus.addEventListener('click', () => {
    if (editingTaskId) {
      const id = editingTaskId;
      closeTaskModal();
      startFocusOnTask(id);
    }
  });

  // --------------------------------------------------------------------------
  // 18. JSON Backup & Restore (Import / Export)
  // --------------------------------------------------------------------------
  btnBackupModal.addEventListener('click', () => {
    backupModal.classList.add('open');
  });

  btnCloseBackupModal.addEventListener('click', () => backupModal.classList.remove('open'));
  btnCloseBackupFooter.addEventListener('click', () => backupModal.classList.remove('open'));

  btnExportJson.addEventListener('click', () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      tasks: tasks,
      pomoStats: pomoStats,
      theme: localStorage.getItem(THEME_KEY) || 'dark'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `taskflow-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  });

  btnTriggerFileImport.addEventListener('click', () => {
    importFileInput.click();
  });

  let importedPayload = null;
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importFilenamePreview.textContent = file.name;
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (Array.isArray(parsed) || Array.isArray(parsed.tasks))) {
          importedPayload = Array.isArray(parsed) ? parsed : parsed.tasks;
          importConfirmBox.style.display = 'block';
          showToast('Valid backup file loaded. Click Confirm to restore.');
        } else {
          showToast('Invalid TaskFlow JSON schema.', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON file.', 'error');
      }
    };

    reader.readAsText(file);
  });

  btnExecuteImport.addEventListener('click', () => {
    if (!importedPayload || !Array.isArray(importedPayload)) return;

    if (confirm(`Restore ${importedPayload.length} task(s)? This will merge with your current tasks.`)) {
      const newTasks = importedPayload.map(normalizeTask).filter(Boolean);
      tasks = [...newTasks, ...tasks];

      // De-duplicate by ID
      const seen = new Set();
      tasks = tasks.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });

      saveTasks();
      renderAll();
      backupModal.classList.remove('open');
      showToast(`Restored ${newTasks.length} task(s) successfully!`);
    }
  });

  // --------------------------------------------------------------------------
  // 19. Keyboard Shortcuts Helper Modal & Global Key Listener
  // --------------------------------------------------------------------------
  btnShortcutsModal.addEventListener('click', () => {
    shortcutsModal.classList.add('open');
  });

  btnCloseShortcutsModal.addEventListener('click', () => shortcutsModal.classList.remove('open'));
  btnCloseShortcutsFooter.addEventListener('click', () => shortcutsModal.classList.remove('open'));

  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

    if (e.key === 'Escape') {
      taskModal.classList.remove('open');
      backupModal.classList.remove('open');
      shortcutsModal.classList.remove('open');
      return;
    }

    if (isInputActive) return;

    switch (e.key) {
      case 'n':
      case 'N':
        e.preventDefault();
        openCreateModal();
        break;
      case '/':
        e.preventDefault();
        searchInput.focus();
        break;
      case '1':
        e.preventDefault();
        switchView('view-list');
        break;
      case '2':
        e.preventDefault();
        switchView('view-kanban');
        break;
      case '3':
        e.preventDefault();
        switchView('view-calendar');
        break;
      case '4':
        e.preventDefault();
        switchView('view-pomodoro');
        break;
      case '5':
        e.preventDefault();
        switchView('view-analytics');
        break;
      case '?':
        e.preventDefault();
        shortcutsModal.classList.add('open');
        break;
    }
  });

  // --------------------------------------------------------------------------
  // 20. Notification Reminders (Graceful Web Notifications)
  // --------------------------------------------------------------------------
  if (btnNotificationToggle) {
    btnNotificationToggle.addEventListener('click', () => {
      if (!('Notification' in window)) {
        showToast('Web Notifications are not supported in this browser.', 'info');
        return;
      }

      if (Notification.permission === 'granted') {
        showToast('Task reminders are already enabled! 🔔');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            notificationIcon.className = 'fa-solid fa-bell text-emerald';
            showToast('Reminders enabled! We will notify you for due tasks.');
          } else {
            showToast('Notification permission denied.', 'info');
          }
        });
      } else {
        showToast('Notifications blocked in browser settings.', 'info');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 21. Toolbar Event Listeners
  // --------------------------------------------------------------------------
  statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderCurrentView();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    renderCurrentView();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderCurrentView();
  });

  filterCategory.addEventListener('change', (e) => {
    categoryFilter = e.target.value;
    renderCurrentView();
  });

  filterPriority.addEventListener('change', (e) => {
    priorityFilter = e.target.value;
    renderCurrentView();
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderCurrentView();
  });

  clearCompletedBtn.addEventListener('click', () => {
    const doneCount = tasks.filter(t => t.completed).length;
    if (doneCount === 0) {
      showToast('No completed tasks to clear.', 'info');
      return;
    }

    if (confirm(`Remove ${doneCount} completed task(s)?`)) {
      tasks = tasks.filter(t => !t.completed);
      saveTasks();
      renderAll();
      showToast(`Cleared ${doneCount} completed task(s).`);
    }
  });

  // --------------------------------------------------------------------------
  // 22. Master Render Dispatcher
  // --------------------------------------------------------------------------
  function renderCurrentView() {
    updateDashboardMetrics();

    switch (currentView) {
      case 'view-list':
        renderListView();
        break;
      case 'view-kanban':
        renderKanbanView();
        break;
      case 'view-calendar':
        renderCalendarView();
        break;
      case 'view-pomodoro':
        renderPomodoroView();
        break;
      case 'view-analytics':
        renderAnalyticsView();
        break;
      default:
        renderListView();
    }
  }

  function renderAll() {
    updateDashboardMetrics();
    renderCurrentView();
  }

  // --------------------------------------------------------------------------
  // 23. App Initialization
  // --------------------------------------------------------------------------
  initTheme();
  renderAll();
});
