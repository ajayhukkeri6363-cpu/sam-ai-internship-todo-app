# TaskFlow — Smart Task Manager (SAM AI Technologies Task 2)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://ajayhukkeri6363-cpu.github.io/sam-ai-internship-todo-app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/ajayhukkeri6363-cpu/sam-ai-internship-todo-app)
[![Internship](https://img.shields.io/badge/Internship-SAM%20AI%20Technologies-indigo?style=for-the-badge)](https://sites.google.com/view/sam-ai-technologies/home)

> A modern, SaaS-grade smart task management web application built by **Ajay Hukkeri** with **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3** featuring multi-view Kanban board, interactive month calendar, subtasks progress tracking, Pomodoro focus mode, productivity analytics, natural language quick add, and complete **LocalStorage** persistence with backward-compatible migration.

---

## 📌 Project Objective & PDF Requirements

This project was built strictly according to **Task 2** of the **SAM AI Technologies Internship Program**:
- **Add Tasks**: Interactive input field with validation, priority assignment, category tagging, due date/time, and subtasks.
- **Remove Tasks**: Instant task deletion with UI feedback and confirmation dialogs.
- **Mark as Completed**: Toggle task completion with visual strikethrough, subtask sync, recurrence advancement, and real-time progress calculation.
- **LocalStorage Persistence**: Full state synchronization so all tasks, subtasks, focus sessions, and settings remain saved across browser reloads.

---

## ✨ Features & Enhancements

### 1. 📋 Multi-View Workspace
- **List View**: Grouped, sorted, and filterable task list with subtask progress bars, priority stripes, and inline quick actions.
- **Kanban Board**: Drag-and-drop task columns (*To Do*, *In Progress*, *Completed*) syncing task status and completion timestamps in real time.
- **Calendar View**: Interactive monthly calendar with month navigation and clickable day task badges opening task details.
- **Pomodoro Focus Mode**: 25m Focus / 5m Short Break / 15m Long Break timer with circular countdown ring, task attachment, session logging, and Web Audio API synthesized chime.
- **Productivity Analytics**: Real-time completion rates, weekly activity distribution CSS bar chart, category breakdown, and daily streak tracking.

### 2. ⚡ Smart Productivity Engine
- **🧠 Natural Language Quick Add**: Deterministic parser recognizing phrases like `Study Java tomorrow at 6 PM #college in Study critical priority` to extract title, date, time, category, priority, and tags automatically.
- **🔥 Real Daily Streak Tracker**: Calculates consecutive active completion days dynamically from task timestamps.
- **🔄 Recurring Tasks**: Automatic next occurrence scheduling for `Daily`, `Weekdays`, `Weekly`, and `Monthly` tasks upon completion.
- **✅ Subtasks with Progress Tracking**: Add multiple subtasks per item with live completion progress (`3/5`) and auto-parent completion.
- **🏷️ Multi-Dimensional Filters & Search**: Real-time cross-filtering across status, priority, category, and tags with instant search.
- **💾 JSON Backup & Restore**: One-click export and validated import of all task data.
- **⌨️ Keyboard Shortcuts**: Fast shortcuts (`N` for new task, `/` for search, `1-5` for views, `Esc` to close modals, `?` for cheat sheet).
- **🌓 Dark / Light Mode Theming**: Deep dark SaaS aesthetic with light mode toggle and `localStorage` persistence.

---

## 🛠️ Technology Stack

- **Frontend Markup**: Semantic HTML5 with ARIA accessibility labels
- **Styling & Layout**: CSS3 (CSS Variables, Flexbox, CSS Grid, SVG Circular Rings, Micro-animations)
- **Programming Logic**: Pure Vanilla JavaScript (ES6+ modular architecture, State Store, HTML5 Drag & Drop API, Web Audio API)
- **Data Persistence**: Web Storage API (`localStorage`) with backward-compatible schema normalizer
- **Icons & Typography**: Google Fonts (*Plus Jakarta Sans*, *Fira Code*), FontAwesome 6

---

## 📁 Directory Structure

```
todo-app/
├── index.html       # SaaS task manager layout, view templates & modals
├── css/
│   └── style.css    # Responsive design system, theme variables, Kanban & Calendar styles
├── js/
│   └── app.js       # Core state store, drag & drop, calendar, parser & analytics engine
└── README.md        # Comprehensive documentation
```

---

## 📋 PDF Requirements Compliance Matrix

| Requirement from SAM AI PDF | Implementation Detail | Status |
| :--- | :--- | :---: |
| **HTML, CSS, JavaScript** | Pure Vanilla JS with no external frameworks or libraries | ✅ Completed |
| **Add Tasks** | Natural language quick add and rich modal with subtasks, tags, dates | ✅ Completed |
| **Remove Tasks** | Individual delete action with toast notification and bulk clear | ✅ Completed |
| **Mark as Completed** | Interactive check toggle, subtask synchronization & recurrence engine | ✅ Completed |
| **Browser Storage** | `localStorage` serialization with schema migration (`sam_ai_tasks_data`) | ✅ Completed |
| **Additional Enhancements** | Kanban board, Calendar, Pomodoro timer, Analytics, Import/Export | ✅ Completed |

---

## 👤 Author & Acknowledgements

- **Developer**: **Ajay Hukkeri**
- **Education**: B.Tech in Computer Science and Engineering, REVA University, Bangalore
- **Email**: [ajayhukkeri6363@gmail.com](mailto:ajayhukkeri6363@gmail.com)
- **LinkedIn**: [linkedin.com/in/ajay-hukkeri-45094233a/](https://www.linkedin.com/in/ajay-hukkeri-45094233a/)
- **GitHub**: [github.com/ajayhukkeri6363-cpu](https://github.com/ajayhukkeri6363-cpu)
- **Internship Track**: Web Development Internship
