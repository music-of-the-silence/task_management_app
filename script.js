document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskNameInput = document.getElementById("task-name");
  const categorySelect = document.getElementById("category-select");
  const priorityRadios = document.querySelectorAll('input[name="priority"]');
  const addEditTaskBtn = document.getElementById("add-edit-task-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const taskList = document.getElementById("task-list");
  const filterCategorySelect = document.getElementById("filter-category");
  const filterPrioritySelect = document.getElementById("filter-priority");

  let tasks = [];
  let editingTaskId = null; // To keep track of the task being edited

  // --- Helper Functions ---

  // Function to generate a unique ID
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Load tasks from localStorage
  function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
      renderTasks();
    }
  }

  // Render tasks to the DOM
  function renderTasks() {
    taskList.innerHTML = ""; // Clear existing tasks

    // Apply filters
    let filteredTasks = [...tasks]; // Create a copy to avoid modifying the original array

    const selectedCategory = filterCategorySelect.value;
    const selectedPriority = filterPrioritySelect.value;

    if (selectedCategory !== "All") {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === selectedCategory
      );
    }

    if (selectedPriority !== "All") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === selectedPriority
      );
    }

    // Sort by priority (High > Medium > Low)
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    filteredTasks.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    if (filteredTasks.length === 0) {
      const noTasksMessage = document.createElement("li");
      noTasksMessage.textContent = "No tasks to display.";
      taskList.appendChild(noTasksMessage);
      return;
    }

    filteredTasks.forEach((task) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
                <div class="task-details">
                    <span>${task.name}</span>
                    <small>Category: ${task.category} | Priority: ${task.priority}</small>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}">Edit</button>
                    <button class="delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
      taskList.appendChild(listItem);
    });
  }

  // --- Event Handlers ---

  // Handle form submission (Add/Edit Task)
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskName = taskNameInput.value.trim();
    const category = categorySelect.value;
    const priority = Array.from(priorityRadios).find(
      (radio) => radio.checked
    )?.value;

    if (!taskName || !priority) {
      alert("Please enter a task name and select a priority.");
      return;
    }

    if (editingTaskId) {
      // Edit existing task
      const taskIndex = tasks.findIndex((task) => task.id === editingTaskId);
      if (taskIndex > -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          name: taskName,
          category,
          priority,
        };
      }
      editingTaskId = null;
      addEditTaskBtn.textContent = "Add Task";
      cancelEditBtn.style.display = "none";
    } else {
      // Add new task
      const newTask = {
        id: generateUniqueId(),
        name: taskName,
        category: category,
        priority: priority,
      };
      tasks.push(newTask);
    }

    taskNameInput.value = ""; // Clear input
    categorySelect.value = "Personal"; // Reset category
    document.getElementById("priority-low").checked = true; // Reset priority
    saveTasks();
    renderTasks();
  });

  // Handle Edit and Delete buttons on the task list
  taskList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const taskIdToDelete = e.target.dataset.id;
      tasks = tasks.filter((task) => task.id !== taskIdToDelete);
      saveTasks();
      renderTasks();
    }

    if (e.target.classList.contains("edit-btn")) {
      const taskIdToEdit = e.target.dataset.id;
      const taskToEdit = tasks.find((task) => task.id === taskIdToEdit);

      if (taskToEdit) {
        taskNameInput.value = taskToEdit.name;
        categorySelect.value = taskToEdit.category;
        document.querySelector(
          `input[name="priority"][value="${taskToEdit.priority}"]`
        ).checked = true;

        editingTaskId = taskToEdit.id;
        addEditTaskBtn.textContent = "Save Changes";
        cancelEditBtn.style.display = "inline-block";
      }
    }
  });

  // Cancel Edit functionality
  cancelEditBtn.addEventListener("click", () => {
    editingTaskId = null;
    taskNameInput.value = "";
    categorySelect.value = "Personal";
    document.getElementById("priority-low").checked = true;
    addEditTaskBtn.textContent = "Add Task";
    cancelEditBtn.style.display = "none";
  });

  // Handle filter changes
  filterCategorySelect.addEventListener("change", renderTasks);
  filterPrioritySelect.addEventListener("change", renderTasks);

  // Initial load of tasks when the page loads
  loadTasks();
});
