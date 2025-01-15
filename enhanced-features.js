// 任务模板
const taskTemplates = {
    '运动': {
        defaultDuration: 30,
        suggestedTimes: ['06:00', '18:00'],
        icon: '🏃‍♂️'
    },
    '学习': {
        defaultDuration: 60,
        suggestedTimes: ['09:00', '14:00', '20:00'],
        icon: '📚'
    },
    '阅读': {
        defaultDuration: 30,
        suggestedTimes: ['12:00', '21:00'],
        icon: '📖'
    },
    '打卡': {
        defaultDuration: 15,
        suggestedTimes: ['08:00', '22:00'],
        icon: '✅'
    }
};

// 当前显示的年月
let currentDisplayMonth = new Date();

// 渲染日历
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    // 清空现有内容
    calendarGrid.innerHTML = '';

    // 获取当月第一天和最后一天
    const firstDay = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), 1);
    const lastDay = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth() + 1, 0);

    // 获取当月第一天是星期几（0-6）
    const firstDayOfWeek = firstDay.getDay();

    // 获取上个月的最后几天
    const prevMonthLastDay = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth(), 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // 填充上个月的日期
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevMonthDays - i;
        calendarGrid.appendChild(dayElement);
    }

    // 填充当月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // 检查是否是今天
        const currentDate = new Date();
        if (currentDisplayMonth.getFullYear() === currentDate.getFullYear() &&
            currentDisplayMonth.getMonth() === currentDate.getMonth() &&
            day === currentDate.getDate()) {
            dayElement.classList.add('today');
        }

        // 检查是否有任务
        const dateString = `${currentDisplayMonth.getFullYear()}-${(currentDisplayMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayTasks = tasks.filter(task => task.date === dateString);
        
        if (dayTasks.length > 0) {
            dayElement.classList.add('has-task');
        }

        // 为所有日期添加点击事件
        dayElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showTaskDetails(dateString, dayTasks);
        });

        calendarGrid.appendChild(dayElement);
    }

    // 填充下个月的日期
    const totalDays = firstDayOfWeek + lastDay.getDate();
    const nextMonthDays = Math.ceil(totalDays / 7) * 7 - totalDays;

    for (let day = 1; day <= nextMonthDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    }
}

// 显示任务详情
function showTaskDetails(date, tasks) {
    const popup = document.getElementById('task-detail-popup');
    const details = document.getElementById('task-details');
    
    if (!popup || !details) return;
    
    let html = `
        <h3>任务详情</h3>
        <p>日期：${date}</p>
    `;

    if (tasks.length > 0) {
        html += tasks.map(task => `
            <div class="task-detail-item">
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-time">${task.startTime} - ${task.endTime}</div>
                </div>
                <button onclick="deleteTask('${task.id}')" class="delete-btn">删除</button>
            </div>
        `).join('');
    } else {
        html += '<p>暂无任务</p>';
    }

    html += `<button onclick="closeTaskDetailPopup()" class="btn-primary">关闭</button>`;
    details.innerHTML = html;
    popup.classList.remove('hidden');
}

// 关闭任务详情弹窗
function closeTaskDetailPopup() {
    const popup = document.getElementById('task-detail-popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

// 删除任务
function deleteTask(taskId) {
    if (confirm('确定要删除这条打卡记录吗？')) {
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
        document.getElementById('task-detail-popup').classList.add('hidden');
    }
}

// 显示补卡弹窗
function showMakeupPopup(date) {
    const popup = document.getElementById('makeup-popup');
    const dateSpan = document.getElementById('makeup-date');
    
    if (!popup || !dateSpan) return;
    
    dateSpan.textContent = date;
    document.getElementById('task-detail-popup').classList.add('hidden');
    popup.classList.remove('hidden');
}

// 提交补卡
function submitMakeup() {
    const taskName = document.getElementById('makeup-task-name').value;
    const startTime = document.getElementById('makeup-start-time').value;
    const endTime = document.getElementById('makeup-end-time').value;
    const date = document.getElementById('makeup-date').textContent;
    
    if (!taskName || !startTime || !endTime) {
        alert('请填写完整信息');
        return;
    }
    
    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        date: date,
        startTime: startTime,
        endTime: endTime,
        isMakeup: true
    };
    
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderCalendar();
    closeMakeupPopup();
}

// 关闭补卡弹窗
function closeMakeupPopup() {
    const popup = document.getElementById('makeup-popup');
    if (popup) {
        popup.classList.add('hidden');
        document.getElementById('makeup-task-name').value = '';
        document.getElementById('makeup-start-time').value = '';
        document.getElementById('makeup-end-time').value = '';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

// 切换月份
function changeMonth(delta) {
    // 创建新的Date对象而不是修改现有的
    const newDate = new Date(currentDisplayMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    currentDisplayMonth = newDate;
    renderCalendar();
    updateCalendarTitle();
}

// 更新月份标题
function updateCalendarTitle() {
    const titleElement = document.getElementById('calendar-title');
    if (titleElement) {
        titleElement.textContent = `${currentDisplayMonth.getFullYear()}年${currentDisplayMonth.getMonth() + 1}月`;
    }
}

// 更新月份标题
function updateMonthTitle() {
    const titleElement = document.querySelector('.calendar-nav-title');
    if (titleElement) {
        titleElement.textContent = `${currentDisplayMonth.getFullYear()}年${currentDisplayMonth.getMonth() + 1}月`;
    }
}

// 添加月份导航按钮
function addCalendarNavigation() {
    // 不再添加重复的导航
    return;
}

// 统计数据（增强版）
function calculateStatistics() {
    const stats = {
        total: tasks.length,
        thisMonth: 0,
        thisWeek: 0,
        byType: {},
        streak: 0,
        monthlyStats: {},
        weeklyStats: {}
    };

    const today = new Date();
    let currentStreak = 0;
    let lastDate = null;

    // 按日期排序的任务
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 获取本周的开始日期
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    sortedTasks.forEach(task => {
        const taskDate = new Date(task.date);
        
        // 本月统计
        if (taskDate.getMonth() === today.getMonth() && 
            taskDate.getFullYear() === today.getFullYear()) {
            stats.thisMonth++;
        }
        
        // 本周统计
        if (taskDate >= weekStart && taskDate <= today) {
            stats.thisWeek++;
        }
        
        // 按类型统计
        stats.byType[task.name] = (stats.byType[task.name] || 0) + 1;
        
        // 月度统计
        const monthKey = `${taskDate.getFullYear()}-${(taskDate.getMonth() + 1).toString().padStart(2, '0')}`;
        stats.monthlyStats[monthKey] = (stats.monthlyStats[monthKey] || 0) + 1;
        
        // 周统计
        const weekNumber = getWeekNumber(taskDate);
        const weekKey = `${taskDate.getFullYear()}-W${weekNumber}`;
        stats.weeklyStats[weekKey] = (stats.weeklyStats[weekKey] || 0) + 1;
        
        // 计算连续打卡
        if (!lastDate) {
            currentStreak = 1;
            lastDate = taskDate;
        } else {
            const dayDiff = Math.floor((lastDate - taskDate) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                if (currentStreak > stats.streak) {
                    stats.streak = currentStreak;
                }
                currentStreak = 1;
            }
            lastDate = taskDate;
        }
    });

    if (currentStreak > stats.streak) {
        stats.streak = currentStreak;
    }

    return stats;
}

// 获取周数
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// 渲染统计图表（增强版）
function renderStatistics() {
    const stats = calculateStatistics();
    const statsSection = document.createElement('div');
    statsSection.className = 'statistics-section';
    
    // 基础统计卡片
    statsSection.innerHTML = `
        <h2 class="section-title">数据统计</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">总打卡次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.thisMonth}</div>
                <div class="stat-label">本月打卡</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.thisWeek}</div>
                <div class="stat-label">本周打卡</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.streak}</div>
                <div class="stat-label">最长连续打卡</div>
            </div>
        </div>
    `;
    
    // 添加月度统计详情
    const monthlyDetail = document.createElement('div');
    monthlyDetail.className = 'stats-detail';
    monthlyDetail.innerHTML = `
        <h3>月度统计</h3>
        ${Object.entries(stats.monthlyStats)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 6)
            .map(([month, count]) => `
                <div class="stats-detail-item">
                    <span>${month}月</span>
                    <span>${count}次打卡</span>
                </div>
            `).join('')}
    `;
    statsSection.appendChild(monthlyDetail);
    
    // 添加周统计详情
    const weeklyDetail = document.createElement('div');
    weeklyDetail.className = 'stats-detail';
    weeklyDetail.innerHTML = `
        <h3>周统计</h3>
        ${Object.entries(stats.weeklyStats)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 4)
            .map(([week, count]) => `
                <div class="stats-detail-item">
                    <span>第${week.split('-W')[1]}周</span>
                    <span>${count}次打卡</span>
                </div>
            `).join('')}
    `;
    statsSection.appendChild(weeklyDetail);
    
    // 添加任务类型分布图表
    const chartContainer = document.createElement('div');
    chartContainer.className = 'stats-chart';
    chartContainer.innerHTML = '<canvas id="taskTypeChart"></canvas>';
    statsSection.appendChild(chartContainer);
    
    // 插入统计部分
    const container = document.querySelector('.container');
    container.insertBefore(statsSection, document.querySelector('.utility-buttons'));
    
    // 绘制任务类型分布图表
    const ctx = document.getElementById('taskTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats.byType),
            datasets: [{
                data: Object.values(stats.byType),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: '任务类型分布'
                }
            }
        }
    });
}

// 移动端时间选择器
function initCustomTimePicker() {
    const timeInputs = document.querySelectorAll('input[type="time"]');
    
    if (window.innerWidth <= 768) {
        timeInputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.preventDefault();
                showCustomTimePicker(input);
            });
        });
    }
}

function showCustomTimePicker(input) {
    const currentValue = input.value || '00:00';
    const [hours, minutes] = currentValue.split(':');
    
    const picker = document.createElement('div');
    picker.className = 'custom-time-picker';
    picker.innerHTML = `
        <div class="time-picker-header">
            <span>选择时间</span>
            <button class="time-picker-close" onclick="this.parentElement.parentElement.remove()">完成</button>
        </div>
        <div class="time-picker-wheels">
            <select class="hour-wheel">
                ${Array.from({length: 24}, (_, i) => 
                    `<option value="${i.toString().padStart(2, '0')}" 
                     ${i === parseInt(hours) ? 'selected' : ''}>
                     ${i.toString().padStart(2, '0')}
                     </option>`
                ).join('')}
            </select>
            <span>:</span>
            <select class="minute-wheel">
                ${Array.from({length: 12}, (_, i) => i * 5).map(i => 
                    `<option value="${i.toString().padStart(2, '0')}"
                     ${i === parseInt(minutes) ? 'selected' : ''}>
                     ${i.toString().padStart(2, '0')}
                     </option>`
                ).join('')}
            </select>
        </div>
    `;
    
    document.body.appendChild(picker);
    setTimeout(() => picker.classList.add('active'), 0);
    
    const hourWheel = picker.querySelector('.hour-wheel');
    const minuteWheel = picker.querySelector('.minute-wheel');
    
    function updateInput() {
        input.value = `${hourWheel.value}:${minuteWheel.value}`;
    }
    
    hourWheel.addEventListener('change', updateInput);
    minuteWheel.addEventListener('change', updateInput);
    
    picker.querySelector('.time-picker-close').addEventListener('click', () => {
        picker.classList.remove('active');
        setTimeout(() => picker.remove(), 300);
    });
}

// 自动填充时间建议
function suggestTaskTime(taskName) {
    const template = taskTemplates[taskName];
    if (template) {
        const now = new Date();
        const currentHour = now.getHours();
        
        // 找到最接近的建议时间
        const suggestedTime = template.suggestedTimes.reduce((closest, time) => {
            const [hours] = time.split(':').map(Number);
            const diff = Math.abs(hours - currentHour);
            const closestDiff = Math.abs(parseInt(closest) - currentHour);
            return diff < closestDiff ? time : closest;
        }, template.suggestedTimes[0]);
        
        // 设置表单时间
        document.getElementById('start-time').value = suggestedTime;
        
        // 计算结束时间
        const [hours, minutes] = suggestedTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes + template.defaultDuration);
        document.getElementById('end-time').value = 
            `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    }
}

