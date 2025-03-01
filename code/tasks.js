const tasks = [
    {
      id: 1,
      title: "Analysis II",
      dueDate: "2025-03-03",
      weekOffset: 0,        // 0 for current week, -1 for last week, +1 for next week, etc.
      link: "https://example.com/upload",
      description: "Complete exercises 1-5",
      status: "not_done",   // or "done", "done_not_submitted"
    },
    {
      id: 2,
      title: "Math Problem Set 2",
      dueDate: "2025-03-17",
      weekOffset: 1,
      link: "https://example.com/upload",
      description: "Integration tasks",
      status: "not_done",
    },
    // ... more tasks
  ];
  

  function renderTimetable(tasks) {
    // We'll track tasks by week offset in an object
    const tasksByWeek = {
      "-1": [],
      "0": [],
      "1": [],
      "2": [],
      "3": []
    };
  
    // Group tasks by their weekOffset
    tasks.forEach(task => {
      if (tasksByWeek.hasOwnProperty(task.weekOffset)) {
        tasksByWeek[task.weekOffset].push(task);
      }
    });
  
    // Create the row for each week. If you prefer multiple rows, you can do so.
    // For simplicity, let's create a single row with 5 columns, 
    // each column containing a list of tasks for that week.
    const row = document.createElement("tr");
  
    // The order of columns: -1, 0, 1, 2, 3
    const offsets = [-1, 0, 1, 2, 3];
    offsets.forEach(offset => {
      const cell = document.createElement("td");
      // For each task in tasksByWeek[offset], create a clickable item
      tasksByWeek[offset].forEach(task => {
        // Create an element to represent the task
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task-item");
        
        // Add status color
        // e.g. "not_done" => red, "done" => green, "done_not_submitted" => orange
        if (task.status === "done") {
          taskDiv.classList.add("task-done");
        } else if (task.status === "done_not_submitted") {
          taskDiv.classList.add("task-done-not-submitted");
        } else {
          taskDiv.classList.add("task-not-done");
        }
        
        // The clickable text
        taskDiv.textContent = task.title;
        
        // Add event listener to open popup
        taskDiv.addEventListener("click", () => {
          openTaskPopup(task);
        });
  
        // Create a small dropdown arrow for label changes
        const arrow = document.createElement("span");
        arrow.classList.add("dropdown-arrow");
        arrow.innerHTML = "&#x25BC;"; // Downward triangle
        arrow.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent the click from opening the popup
          openLabelMenu(task, taskDiv, e.clientX, e.clientY);
        });
  
        // Put arrow and text in the same container
        taskDiv.appendChild(arrow);
        cell.appendChild(taskDiv);
      });
      row.appendChild(cell);
    });
  
    // Clear old content and append the new row
    const tbody = document.getElementById("task-table-body");
    tbody.innerHTML = "";
    tbody.appendChild(row);
  }
  
  // Function to open the popup
  function openTaskPopup(task) {
    const popup = document.getElementById("task-info-popup");
    document.getElementById("popup-title").textContent = task.title;
    document.getElementById("popup-due-date").textContent = task.dueDate;
    document.getElementById("popup-description").textContent = task.description;
    document.getElementById("popup-link").href = task.link;
    
    popup.classList.remove("hidden");
  }
  
  // Function to open label menu (small floating div)
  function openLabelMenu(task, taskDiv, x, y) {
    // Implementation: create or show a small menu with "Done", "Not Done", etc.
    // On click of an option, update the task.status and re-render or update the CSS class.
    console.log("Open label menu at", x, y);
  }
  
  let labelMenuDiv = null;

function openLabelMenu(task, taskDiv, x, y) {
  // If labelMenuDiv doesn't exist yet, create it
  if (!labelMenuDiv) {
    labelMenuDiv = document.createElement("div");
    labelMenuDiv.classList.add("label-menu");
    document.body.appendChild(labelMenuDiv);
  }
  
  // Position the menu near the click
  labelMenuDiv.style.left = x + "px";
  labelMenuDiv.style.top = y + "px";
  
  // Fill with options
  labelMenuDiv.innerHTML = `
    <div data-status="done">Done (Green)</div>
    <div data-status="done_not_submitted">Done but not submitted (Orange)</div>
    <div data-status="not_done">Not Done (Red)</div>
  `;
  
  // Show it
  labelMenuDiv.classList.add("show");
  
  // Add click handlers
  labelMenuDiv.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", () => {
      task.status = option.getAttribute("data-status");
      labelMenuDiv.classList.remove("show");
      // Re-render or update the taskDiv’s classes:
      updateTaskClass(task, taskDiv);
    });
  });
}

function updateTaskClass(task, taskDiv) {
  // Remove old classes
  taskDiv.classList.remove("task-not-done", "task-done", "task-done-not-submitted");
  
  // Add new class
  if (task.status === "done") {
    taskDiv.classList.add("task-done");
  } else if (task.status === "done_not_submitted") {
    taskDiv.classList.add("task-done-not-submitted");
  } else {
    taskDiv.classList.add("task-not-done");
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById("popup-close-btn");
  const popup = document.getElementById("task-info-popup");
  renderTimetable(tasks);

  closeBtn.addEventListener("click", function() {
    popup.classList.add("hidden");
  });
});
