// 存储激励语句
const motivationalMessages = [
    "太棒了！继续保持！",
    "坚持就是胜利！",
    "今天的努力是明天的收获！",
    "做得好！再接再厉！",
    "一步一个脚印，你正在变得更好！"
];

// 检查浏览器是否支持 localStorage
if (typeof Storage === "undefined") {
    alert('您的浏览器不支持本地存储，部分功能可能无法使用');
}

// 安全的存储操作函数
function saveTasksToStorage(tasksToSave) {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasksToSave));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('存储空间已满，请清理一些旧记录');
        } else {
            alert('保存失败，请稍后重试');
        }
        return false;
    }
}

// 数据验证函数
function validateTask(task) {
    return task 
        && typeof task.name === 'string'
        && task.name.length > 0
        && /^\d{2}:\d{2}$/.test(task.startTime)
        && /^\d{2}:\d{2}$/.test(task.endTime)
        && /^\d{4}-\d{2}-\d{2}$/.test(task.date);
}

// 清理过期数据（30天前的数据）
function cleanupOldTasks() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate < thirtyDaysAgo;
    });
    
    if (oldTasks.length > 0) {
        // 创建详细的确认信息
        const oldestDate = new Date(Math.min(...oldTasks.map(t => new Date(t.date)))).toLocaleDateString();
        const newestDate = new Date(Math.max(...oldTasks.map(t => new Date(t.date)))).toLocaleDateString();
        
        const confirmMessage = `确认清理以下记录？\n\n` +
            `- 总共 ${oldTasks.length} 条记录\n` +
            `- 时间范围：${oldestDate} 至 ${newestDate}\n\n` +
            `这些记录删除后将无法恢复，建议在清理前先导出备份。`;
        
        if (confirm(confirmMessage)) {
            // 在删除前提供导出选项
            if (confirm('是否要在删除前导出这些记录？')) {
                exportTasks();
            }
            
            tasks = tasks.filter(task => {
                const taskDate = new Date(task.date);
                return taskDate >= thirtyDaysAgo;
            });
            
            if (saveTasksToStorage(tasks)) {
                alert('清理完成！');
                renderCalendar();
            }
        }
    } else {
        alert('没有需要清理的记录');
    }
}

// 数据导出功能（图片格式）
function exportTasks() {
    // 创建临时canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas大小
    canvas.width = 800;
    canvas.height = Math.max(400, tasks.length * 40 + 100); // 根据任务数量调整高度
    
    // 设置背景色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('打卡记录', canvas.width / 2, 40);
    
    // 设置表格标题
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666666';
    const headers = ['日期', '任务名称', '开始时间', '结束时间', '是否补卡'];
    const columnWidth = canvas.width / headers.length;
    headers.forEach((header, index) => {
        ctx.fillText(header, 20 + columnWidth * index, 80);
    });
    
    // 绘制分隔线
    ctx.beginPath();
    ctx.moveTo(20, 90);
    ctx.lineTo(canvas.width - 20, 90);
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    
    // 按日期排序任务
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 绘制任务数据
    ctx.font = '14px Arial';
    sortedTasks.forEach((task, index) => {
        const y = 120 + index * 30;
        ctx.fillText(task.date, 20, y);
        ctx.fillText(task.name, 20 + columnWidth, y);
        ctx.fillText(task.startTime, 20 + columnWidth * 2, y);
        ctx.fillText(task.endTime, 20 + columnWidth * 3, y);
        ctx.fillText(task.isMakeup ? '是' : '否', 20 + columnWidth * 4, y);
    });
    
    // 转换为图片并下载
    try {
        // 尝试使用 showSaveFilePicker API（新版浏览器）
        canvas.toBlob(async (blob) => {
            try {
                if (window.showSaveFilePicker) {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: `打卡记录_${new Date().toLocaleDateString()}.png`,
                        types: [{
                            description: 'PNG图片',
                            accept: {'image/png': ['.png']},
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } else {
                    // 降级方案：直接下载
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `打卡记录_${new Date().toLocaleDateString()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            } catch (e) {
                console.error('保存图片失败:', e);
                alert('保存图片失败，请重试');
            }
        }, 'image/png');
    } catch (e) {
        console.error('创建图片失败:', e);
        alert('创建图片失败，请重试');
    }
}

// 添加导出和清理按钮到页面
function addUtilityButtons() {
    const container = document.querySelector('.container');
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'utility-buttons';
    buttonDiv.style.marginTop = '20px';
    buttonDiv.style.textAlign = 'center';
    
    const exportButton = document.createElement('button');
    exportButton.textContent = '导出记录';
    exportButton.onclick = exportTasks;
    exportButton.style.marginRight = '10px';
    
    const cleanupButton = document.createElement('button');
    cleanupButton.textContent = '清理旧记录';
    cleanupButton.onclick = cleanupOldTasks;
    
    buttonDiv.appendChild(exportButton);
    buttonDiv.appendChild(cleanupButton);
    container.appendChild(buttonDiv);
}

// 初始化数据
let tasks = [];
try {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
} catch (e) {
    console.error('加载存储数据失败:', e);
    tasks = [];
}

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
    if (pendingTask && validateTask(pendingTask)) {
        tasks.push(pendingTask);
        if (saveTasksToStorage(tasks)) {
            pendingTask = null;
            showMotivationPopup();
            renderCalendar();
        }
        closeConfirmPopup();
    } else {
        alert('任务数据无效，请重试');
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
    
    // 只在过去7天内显示补卡按钮，当天不显示
    const isWithinWeek = diffDays > 0 && diffDays <= 7;
    
    let html = '<h3>任务详情</h3>';
    
    // 只在历史日期且一周内显示补卡按钮
    if (isWithinWeek) {
        html += `<div class="makeup-btn-container"><button class="makeup-btn" onclick="showMakeupForm('${date}')">补卡</button></div>`;
    }
    
    // 显示现有任务
    dayTasks.forEach(task => {
        html += `
            <div class="task-detail-item">
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-time">${task.startTime} - ${task.endTime}</div>
                </div>
                <button class="delete-btn" onclick="deleteTask('${task.id}', '${date}')">删除</button>
            </div>
        `;
    });
    
    // 添加关闭按钮
    html += `<button class="close-btn" onclick="closeTaskDetailPopup()">关闭</button>`;
    
    details.innerHTML = html || '<p>暂无任务</p>';
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
    
    if (validateTask(newTask)) {
        tasks.push(newTask);
        if (saveTasksToStorage(tasks)) {
            closeMakeupPopup();
            showTaskDetails(date, tasks.filter(task => task.date === date));
            renderCalendar();
        }
    } else {
        alert('任务数据无效，请重试');
    }
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
    const currentMonth = currentDisplayMonth.getMonth();
    const currentYear = currentDisplayMonth.getFullYear();
    
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
        tasks = tasks.filter(task => task.id !== parseInt(taskId));
        if (saveTasksToStorage(tasks)) {
            showTaskDetails(date, tasks.filter(task => task.date === date));
            renderCalendar();
        }
    }
} 

// 在页面加载完成后添加工具按钮
document.addEventListener('DOMContentLoaded', function() {
    addUtilityButtons();
    renderCalendar();
}); 

