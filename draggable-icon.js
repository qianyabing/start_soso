// JavaScript 逻辑：拖拽 + 列表交互

// ========== 1. 可拖拽图标逻辑 ==========
const draggableIcon = document.getElementById('draggableIcon');
let isDragging = false;  // 是否处于拖拽状态
let startX, startY;      // 鼠标按下时的初始坐标
let initialX, initialY;  // 图标初始的 left/top

// 鼠标按下：开始拖拽
draggableIcon.addEventListener('mousedown', (e) => {
    isDragging = true;
    // 计算鼠标在图标内的相对位置（用于拖拽时“跟手”）
    const rect = draggableIcon.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    e.preventDefault(); // 防止拖拽时选中文字
});

// 鼠标移动：更新图标位置，同时更新列表位置
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return; // 非拖拽状态不执行

    // 计算图标新位置
    const x = e.clientX - startX;
    const y = e.clientY - startY;
    draggableIcon.style.left = `${x}px`;
    draggableIcon.style.top = `${y}px`;

    // 列表始终跟随图标下方（left 与图标一致，top 为图标底部）
    const siteList = document.getElementById('siteList');
    siteList.style.left = `${x}px`;
    siteList.style.top = `${y + draggableIcon.offsetHeight +2}px`;
});

// 鼠标松开：结束拖拽
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// ========== 2. 列表展开/收起 + 跳转逻辑 ==========
const siteList = document.getElementById('siteList');

// 点击图标：切换列表显示/隐藏
draggableIcon.addEventListener('click', (e) => {
    // 若列表已展开，点击图标则关闭；否则展开
    siteList.classList.toggle('show');
    e.stopPropagation(); // 阻止事件冒泡到 document（避免触发“点击外部关闭”）
});

// 点击列表项：关闭列表 + 跳转页面
siteList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止 a 标签默认跳转（避免页面闪烁）
        siteList.classList.remove('show'); // 关闭列表
        window.location.href = link.href;   // 手动跳转到目标页面
    });
});

// 点击页面其他区域：关闭列表（增强体验）
document.addEventListener('click', (e) => {
    if (!draggableIcon.contains(e.target) && !siteList.contains(e.target)) {
        siteList.classList.remove('show');
    }
});