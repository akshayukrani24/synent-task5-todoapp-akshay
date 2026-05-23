// load tasks from localStorage or start empty
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
var newTaskId = null; // tracks which task was just added (for animation)

const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const emptyMsg     = document.getElementById('emptyMsg');
const pendingCount = document.getElementById('pendingCount');
const clearBtn     = document.getElementById('clearBtn');
const inputBox     = document.querySelector('.input-box');

render();

// add task
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});

// filter buttons
document.querySelectorAll('.tab').forEach(function(btn) {
  btn.addEventListener('click', function() {
    currentFilter = this.dataset.filter;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    render();
  });
});

// clear completed
clearBtn.addEventListener('click', function() {
  if (clearBtn.disabled) return;
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
});

function addTask() {
  var text = taskInput.value.trim();

  // shake the box if input is empty
  if (!text) {
    inputBox.classList.remove('shake');
    void inputBox.offsetWidth; // force reflow so animation restarts every time
    inputBox.classList.add('shake');
    setTimeout(function() { inputBox.classList.remove('shake'); }, 400);
    taskInput.focus();
    return;
  }

  var id = Date.now();
  newTaskId = id;

  tasks.push({
    id: id,
    text: text,
    completed: false
  });

  taskInput.value = '';
  taskInput.focus();
  save();
  render();

  newTaskId = null;
}

function toggleDone(id) {
  tasks.forEach(function(t) {
    if (t.id === id) t.completed = !t.completed;
  });
  save();
  render();
}

function deleteTask(id, li) {
  // animate out first, then remove
  li.classList.add('removing');
  setTimeout(function() {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }, 220);
}

function render() {
  var visible = tasks.filter(function(t) {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  taskList.innerHTML = '';

  visible.forEach(function(t) {
    var li = document.createElement('li');

    // only animate the task that was just added, not everything on re-render
    var classes = 'task-item';
    if (t.completed) classes += ' done';
    if (t.id === newTaskId) classes += ' is-new';
    li.className = classes;

    var checkBox = document.createElement('div');
    checkBox.className = 'check-box';
    var tick = document.createElement('span');
    tick.className = 'tick';
    tick.textContent = '✓';
    checkBox.appendChild(tick);
    checkBox.addEventListener('click', function() { toggleDone(t.id); });

    var label = document.createElement('span');
    label.className = 'task-label';
    label.textContent = t.text;

    var delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', function() { deleteTask(t.id, li); });

    li.appendChild(checkBox);
    li.appendChild(label);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });

  // update counter
  var pending = tasks.filter(t => !t.completed).length;
  pendingCount.textContent = pending;

  // disable clear button if nothing completed
  var hasCompleted = tasks.some(t => t.completed);
  clearBtn.disabled = !hasCompleted;

  // empty state
  if (visible.length === 0) {
    emptyMsg.classList.add('show');
  } else {
    emptyMsg.classList.remove('show');
  }
}

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
