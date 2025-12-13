
function getSitesFromStorage() {
    const sitesStr = localStorage.getItem('common_sites');
    const defaultSites = [
        { name: '百度', link: 'https://www.baidu.com', icon: 'search' },
        { name: '淘宝', link: 'https://www.taobao.com', icon: 'shopping-cart' },
        { name: '京东', link: 'https://www.jd.com', icon: 'box' },
        { name: '知乎', link: 'https://www.zhihu.com', icon: 'comment-dots' },
        { name: '哔哩哔哩', link: 'https://www.bilibili.com', icon: 'video' },
        { name: 'QQ邮箱', link: 'https://mail.qq.com', icon: 'envelope' },
        { name: '百度地图', link: 'https://map.baidu.com', icon: 'map-marker-alt' },
        { name: '网易', link: 'https://www.163.com', icon: 'newspaper' }
    ];
    return sitesStr ? JSON.parse(sitesStr) : defaultSites;
}

function saveSitesToStorage(sites) {
    localStorage.setItem('common_sites', JSON.stringify(sites));
}

let dragSrcIndex = -1; // 拖拽源项的索引

// 初始化拖拽事件（给每个网址项绑定拖拽相关事件）
function initDragEvents() {
    const siteItems = document.querySelectorAll('.site-item');
    siteItems.forEach((item, index) => {
        // 标记拖拽项的索引
        item.dataset.index = index;
        // 设置可拖拽
        item.draggable = true;

        // 1. 开始拖拽
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            // 添加拖拽样式（可选）
            item.style.opacity = '0.5';
            item.style.transform = 'scale(1.05)';
        });

        // 2. 拖拽结束（重置样式）
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            item.style.transform = 'none';
            // 移除所有拖拽悬停样式
            document.querySelectorAll('.site-item').forEach(i => {
                i.classList.remove('drag-over');
            });
        });

        // 3. 拖拽经过（阻止默认行为，否则drop不触发）
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            // 添加悬停高亮样式
            if (e.target.closest('.site-item') !== item) return;
            item.classList.add('drag-over');
        });

        // 4. 拖拽离开（移除高亮）
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        // 5. 放下（核心：重新排序）
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropTargetIndex = parseInt(item.dataset.index);
            // 如果拖拽源和目标是同一个，不处理
            if (dragSrcIndex === dropTargetIndex) return;

            // 读取当前数据
            let sites = getSitesFromStorage();
            // 移除源项并插入到目标位置
            const draggedItem = sites.splice(dragSrcIndex, 1)[0];
            sites.splice(dropTargetIndex, 0, draggedItem);
            // 保存新顺序并重新渲染
            saveSitesToStorage(sites);
            renderSitesList();
            // 重置样式
            item.classList.remove('drag-over');
        });
    });
}

function renderSitesList() {
    const sites = getSitesFromStorage();
    const sitesList = document.getElementById('sitesList');
    sitesList.innerHTML = '';

    sites.forEach((site, index) => {
        const newSite = document.createElement('div');
        newSite.className = 'site-item';
        newSite.dataset.link = site.link;
        newSite.dataset.index = index; // 标记索引
        newSite.draggable = true; // 开启拖拽
        newSite.innerHTML = `
                    <span class="site-delete"><i class="fas fa-times"></i></span>
                    <div class="site-icon">
                        <i class="fas fa-${site.icon}"></i>
                    </div>
                    <div class="site-name">${site.name}</div>
                `;

        // 删除事件（保留）
        newSite.querySelector('.site-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSite(site.link);
        });

        // 跳转事件（保留）
        newSite.addEventListener('click', () => {
            window.open(site.link, '_blank');
        });

        sitesList.appendChild(newSite);
    });

    // 渲染后初始化拖拽事件
    initDragEvents();
    checkEmptyState();
}

function addSiteToStorage(name, link) {
    const sites = getSitesFromStorage();
    const iconPool = ['search', 'shopping-cart', 'box', 'comment-dots', 'video', 'envelope', 'map-marker-alt', 'newspaper', 'globe', 'link'];
    const randomIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
    const isDuplicate = sites.some(s => s.link === link);
    if (isDuplicate) {
        alert('该网址已添加过！');
        return false;
    }
    sites.push({ name, link, icon: randomIcon });
    saveSitesToStorage(sites);
    return true;
}

function deleteSite(link) {
    let sites = getSitesFromStorage();
    sites = sites.filter(s => s.link !== link);
    saveSitesToStorage(sites);
    renderSitesList();
}

function checkEmptyState() {
    const sites = getSitesFromStorage();
    const sitesList = document.getElementById('sitesList');
    const sitesEmpty = document.getElementById('sitesEmpty');
    if (sites.length === 0) {
        sitesList.style.display = 'none';
        sitesEmpty.style.display = 'block';
    } else {
        sitesList.style.display = 'grid';
        sitesEmpty.style.display = 'none';
    }
}

let currentEngine = 'sogou';
const engineConfig = {
    baidu: 'https://www.baidu.com/s?wd={keyword}',
    google: 'https://www.google.com/search?q={keyword}',
    yandex: 'https://yandex.com/search/?text={keyword}',
    bing: 'https://cn.bing.com/search?q={keyword}',
    360: 'https://www.so.com/s?q={keyword}',
    sogou: 'https://www.sogou.com/web?query={keyword}',
    weixin: 'https://weixin.sogou.com/weixin?type=2&query={keyword}',
    zhihu: 'https://www.zhihu.com/search?q={keyword}',
    xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword={keyword}',
    bilibili: 'https://search.bilibili.com/all?keyword={keyword}'
};

const engineItems = document.querySelectorAll('.engine-item');
engineItems.forEach(item => {
    item.addEventListener('click', () => {
        engineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentEngine = item.dataset.engine;
    });
});

function doSearch() {
    const rawKeyword = document.getElementById('search-input').value.trim();
    if (!rawKeyword) {
        const input = document.getElementById('search-input');
        input.style.animation = 'shake 0.3s ease';
        setTimeout(() => input.style.animation = '', 300);
        return;
    }
    const keyword = encodeURIComponent(rawKeyword);
    const searchUrl = engineConfig[currentEngine].replace('{keyword}', keyword);
    window.open(searchUrl, '_blank');
}

document.getElementById('search-btn').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

window.onload = function () {
    // 初始渲染列表
    renderSitesList();

    const addSiteBtn = document.querySelector('.add-site-btn');
    const siteModal = document.getElementById('siteModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    const siteNameInput = document.getElementById('siteName');
    const siteLinkInput = document.getElementById('siteLink');

    addSiteBtn.addEventListener('click', () => {
        siteModal.classList.add('show');
        siteNameInput.value = '';
        siteLinkInput.value = '';
    });

    function closeModal() {
        siteModal.classList.remove('show');
    }
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    siteModal.addEventListener('click', (e) => {
        if (e.target === siteModal) closeModal();
    });

    modalConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        const name = siteNameInput.value.trim();
        const link = siteLinkInput.value.trim();

        if (!name || !link) {
            alert('请填写完整的网站名称和链接！');
            return;
        }

        const isSuccess = addSiteToStorage(name, link);
        if (isSuccess) {
            renderSitesList(); // 重新渲染（包含拖拽初始化）
            closeModal();
        }
    });
};
