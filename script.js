// ================= DATA =================

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";
let editingTaskId = null;


// ================= ELEMENTS =================

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("taskModal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

const modalTitle = document.getElementById("modalTitle");


// ================= DATE =================

function showDate() {

    const date = new Date();

    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    };

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("en-US", options);
}

showDate();


// ================= SAVE =================

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


// ================= RENDER =================

function renderTasks() {

    const searchValue = searchInput.value.toLowerCase();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchValue);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {

            const card = document.createElement("div");

            card.className =
                `task-card ${task.completed ? "completed" : ""}`;


            card.innerHTML = `

                <button
                    class="check-btn"
                    onclick="toggleTask(${task.id})"
                ></button>


                <div class="task-info">

                    <div class="task-title">
                        ${escapeHTML(task.title)}
                    </div>

                    <div class="task-meta">

                        <span class="tag">
                            ${task.category}
                        </span>

                        <span class="tag priority-${task.priority.toLowerCase()}">
                            ${task.priority} Priority
                        </span>

                        ${
                            task.date
                            ? `<span class="tag">📅 ${formatDate(task.date)}</span>`
                            : ""
                        }

                    </div>

                </div>


                <div class="task-actions">

                    <button onclick="editTask(${task.id})">
                        ✏️
                    </button>

                    <button onclick="deleteTask(${task.id})">
                        🗑️
                    </button>

                </div>
            `;


            taskList.appendChild(card);
        });
    }


    updateStats();
}


// ================= ADD TASK =================

taskForm.addEventListener("submit", function(e) {

    e.preventDefault();


    const title = taskTitle.value.trim();

    if (!title) return;


    if (editingTaskId !== null) {

        const task = tasks.find(
            task => task.id === editingTaskId
        );

        task.title = title;
        task.category = taskCategory.value;
        task.priority = taskPriority.value;
        task.date = taskDate.value;

        editingTaskId = null;

        modalTitle.textContent = "Add New Task";

    } else {

        const newTask = {

            id: Date.now(),

            title: title,

            category: taskCategory.value,

            priority: taskPriority.value,

            date: taskDate.value,

            completed: false

        };

        tasks.unshift(newTask);
    }


    saveTasks();

    renderTasks();

    taskForm.reset();

    closeTaskModal();
});


// ================= TOGGLE =================

function toggleTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();

    renderTasks();
}


// ================= DELETE =================

function deleteTask(id) {

    const confirmDelete =
        confirm("Delete this task?");

    if (!confirmDelete) return;

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    renderTasks();
}


// ================= EDIT =================

function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;


    editingTaskId = id;

    taskTitle.value = task.title;
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskDate.value = task.date;

    modalTitle.textContent = "Edit Task";

    modal.classList.add("show");

    taskTitle.focus();
}


// ================= FILTER =================

document.querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener("click", function() {

            document
                .querySelectorAll(".nav-item")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            this.classList.add("active");

            currentFilter =
                this.dataset.filter;

            renderTasks();

            document
                .querySelector(".sidebar")
                .classList.remove("open");
        });
    });


// ================= SEARCH =================

searchInput.addEventListener(
    "input",
    renderTasks
);


// ================= MODAL =================

openModal.addEventListener(
    "click",
    () => {

        editingTaskId = null;

        modalTitle.textContent =
            "Add New Task";

        taskForm.reset();

        modal.classList.add("show");

        taskTitle.focus();
    }
);


closeModal.addEventListener(
    "click",
    closeTaskModal
);


modal.addEventListener("click", function(e) {

    if (e.target === modal) {
        closeTaskModal();
    }
});


function closeTaskModal() {

    modal.classList.remove("show");

    taskForm.reset();

    editingTaskId = null;

    modalTitle.textContent =
        "Add New Task";
}


// ================= MOBILE MENU =================

document
    .getElementById("mobileMenu")
    .addEventListener("click", function() {

        document
            .querySelector(".sidebar")
            .classList.toggle("open");
    });


// ================= STATISTICS =================

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending =
        total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;


    const percentage =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);


    progressPercent.textContent =
        `${percentage}%`;

    progressFill.style.width =
        `${percentage}%`;
}


// ================= DATE FORMAT =================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );
}


// ================= SECURITY =================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ================= INITIAL LOAD =================

renderTasks();