let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

let dailyGoal = Number(localStorage.getItem("dailyGoal")) || 3;

let currentFilter = "all";

let editingId = null;


/* =========================
   SAVE DATA
========================= */

function saveData() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}


/* =========================
   DATE
========================= */

function todayString() {

  const date = new Date();

  const y = date.getFullYear();

  const m = String(date.getMonth() + 1).padStart(2, "0");

  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}


/* =========================
   ADD / UPDATE TASK
========================= */

function saveTask() {

  const name =
    document.getElementById("taskInput").value.trim();

  const date =
    document.getElementById("dateInput").value;

  const time =
    document.getElementById("timeInput").value;

  const priority =
    document.getElementById("priorityInput").value;

  const reminder =
    document.getElementById("reminderInput").checked;


  if (!name) {

    alert("Please enter a task!");

    return;

  }


  if (!date) {

    alert("Please select a date!");

    return;

  }


  if (!time) {

    alert("Please select a time!");

    return;

  }


  /* UPDATE */

  if (editingId !== null) {

    const task = tasks.find(
      t => t.id === editingId
    );

    if (task) {

      task.name = name;

      task.date = date;

      task.time = time;

      task.priority = priority;

      task.reminder = reminder;

    }

    editingId = null;

    document.getElementById("formTitle")
      .innerText = "➕ Add New Task";

    document.getElementById("saveButton")
      .innerText = "➕ Add Task";

    document.getElementById("cancelButton")
      .style.display = "none";

  }

  /* NEW TASK */

  else {

    const newTask = {

      id: Date.now(),

      name: name,

      date: date,

      time: time,

      priority: priority,

      reminder: reminder,

      completed: false

    };

    tasks.push(newTask);

  }


  saveData();

  clearForm();

  render();

}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("taskInput").value = "";

  document.getElementById("dateInput").value = "";

  document.getElementById("timeInput").value = "";

  document.getElementById("priorityInput").value = "Low";

  document.getElementById("reminderInput").checked = false;

}


/* =========================
   EDIT TASK
========================= */

function editTask(id) {

  const task = tasks.find(
    t => t.id === id
  );

  if (!task) return;


  document.getElementById("taskInput").value =
    task.name;

  document.getElementById("dateInput").value =
    task.date;

  document.getElementById("timeInput").value =
    task.time;

  document.getElementById("priorityInput").value =
    task.priority;

  document.getElementById("reminderInput").checked =
    task.reminder;


  editingId = id;


  document.getElementById("formTitle")
    .innerText = "✏️ Edit Task";

  document.getElementById("saveButton")
    .innerText = "💾 Update Task";

  document.getElementById("cancelButton")
    .style.display = "block";

}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

  editingId = null;

  clearForm();

  document.getElementById("formTitle")
    .innerText = "➕ Add New Task";

  document.getElementById("saveButton")
    .innerText = "➕ Add Task";

  document.getElementById("cancelButton")
    .style.display = "none";

}


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

  const task = tasks.find(
    t => t.id === id
  );

  if (!task) return;


  task.completed = !task.completed;


  saveData();

  render();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

  const answer =
    confirm("Delete this task?");

  if (!answer) return;


  tasks = tasks.filter(
    task => task.id !== id
  );


  saveData();

  render();

}


/* =========================
   FILTER
========================= */

function setFilter(filter) {

  currentFilter = filter;

  renderTasks();

}


/* =========================
   FILTER TASKS
========================= */

function getFilteredTasks() {

  let result = [...tasks];


  const search =
    document.getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();


  if (search) {

    result = result.filter(
      task =>
        task.name
          .toLowerCase()
          .includes(search)
    );

  }


  const today =
    todayString();


  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );


  const tomorrowString =
    tomorrow.toISOString()
      .split("T")[0];


  if (currentFilter === "today") {

    result = result.filter(
      task => task.date === today
    );

  }


  if (currentFilter === "tomorrow") {

    result = result.filter(
      task =>
        task.date === tomorrowString
    );

  }


  if (currentFilter === "completed") {

    result = result.filter(
      task => task.completed
    );

  }


  if (currentFilter === "pending") {

    result = result.filter(
      task => !task.completed
    );

  }


  return result;

}


/* =========================
   SHOW TASKS
========================= */

