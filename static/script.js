document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let selectedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    // Initial load of tasks for current date
    updateSelectedDateDisplay();
    loadTasks();
    updateTaskIndicators();
    
    // Day click event (flip calendar)
    document.querySelectorAll('.day-front').forEach(day => {
        day.addEventListener('click', function() {
            const container = this.closest('.day-flip-container');
            container.classList.add('flipped');
            
            // Update selected date and load tasks
            selectedDate = container.dataset.date;
            updateSelectedDateDisplay();
            loadTasks();
            
            // Load notes
            const notesArea = container.querySelector('.notes-area');
            fetch(`/notes/${selectedDate}`)
                .then(response => response.json())
                .then(data => {
                    notesArea.value = data.text;
                });
        });
    });
    
    // Save notes button
    document.querySelectorAll('.save-notes-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.day-flip-container');
            const date = container.dataset.date;
            const notesText = container.querySelector('.notes-area').value;
            
            fetch(`/notes/${date}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: notesText }),
            })
            .then(() => {
                // Flip back to front
                container.classList.remove('flipped');
            });
        });
    });
    
    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', function() {
        document.getElementById('task-form').classList.remove('hidden');
    });
    
    // Cancel task button
    document.getElementById('cancel-task').addEventListener('click', function() {
        document.getElementById('task-form').classList.add('hidden');
        document.getElementById('new-task').value = '';
    });
    
    // Save task button
    document.getElementById('save-task').addEventListener('click', function() {
        const taskText = document.getElementById('new-task').value;
        const taskDays = [document.getElementById('task-days').value];
        
        if (taskText.trim() === '') return;
        
        fetch(`/tasks/${selectedDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: taskText, days: taskDays }),
        })
        .then(response => response.json())
        .then(task => {
            addTaskToList(task);
            document.getElementById('task-form').classList.add('hidden');
            document.getElementById('new-task').value = '';
            updateTaskIndicators();
        });
    });
    
    // Function to load tasks for selected date
    function loadTasks() {
        fetch(`/tasks/${selectedDate}`)
            .then(response => response.json())
            .then(tasks => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = '';
                
                tasks.forEach(task => {
                    addTaskToList(task);
                });
            });
    }
    
    // Function to add task to list
    function addTaskToList(task) {
        const taskList = document.getElementById('task-list');
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'task-complete';
        completeBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        completeBtn.addEventListener('click', function() {
            toggleTaskStatus(task.id, 'completed');
        });
        
        const crossBtn = document.createElement('button');
        crossBtn.className = 'task-cross';
        crossBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
        crossBtn.addEventListener('click', function() {
            toggleTaskStatus(task.id, 'crossed');
        });
        
        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        if (task.completed) taskText.classList.add('completed');
        if (task.crossed) taskText.classList.add('crossed');
        taskText.textContent = task.text;
        
        const taskDays = document.createElement('div');
        taskDays.className = 'task-days';
        taskDays.textContent = task.days.includes('all') ? 'All days' :
                               task.days.includes('weekday') ? 'Weekdays' :
                               task.days.includes('weekend') ? 'Weekends' : '';
        
        actions.appendChild(completeBtn);
        actions.appendChild(crossBtn);
        li.appendChild(actions);
        li.appendChild(taskText);
        li.appendChild(taskDays);
        taskList.appendChild(li);
    }
    
    // Function to toggle task status (complete/cross)
    function toggleTaskStatus(taskId, status) {
        const update = {};
        if (status === 'completed') {
            update.completed = true;
            update.crossed = false;
        } else if (status === 'crossed') {
            update.completed = false;
            update.crossed = true;
        }
        
        fetch(`/tasks/${selectedDate}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
        })
        .then(response => response.json())
        .then(updatedTask => {
            const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
            const taskText = taskItem.querySelector('.task-text');
            
            taskText.classList.remove('completed', 'crossed');
            if (updatedTask.completed) taskText.classList.add('completed');
            if (updatedTask.crossed) taskText.classList.add('crossed');
        });
    }
    
    // Function to update selected date display
    function updateSelectedDateDisplay() {
        const [year, month, day] = selectedDate.split('-');
        const date = new Date(year, month - 1, day);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('selected-date').textContent = date.toLocaleDateString(undefined, options);
    }
    
    // Function to update task indicators on calendar
    function updateTaskIndicators() {
        fetch('/tasks/' + selectedDate)
            .then(response => response.json())
            .then(tasks => {
                if (tasks.length > 0) {
                    const indicator = document.querySelector(`.day-flip-container[data-date="${selectedDate}"] .task-indicator`);
                    if (indicator) {
                        indicator.innerHTML = `<i class="fas fa-clipboard-list" style="color: var(--primary-color)"></i>`;
                    }
                }
            });
    }
    
    // Close flipped cards when clicking elsewhere
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.day-flip-container') && 
            !event.target.closest('.save-notes-btn')) {
            document.querySelectorAll('.day-flip-container.flipped').forEach(container => {
                container.classList.remove('flipped');
            });
        }
    });
});
