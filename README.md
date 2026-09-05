# TaskFlow — Smart Task & To-Do Management Web App (SAM AI Technologies Task 2)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://ajayhukkeri6363-cpu.github.io/sam-ai-todo-app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/ajayhukkeri6363-cpu/sam-ai-todo-app)
[![Internship](https://img.shields.io/badge/Internship-SAM%20AI%20Technologies-indigo?style=for-the-badge)](https://sites.google.com/view/sam-ai-technologies/home)

> A modern, responsive task management application built by **Ajay Hukkeri** with **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3** featuring full browser **LocalStorage** persistence.

---

## 📌 Project Objective & PDF Requirements

This project was built strictly according to **Task 2** of the **SAM AI Technologies Internship Program**:
- **Add Tasks**: Interactive input field with validation and priority selection.
- **Remove Tasks**: Instant task deletion with UI feedback.
- **Mark as Completed**: Toggle task completion with visual strikethrough, badge updates, and real-time progress calculation.
- **LocalStorage Persistence**: Full state synchronization so all tasks remain saved across browser reloads and sessions.

---

## ✨ Features & Enhancements

- **⚡ Priority Tagging**: Classify tasks as **High** (🔥), **Medium** (⚡), or **Low** (🌱) with custom color-coded badges.
- **📊 Real-Time Progress Tracker**: Dynamic task counter and animated percentage progress bar (`X of Y completed`).
- **🔍 Instant Live Search**: Filter tasks instantaneously as you type with a clear-search button.
- **📂 Status Filter Tabs**: Quick navigation between `All`, `Active`, and `Completed` tasks.
- **✏️ Inline Editing**: Double-click or click the edit icon to modify task text directly with `Enter` (save) or `Escape` (cancel).
- **🧹 Bulk Management**: One-click "Clear Completed" button with confirmation.
- **🌓 Dark / Light Mode Theming**: Customizable visual theme saved in `localStorage`.
- **📱 Responsive Layout**: Optimized for mobile phones, tablets, and desktop displays.

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, CSS3 (Variables, Flexbox, CSS Grid, Transitions)
- **Programming Logic**: Vanilla JavaScript (ES6+ modular DOM manipulation, Event Delegation)
- **Data Persistence**: Web Storage API (`localStorage`)
- **Icons & Typography**: Google Fonts (*Plus Jakarta Sans*, *Fira Code*), FontAwesome 6

---

## 📁 Directory Structure

```
todo-app/
├── index.html       # Main application markup
├── css/
│   └── style.css    # Responsive styles, theme variables, animations
├── js/
│   └── app.js       # LocalStorage CRUD, filters, search, progress logic
└── README.md        # Comprehensive documentation
```

---

## 🚀 Local Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ajayhukkeri6363-cpu/sam-ai-todo-app.git
   cd sam-ai-todo-app/todo-app
   ```

2. **Open the project**:
   - Double-click `index.html` to open in any web browser.
   - Or launch via VS Code Live Server / Python HTTP server (`python -m http.server 8000`).

---

## 🌐 Deployment Instructions

### GitHub Pages
1. Push the project repository to GitHub.
2. Go to **Settings** -> **Pages**.
3. Select `main` branch and `/` root directory, then click **Save**.

---

## 📋 PDF Requirements Compliance Matrix

| Requirement from SAM AI PDF | Implementation Detail | Status |
| :--- | :--- | :---: |
| **HTML, CSS, JavaScript** | Pure Vanilla JS with no external frameworks | ✅ Completed |
| **Add Tasks** | Validated form with priority assignment | ✅ Completed |
| **Remove Tasks** | Individual delete action button with toast alert | ✅ Completed |
| **Mark as Completed** | Interactive check toggle with strikethrough & count update | ✅ Completed |
| **Browser Storage** | `localStorage` serialization (`JSON.stringify` / `JSON.parse`) | ✅ Completed |
| **Additional Enhancements** | Search bar, status tabs, progress bar, inline edit, dark mode | ✅ Completed |

---

## 👤 Author & Acknowledgements

- **Developer**: **Ajay Hukkeri**
- **Education**: B.Tech in Computer Science and Engineering, REVA University, Bangalore
- **Email**: [ajayhukkeri6363@gmail.com](mailto:ajayhukkeri6363@gmail.com)
- **LinkedIn**: [linkedin.com/in/ajay-hukkeri-45094233a/](https://www.linkedin.com/in/ajay-hukkeri-45094233a/)
- **GitHub**: [github.com/ajayhukkeri6363-cpu](https://github.com/ajayhukkeri6363-cpu)
- **Internship Track**: Web Development Internship
- **Organization**: **SAM AI Technologies** (*"Your dream your passion"*)