// 滑动切换相关变量
let startX = 0;
let currentX = 0;
let isDragging = false;
const SWIPE_THRESHOLD = 50; // 触发切换的最小滑动距离

// 初始化滑动事件
function initSwipeEvents() {
    const calendarTitle = document.getElementById('calendar-title');
    if (!calendarTitle) return;

    // 触摸事件
    calendarTitle.addEventListener('touchstart', handleTouchStart);
    calendarTitle.addEventListener('touchmove', handleTouchMove);
    calendarTitle.addEventListener('touchend', handleTouchEnd);

    // 鼠标事件（用于桌面端）
    calendarTitle.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// 触摸事件处理
function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
    currentX = 0;
}

function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - startX;
    currentX = deltaX;
}

function handleTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    handleSwipeEnd();
}

// 鼠标事件处理
function handleMouseDown(e) {
    startX = e.clientX;
    isDragging = true;
    currentX = 0;
}

function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - startX;
    currentX = deltaX;
}

function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    handleSwipeEnd();
}

// 处理滑动结束
function handleSwipeEnd() {
    if (Math.abs(currentX) >= SWIPE_THRESHOLD) {
        if (currentX > 0) {
            // 向右滑动，显示上一个月
            changeMonth(-1);
        } else {
            // 向左滑动，显示下一个月
            changeMonth(1);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initSwipeEvents();
    renderCalendar();
    updateMonthTitle();
});

// 初始化增强功能
function initEnhancedFeatures() {
    // 添加图表库
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(chartScript);

    // 等待图表库加载完成
    chartScript.onload = () => {
        renderStatistics();
    };

    // 添加日历导航
    addCalendarNavigation();

    // 初始化移动端时间选择器
    initCustomTimePicker();

    // 为快速打卡按钮添加图标和自动填充
    document.querySelectorAll('.quick-action').forEach(button => {
        const taskName = button.dataset.task;
        const template = taskTemplates[taskName];
        if (template) {
            button.innerHTML = `${template.icon} ${taskName}`;
            button.addEventListener('click', () => suggestTaskTime(taskName));
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initEnhancedFeatures); 