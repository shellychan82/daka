// 存储激励语句
const motivationalMessages = [
    "太棒了！继续保持！",
    "坚持就是胜利！",
    "今天的努力是明天的收获！",
    "做得好！再接再厉！",
    "一步一个脚印，你正在变得更好！"
];

// 初始化数据
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let pendingTask = null;

// 快速打卡按钮点击处理
document.querySelectorAll('.quick-action').forEach(button => {
    button.addEventListener('click', function() {
        const taskName = this.dataset.task;
        const duration = document.querySelector('input[name="duration"]:checked')?.value;
        
        if (!duration) {
            alert('请选择时长');
            return;
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + duration * 60000);
        
        pendingTask = {
            id: Date.now(),
            name: taskName,
            startTime: now.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            date: now.toISOString().split('T')[0],
            completed: false
        };

        showConfirmPopup(taskName, duration);
    });
});

// 显示确认弹窗
function showConfirmPopup(taskName, duration) {
    const popup = document.getElementById('confirm-popup');
    const message = document.getElementById('confirm-message');
    message.textContent = `确认创建 ${taskName} 任务，时长 ${duration} 分钟？`;
    popup.classList.remove('hidden');
}

// 确认创建任务
function confirmTask() {
    if (pendingTask) {
        tasks.push(pendingTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        pendingTask = null;
        showMotivationPopup();
        renderCalendar();
        closeConfirmPopup();
    }
}

// 关闭确认弹窗
function closeConfirmPopup() {
    document.getElementById('confirm-popup').classList.add('hidden');
    pendingTask = null;
}

// 显示任务详情
function showTaskDetails(date, dayTasks) {
    const popup = document.getElementById('task-detail-popup');
    const details = document.getElementById('task-details');
    const today = new Date();
    const selectedDate = new Date(date);
    const diffDays = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
    
    // 检查是否是历史日期且在一周内
    const isWithinWeek = diffDays > 0 && diffDays <= 7;  // 修改这里，确保是过去的日期
    
    let html = '';
    
    // 只在历史日期且一周内显示补卡按钮
    if (isWithinWeek) {
        html += `
            <div class="makeup-section">
                <button class="makeup-btn" onclick="showMakeupForm('${date}')">补卡</button>
            </div>
        `;
    }
    
    // 显示现有任务
    html += dayTasks.map(task => `
        <div class="task-detail-item ${task.isMakeup ? 'makeup' : ''}">
            <div class="task-detail-content">
                <h4>${task.name}</h4>
                <div class="task-detail-time">
                    ${task.startTime || '未设置'} - ${task.endTime || '未设置'}
                </div>
            </div>
            <button class="delete-task" onclick="deleteTask('${task.id}', '${date}')">删除</button>
        </div>
    `).join('');
    
    details.innerHTML = html || '<p>暂无任务</p>';  // 如果没有任务显示提示文字
    popup.classList.remove('hidden');
}

// 显示补卡表单
function showMakeupForm(date) {
    const popup = document.getElementById('makeup-popup');
    document.getElementById('makeup-date').textContent = date;
    popup.classList.remove('hidden');
}

// 处理补卡提交
function submitMakeup() {
    const date = document.getElementById('makeup-date').textContent;
    const taskName = document.getElementById('makeup-task-name').value;
    const startTime = document.getElementById('makeup-start-time').value;
    const endTime = document.getElementById('makeup-end-time').value;
    
    if (!taskName || !startTime || !endTime) {
        alert('请填写完整信息');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name: taskName,
        startTime: startTime,
        endTime: endTime,
        date: date,
        completed: true,
        isMakeup: true
    };
    
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    closeMakeupPopup();
    showTaskDetails(date, tasks.filter(task => task.date === date));
    renderCalendar();
}

// 关闭补卡弹窗
function closeMakeupPopup() {
    document.getElementById('makeup-popup').classList.add('hidden');
    document.getElementById('makeup-task-name').value = '';
    document.getElementById('makeup-start-time').value = '';
    document.getElementById('makeup-end-time').value = '';
}

// 关闭任务详情弹窗
function closeTaskDetailPopup() {
    document.getElementById('task-detail-popup').classList.add('hidden');
}

// 日历渲染
function renderCalendar() {
    const calendar = document.getElementById('calendar-grid');
    calendar.innerHTML = '';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const calendarTitle = document.getElementById('calendar-title');
    calendarTitle.textContent = `${currentYear}年${currentMonth + 1}月`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendar.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayTasks = tasks.filter(task => task.date === dateStr);
        
        if (day === today.getDate() && 
            currentMonth === today.getMonth() && 
            currentYear === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        if (dayTasks.length > 0) {
            dayElement.classList.add('has-task');
            dayElement.addEventListener('click', () => {
                showTaskDetails(dateStr, dayTasks);
            });
        } else {
            dayElement.addEventListener('click', () => {
                showTaskDetails(dateStr, []);
            });
        }
        
        dayElement.innerHTML = `${day}`;
        calendar.appendChild(dayElement);
    }
    
    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) {
        for (let i = lastDayOfWeek + 1; i <= 6; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendar.appendChild(emptyDay);
        }
    }
}

// 表单提交处理
document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskName = document.getElementById('task-name').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    pendingTask = {
        id: Date.now(),
        name: taskName,
        startTime: startTime,
        endTime: endTime,
        date: new Date().toISOString().split('T')[0],
        completed: false
    };

    showConfirmPopup(taskName, Math.round((new Date(`2000/01/01 ${endTime}`) - new Date(`2000/01/01 ${startTime}`)) / 60000));
});

// 显示激励弹窗
function showMotivationPopup() {
    const popup = document.getElementById('motivation-popup');
    const message = document.getElementById('motivation-message');
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    message.textContent = randomMessage;
    popup.classList.remove('hidden');
}

// 关闭弹窗
function closePopup() {
    document.getElementById('motivation-popup').classList.add('hidden');
}

// 初始化渲染
renderCalendar(); 

// 添加删除任务功能
function deleteTask(taskId, date) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(task => task.id.toString() !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // 重新显示当天任务
        const dayTasks = tasks.filter(task => task.date === date);
        if (dayTasks.length > 0) {
            showTaskDetails(date, dayTasks);
        } else {
            closeTaskDetailPopup();
        }
        
        renderCalendar();
    }
} 