function renderTasks() {

  const list =
    document.getElementById("taskList");

  list.innerHTML = "";


  const filtered =
    getFilteredTasks();


  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty">
        No tasks found 🔍
      </div>
    `;

    return;

  }


  filtered.sort(
    (a, b) =>
      (a.date + a.time)
        .localeCompare(
          b.date + b.time
        )
  );


  filtered.forEach(task => {

    const div =
      document.createElement("div");


    div.className =
      "task " +
      (task.completed
        ? "completed"
        : "");


    div.innerHTML = `

      <input
        type="checkbox"
        ${task.completed ? "checked" : ""}
        onchange="toggleTask(${task.id})"
      >

      <div class="task-info">

        <div class="task-name">
          ${escapeHTML(task.name)}
        </div>

        <div class="task-details">

          📅 ${task.date}

          &nbsp;

          ⏰ ${task.time}

          <br>

          Priority:
          ${task.priority}

          ${
            task.reminder
              ? " ⏰ Reminder ON"
              : ""
          }

          <br>

          ${
            task.completed
              ? "✅ Completed"
              : "⏳ Pending"
          }

        </div>

      </div>

      <button
        class="edit"
        onclick="editTask(${task.id})">

        ✏️

      </button>

      <button
        class="delete"
        onclick="deleteTask(${task.id})">

        🗑️

      </button>

    `;


    list.appendChild(div);

  });

}


/* =========================
   DASHBOARD
========================= */

function updateStats() {

  const total =
    tasks.length;


  const completed =
    tasks.filter(
      task => task.completed === true
    ).length;


  const pending =
    total - completed;


  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );


  document.getElementById("totalTasks")
    .innerText = total;


  document.getElementById("completedTasks")
    .innerText = completed;


  document.getElementById("pendingTasks")
    .innerText = pending;


  document.getElementById("progressText")
    .innerText = progress + "%";


  document.getElementById("progressBar")
    .style.width = progress + "%";


  document.getElementById("reportCompleted")
    .innerText = completed;


  document.getElementById("reportSuccess")
    .innerText = progress + "%";


  const achievement =
    document.getElementById("achievement");


  if (progress === 100 && total > 0) {

    achievement.innerText =
      "🏆 Amazing! All tasks completed!";

  }

  else if (progress >= 75) {

    achievement.innerText =
      "🔥 Excellent progress!";

  }

  else if (progress >= 50) {

    achievement.innerText =
      "💪 More than halfway! Keep going!";

  }

  else if (progress > 0) {

    achievement.innerText =
      "🚀 Good start! Keep going!";

  }

  else {

    achievement.innerText =
      "🎯 Add your first task!";

  }

}


/* =========================
   DAILY GOAL
========================= */

function saveGoal() {

  const value =
    Number(
      document.getElementById("dailyGoal").value
    );


  if (value < 1) {

    alert("Goal must be at least 1.");

    return;

  }


  dailyGoal = value;


  localStorage.setItem(
    "dailyGoal",
    dailyGoal
  );


  updateGoal();

}


function updateGoal() {

  const today =
    todayString();


  const completedToday =
    tasks.filter(
      task =>
        task.date === today &&
        task.completed
    ).length;


  document.getElementById("dailyGoal")
    .value = dailyGoal;


  document.getElementById("goalStatus")
    .innerText =
      `Today: ${completedToday}/${dailyGoal} tasks completed`;

}


/* =========================
   30 DAY TRACKER
========================= */

function updateDays() {

  const grid =
    document.getElementById("daysGrid");


  grid.innerHTML = "";


  const start =
    new Date();


  start.setHours(0, 0, 0, 0);


  for (let i = 0; i < 30; i++) {

    const date =
      new Date(start);


    date.setDate(
      start.getDate() + i
    );


    const dateString =
      date.toISOString()
        .split("T")[0];


    const dayTasks =
      tasks.filter(
        task =>
          task.date === dateString
      );


    const completed =
      dayTasks.filter(
        task =>
          task.completed
      ).length;


    const div =
      document.createElement("div");


    div.className = "day";


    if (
      dayTasks.length > 0 &&
      completed === dayTasks.length
    ) {

      div.classList.add("done");

    }

    else if (completed > 0) {

      div.classList.add("partial");

    }


    if (i === 0) {

      div.classList.add("current");

    }


    div.innerHTML = `
      <strong>Day ${i + 1}</strong>
      <br>
      ${completed}/${dayTasks.length}
    `;


    grid.appendChild(div);

  }

}


/* =========================
   STREAK
========================= */

function calculateStreak() {

  let streak = 0;


  const today =
    new Date();


  today.setHours(
    0, 0, 0, 0
  );


  for (let i = 0; i < 30; i++) {

    const date =
      new Date(today);


    date.setDate(
      today.getDate() - i
    );


    const dateString =
      date.toISOString()
        .split("T")[0];


    const dayTasks =
      tasks.filter(
        task =>
          task.date === dateString
      );


    if (
      dayTasks.length > 0 &&
      dayTasks.every(
        task =>
          task.completed
      )
    ) {

      streak++;

    }

    else {

      break;

    }

  }


  return streak;

}


function calculateBestStreak() {

  const completedDates =
    [
      ...new Set(
        tasks
          .filter(
            task =>
              task.completed
          )
          .map(
            task =>
              task.date
          )
      )
    ].sort();


  let best = 0;

  let current = 0;

  let previous = null;


  completedDates.forEach(date => {

    if (previous) {

      const difference =
        (
          new Date(date) -
          new Date(previous)
        ) /
        (1000 * 60 * 60 * 24);


      if (difference === 1) {

        current++;

      }

      else {

        current = 1;

      }

    }

    else {

      current = 1;

    }


    best =
      Math.max(
        best,
        current
      );


    previous = date;

  });


  return best;

}


function updateStreak() {

  const current =
    calculateStreak();


  const best =
    calculateBestStreak();


  document.getElementById("streak")
    .innerText =
      current + " Days";


  document.getElementById("bestStreak")
    .innerText =
      best;

}


/* =========================
   DARK MODE
========================= */

function toggleTheme() {

  document.body.classList.toggle("dark");


  const dark =
    document.body.classList.contains("dark");


  localStorage.setItem(
    "darkMode",
    dark
  );

}


/* =========================
   BACKUP
========================= */

function backupTasks() {

  if (tasks.length === 0) {

    alert(
      "There are no tasks to backup."
    );

    return;

  }


  const backup = {

    app:
      "My 30-Day Planner",

    created:
      new Date().toISOString(),

    tasks:
      tasks,

    dailyGoal:
      dailyGoal

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "my-30-day-planner-backup.json";


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  URL.revokeObjectURL(url);


  alert(
    "✅ Backup created successfully!"
  );

}


/* =========================
   RESTORE
========================= */

function restoreTasks(event) {

  const file =
    event.target.files[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function(e) {

      try {

        const backup =
          JSON.parse(
            e.target.result
          );


        if (
          !backup.tasks ||
          !Array.isArray(
            backup.tasks
          )
        ) {

          alert(
            "❌ Invalid backup file!"
          );

          return;

        }


        if (
          !confirm(
            "Restore this backup?\n\n" +
            "Current tasks will be replaced."
          )
        ) {

          return;

        }


        tasks =
          backup.tasks;


        if (backup.dailyGoal) {

          dailyGoal =
            Number(
              backup.dailyGoal
            );


          localStorage.setItem(
            "dailyGoal",
            dailyGoal
          );

        }


        saveData();

        render();


        alert(
          "✅ Backup restored successfully!"
        );

      }

      catch (error) {

        alert(
          "❌ Could not read backup file."
        );

      }

    };


  reader.readAsText(file);

}


/* =========================
   CLEAR ALL
========================= */

function clearAllTasks() {

  if (tasks.length === 0) {

    alert(
      "There are no tasks."
    );

    return;

  }


  if (
    !confirm(
      "⚠️ Delete ALL tasks?\n\n" +
      "This cannot be undone unless you have a backup."
    )
  ) {

    return;

  }


  tasks = [];


  saveData();

  render();


  alert(
    "🗑️ All tasks deleted."
  );

}


/* =========================
   HTML SECURITY
========================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");


  div.textContent = text;


  return div.innerHTML;

}


/* =========================
   MAIN RENDER
========================= */

function render() {

  renderTasks();

  updateStats();

  updateGoal();

  updateDays();

  updateStreak();

}


/* =========================
   DARK MODE LOAD
========================= */

if (
  localStorage.getItem(
    "darkMode"
  ) === "true"
) {

  document.body.classList.add("dark");

}


/* =========================
   INITIAL LOAD
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const goal =
      document.getElementById(
        "dailyGoal"
      );


    if (goal) {

      goal.value =
        dailyGoal;

    }


    render();

  }
);


/* =========================
   SERVICE WORKER
========================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    function() {

      navigator.serviceWorker
        .register(
          "./service-worker.js"
        )
        .then(
          () => console.log(
            "✅ Offline mode ready"
          )
        )
        .catch(
          error => console.log(
            "Service Worker Error:",
            error
          )
        );

    }
  );

}
