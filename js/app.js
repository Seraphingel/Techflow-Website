const app = {
            state: {
                view: 'home', // 'home', 'list', 'post'
                activeRoute: 'home', 
                currentSeriesId: null,
                currentModelId: null,
                currentConfigIndex: 0,
                selectedCpu: null,
                selectedGpu: null,
                searchQuery: '',
                isSearchOpen: false,
                isConfigSwitch: false,
                isMobileMenuOpen: false,
                modelSortKey: 'alpha', // 'alpha' or 'year'
                modelSortDir: 'asc',   // 'asc' or 'desc'
                currentPickerSeriesId: null
            },

            init() {
                this.bindEvents();
                this.updateNavUI();
                this.evaluateTheme();
                this.render();
            },

            bindEvents() {
                const searchInput = document.getElementById('globalSearchOverlay');
                searchInput.addEventListener('keydown', (e) => {
                    if(e.key === 'Enter') {
                        this.state.searchQuery = e.target.value.toLowerCase();
                        this.toggleSearch();
                        if (this.state.activeRoute === 'home' || this.state.view === 'post') {
                            this.navigate('all', null, false);
                        } else {
                            this.render(); 
                        }
                    }
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.state.isSearchOpen) this.toggleSearch();
                    if (e.key === 'Escape' && document.getElementById('model-picker-modal').classList.contains('modal-active')) this.closeModelPicker();
                    if (e.key === 'Escape' && this.state.isMobileMenuOpen) this.closeMobileMenu();
                });
                
                document.addEventListener('click', (e) => {
                    const dropdownList = document.getElementById('custom-dropdown-list');
                    const triggerBtn = document.getElementById('dropdown-trigger');
                    if (dropdownList && !dropdownList.classList.contains('opacity-0') && triggerBtn) {
                        if (!triggerBtn.contains(e.target) && !dropdownList.contains(e.target)) {
                            this.toggleDropdown();
                        }
                    }

                    // Close mobile menu if clicked outside header/menu
                    const mobileMenu = document.getElementById('mobile-menu');
                    const hamburgerBtn = document.getElementById('hamburger-btn');
                    if (mobileMenu && this.state.isMobileMenuOpen && hamburgerBtn) {
                        if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                            this.closeMobileMenu();
                        }
                    }
                });
            },

            toggleSearch() {
                this.state.isSearchOpen = !this.state.isSearchOpen;
                const overlay = document.getElementById('search-overlay');
                const container = document.getElementById('search-container');
                const input = document.getElementById('globalSearchOverlay');

                if (this.state.isSearchOpen) {
                    overlay.classList.remove('opacity-0', 'pointer-events-none');
                    container.classList.remove('translate-y-8');
                    setTimeout(() => input.focus(), 100);
                } else {
                    overlay.classList.add('opacity-0', 'pointer-events-none');
                    container.classList.add('translate-y-8');
                }
            },

            toggleMobileMenu() {
                this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
                const menu = document.getElementById('mobile-menu');
                const icon = document.getElementById('hamburger-icon');
                if (this.state.isMobileMenuOpen) {
                    menu.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
                    menu.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                    if (icon) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-xmark');
                    }
                } else {
                    menu.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                    menu.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            },

            closeMobileMenu() {
                this.state.isMobileMenuOpen = false;
                const menu = document.getElementById('mobile-menu');
                const icon = document.getElementById('hamburger-icon');
                if (menu) {
                    menu.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                    menu.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
                }
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            },

            updateNavUI() {
                const navBtns = document.querySelectorAll('.nav-btn');
                navBtns.forEach(btn => {
                    btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                    btn.classList.add('text-slate-500', 'dark:text-slate-400');
                });
                const activeBtn = document.getElementById(`nav-${this.state.activeRoute}`);
                if (activeBtn) {
                    activeBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
                    activeBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-sm');
                }

                const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
                mobileNavBtns.forEach(btn => {
                    btn.classList.remove('bg-fluid-accent/10', 'text-fluid-accent', 'dark:text-fluid-accent');
                    btn.classList.add('text-slate-700', 'dark:text-slate-300');
                });
                const activeMobileBtn = document.getElementById(`mobile-nav-${this.state.activeRoute}`);
                if (activeMobileBtn) {
                    activeMobileBtn.classList.remove('text-slate-700', 'dark:text-slate-300');
                    activeMobileBtn.classList.add('bg-fluid-accent/10', 'text-fluid-accent', 'dark:text-fluid-accent');
                }
            },

            getRamStudentImpact(sizeStr, typeStr) {
                if (!sizeStr) return "Smooth everyday student productivity and multi-tab web browsing.";
                if (sizeStr.includes("128GB")) return "🚀 Ultimate Extreme Workstation: Train AI models, render 8K videos, and open 100+ browser tabs simultaneously with zero latency!";
                if (sizeStr.includes("64GB")) return "⚡ Pro Workstation Performance: Effortlessly compile software, render 3D scenes, and analyze large datasets without memory limits.";
                if (sizeStr.includes("32GB")) return "⚡ Heavy Student Multitasking: Smoothly run 50+ Chrome tabs, Zoom video call, Spotify, and Photoshop at the same time without lag!";
                return "🎓 Everyday Academic Multitasking: Great for 25+ browser tabs, Microsoft Word/PowerPoint, online lectures, and 1080p gaming.";
            },

            getStorageStudentImpact(busStr, sizeStr) {
                if (busStr && (busStr.includes("Gen 4.0") || busStr.includes("Gen 4"))) {
                    return "🚀 Blazing Fast PCIe 4.0 Speeds: Read files up to 7,000 MB/s! Boots Windows in 3-5 seconds and loads massive games or university projects instantly.";
                }
                return "⚡ High-Speed NVMe Storage: Read speeds up to 3,500 MB/s! Rapid Windows boot times and instant opening of research PDFs and apps.";
            },

            evaluateTheme() {
                const htmlEl = document.documentElement;
                let targetTheme = 'light'; 

                if (this.state.view === 'post' && this.state.currentSeriesId) {
                    const series = laptopSeriesData.find(s => s.id === this.state.currentSeriesId);
                    if (series && series.category === 'Gaming') {
                        targetTheme = 'dark';
                    }
                } else if (this.state.view === 'list') {
                    targetTheme = 'light'; 
                }

                if (targetTheme === 'dark') htmlEl.classList.add('dark');
                else htmlEl.classList.remove('dark');
            },

            navigate(route, modelId = null, resetSearch = true) {
                this.closeMobileMenu();
                this.state.isConfigSwitch = false; // Reset config animation flag on navigation
                this.state.activeRoute = ['home', 'all', 'asus', 'lenovo', 'msi', 'hp'].includes(route) ? route : this.state.activeRoute;
                
                if (route === 'home') this.state.view = 'home';
                else if (route === 'post') {
                    this.state.view = 'post';
                    this.state.currentModelId = modelId;
                    this.state.currentConfigIndex = 0;
                    this.state.selectedCpu = null;
                    this.state.selectedGpu = null;
                    // Find series for this model to set theme properly
                    const series = laptopSeriesData.find(s => s.models.some(m => m.id === modelId));
                    if(series) this.state.currentSeriesId = series.id;
                }
                else this.state.view = 'list'; 
                
                if (resetSearch && route !== 'post') {
                    this.state.searchQuery = '';
                    document.getElementById('globalSearchOverlay').value = '';
                }

                this.updateNavUI();
                this.evaluateTheme();
                window.scrollTo(0, 0); // Scroll instantly to top
                this.render();
            },

            setModelSort(sortKey) {
                if (this.state.modelSortKey === sortKey) {
                    this.state.modelSortDir = (this.state.modelSortDir === 'asc') ? 'desc' : 'asc';
                } else {
                    this.state.modelSortKey = sortKey;
                    this.state.modelSortDir = 'asc';
                }
                this.renderPickerModels();
            },

            selectModelFromPicker(modelId) {
                const listContainer = document.getElementById('modal-models-list');
                if (listContainer) {
                    this.state.pickerScrollTop = listContainer.scrollTop;
                }
                this.closeModelPicker();
                this.navigate('post', modelId);
            },

            goBackFromPost() {
                const previousSeriesId = this.state.currentPickerSeriesId;
                this.navigate(this.state.activeRoute, null, false);
                if (previousSeriesId) {
                    this.openModelPicker(previousSeriesId, true);
                }
            },

            openModelPicker(seriesId, restoreScroll = false) {
                const series = laptopSeriesData.find(s => s.id === seriesId);
                if (!series) return;

                this.state.currentPickerSeriesId = seriesId;
                if (!this.state.modelSortKey) {
                    this.state.modelSortKey = 'alpha';
                    this.state.modelSortDir = 'asc';
                }

                document.getElementById('modal-series-title').innerText = series.name;
                document.getElementById('modal-brand-tag').innerText = series.brand;
                
                this.renderPickerModels();

                document.getElementById('model-picker-modal').classList.add('modal-active');
                
                const listContainer = document.getElementById('modal-models-list');
                if (listContainer) {
                    const targetScroll = restoreScroll ? (this.state.pickerScrollTop || 0) : 0;
                    listContainer.scrollTop = targetScroll;
                    requestAnimationFrame(() => {
                        listContainer.scrollTop = targetScroll;
                        setTimeout(() => {
                            listContainer.scrollTop = targetScroll;
                        }, 50);
                    });
                }
            },

            renderPickerModels() {
                const seriesId = this.state.currentPickerSeriesId;
                if (!seriesId) return;
                const series = laptopSeriesData.find(s => s.id === seriesId);
                if (!series) return;

                const sortKey = this.state.modelSortKey || 'alpha';
                const sortDir = this.state.modelSortDir || 'asc';

                // Toggle active styles and labels on sort buttons
                const btnAlpha = document.getElementById('sort-btn-alpha');
                const btnYear = document.getElementById('sort-btn-year');

                if (btnAlpha && btnYear) {
                    const alphaIcon = sortDir === 'asc' ? 'fa-arrow-down-a-z' : 'fa-arrow-up-z-a';
                    const alphaText = sortDir === 'asc' ? 'A - Z' : 'Z - A';
                    btnAlpha.innerHTML = `<i class="fa-solid ${alphaIcon}"></i> <span>${alphaText}</span>`;

                    const yearIcon = sortDir === 'asc' ? 'fa-calendar-arrow-down' : 'fa-calendar-arrow-up';
                    const yearText = sortDir === 'asc' ? 'Year (Oldest)' : 'Year (Newest)';
                    btnYear.innerHTML = `<i class="fa-solid fa-calendar-days"></i> <span>${yearText}</span>`;

                    if (sortKey === 'alpha') {
                        btnAlpha.className = 'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 bg-fluid-accent text-white shadow-sm font-extrabold';
                        btnYear.className = 'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium';
                    } else {
                        btnYear.className = 'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 bg-fluid-accent text-white shadow-sm font-extrabold';
                        btnAlpha.className = 'px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium';
                    }
                }

                const listContainer = document.getElementById('modal-models-list');
                if (!listContainer) return;
                listContainer.innerHTML = '';

                if (series.models.length === 0) {
                    listContainer.innerHTML = `<div class="text-center py-8 text-slate-500 italic">No models configured for this series yet. Ready for data injection.</div>`;
                    return;
                }

                const parseNameYear = (fullName) => {
                    const match = fullName.match(/^(.*?)\s*\((\d{4})\)$/);
                    if (match) {
                        return { base: match[1].trim(), year: parseInt(match[2], 10) };
                    }
                    return { base: fullName.trim(), year: 9999 };
                };

                const sortedModels = [...series.models].sort((a, b) => {
                    const infoA = parseNameYear(a.name);
                    const infoB = parseNameYear(b.name);

                    if (sortKey === 'year') {
                        // Primary: Year released (Ascending or Descending)
                        if (infoA.year !== infoB.year) {
                            return sortDir === 'asc' ? (infoA.year - infoB.year) : (infoB.year - infoA.year);
                        }
                        // Secondary: Natural Alphabetical (A-Z) when same year
                        return infoA.base.localeCompare(infoB.base, undefined, { numeric: true, sensitivity: 'base' });
                    } else {
                        // Primary: Natural Alphabetical (Ascending A-Z or Descending Z-A)
                        const nameCompare = infoA.base.localeCompare(infoB.base, undefined, { numeric: true, sensitivity: 'base' });
                        if (nameCompare !== 0) {
                            return sortDir === 'asc' ? nameCompare : -nameCompare;
                        }
                        // Secondary: Year released ascending (oldest first)
                        return infoA.year - infoB.year;
                    }
                });

                sortedModels.forEach(model => {
                    const info = parseNameYear(model.name);
                    const cleanTitle = info.base; // Remove (2021) year from main title string
                    const yearBadge = info.year !== 9999 ? `<span class="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600/50">${info.year}</span>` : '';

                    listContainer.innerHTML += `
                        <div onclick="app.selectModelFromPicker('${model.id}')" 
                             class="group cursor-pointer bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-fluid-accent dark:hover:border-fluid-accent transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                                <h4 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-fluid-accent transition-colors">${cleanTitle}</h4>
                                ${yearBadge}
                            </div>
                            <div class="flex flex-col md:items-end text-sm text-slate-600 dark:text-slate-400 gap-1">
                                <div class="flex items-center gap-2"><i class="fa-solid fa-microchip w-4 text-center text-blue-500"></i> <span>${model.cpuRange}</span></div>
                                <div class="flex items-center gap-2"><i class="fa-solid fa-display w-4 text-center text-emerald-500"></i> <span>${model.gpuRange}</span></div>
                            </div>
                        </div>
                    `;
                });
            },

            closeModelPicker() {
                document.getElementById('model-picker-modal').classList.remove('modal-active');
            },

            toggleDropdown(event) {
                if (event) event.stopPropagation();
                const list = document.getElementById('custom-dropdown-list');
                const icon = document.getElementById('dropdown-icon');
                
                if (list) {
                    if (list.classList.contains('opacity-0')) {
                        list.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                        list.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
                        if (icon) icon.classList.add('rotate-180');
                    } else {
                        list.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                        list.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                        if (icon) icon.classList.remove('rotate-180');
                    }
                }
            },

            selectConfiguration(index) {
                this.state.currentConfigIndex = index;
                this.state.isConfigSwitch = true; // Set flag to prevent page re-animating
                this.toggleDropdown(); // Close the menu on selection
                this.render(); // Re-render Full Analysis with new config data

                // Visual feedback animation for config switches
                const elements = [
                    document.getElementById('pricing-banner'),
                    document.getElementById('system-architecture-section'),
                    document.getElementById('strengths-considerations-section')
                ];
                elements.forEach(el => {
                    if (el) {
                        el.classList.remove('config-flash-anim');
                        void el.offsetWidth; // Force reflow
                        el.classList.add('config-flash-anim');
                    }
                });
            },

            render() {
                const container = document.getElementById('app-container');
                container.innerHTML = '';

                if (this.state.view === 'home') {
                    container.innerHTML = this.renderHome();
                } else if (this.state.view === 'list') {
                    container.innerHTML = this.renderSeriesList();
                } else if (this.state.view === 'post') {
                    container.innerHTML = this.renderPost();
                }
            },

            renderHome() {
                return `
                    <div class="w-full px-6 py-16 md:py-24 transition-all flex-grow flex items-center justify-center">
                        <div class="max-w-4xl mx-auto text-center animate-fade-up">
                            <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
                                Architectural <span class="text-transparent bg-clip-text bg-gradient-to-r from-fluid-accent to-purple-500">Clarity.</span>
                            </h1>
                            <p class="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                                Explore series lineups across top brands. Select a series to view configured models and full architectural specifications.
                            </p>
                            <button onclick="app.navigate('all')" class="kinetic-pill px-8 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl shadow-slate-900/20 transition-all inline-flex items-center">
                                Browse All Series <i class="fa-solid fa-arrow-right ml-3"></i>
                            </button>
                        </div>
                    </div>
                `;
            },

            renderSeriesList() {
                let filteredSeries = laptopSeriesData.filter(s => {
                    if (this.state.activeRoute !== 'all' && s.brand.toLowerCase() !== this.state.activeRoute) return false;
                    if (this.state.searchQuery && !s.name.toLowerCase().includes(this.state.searchQuery)) return false;
                    return true;
                });

                // Structure into the required strict ordering: Productivity -> Gaming
                // Inside each, sort ascending by priceTier to flow left (Budget) to right (High-end)
                const sections = [
                    { 
                        title: 'Productivity', 
                        data: filteredSeries
                                .filter(s => s.category === 'Productivity')
                                .sort((a, b) => a.priceTier - b.priceTier)
                    },
                    { 
                        title: 'Gaming', 
                        data: filteredSeries
                                .filter(s => s.category === 'Gaming')
                                .sort((a, b) => a.priceTier - b.priceTier)
                    }
                ];

                let html = `<div class="w-full px-6 py-12 max-w-7xl mx-auto">`;
                
                if (this.state.searchQuery) {
                    html += `<div class="mb-8 text-slate-500">Search results for <span class="font-bold text-slate-900 dark:text-white">"${this.state.searchQuery}"</span></div>`;
                }

                sections.forEach((section, index) => {
                    if (section.data.length === 0) return;

                    const delay = index * 100;
                    html += `
                        <div class="mb-16 animate-fade-up" style="animation-delay: ${delay}ms">
                            <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-800 inline-block">
                                ${section.title} Laptops
                            </h2>
                            <div class="flex items-center text-xs text-slate-400 mb-6 font-semibold uppercase tracking-wider">
                                <span>Budget</span>
                                <div class="flex-grow border-t border-dashed border-slate-300 dark:border-slate-700 mx-4"></div>
                                <span>High-End</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                ${section.data.map(series => {
                                    const tierLabel = series.priceTier === 1 ? 'Budget' : (series.priceTier === 2 ? 'Mid-Range' : 'High-End');
                                    return `
                                    <div onclick="app.openModelPicker('${series.id}')" 
                                         class="kinetic-card group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none flex flex-col justify-between h-52 relative overflow-hidden">
                                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full blur-2xl group-hover:bg-fluid-light dark:group-hover:bg-indigo-900 transition-colors duration-500"></div>
                                        <div class="relative z-10">
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="text-xs font-bold uppercase text-slate-400">${series.brand}</span>
                                                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">${tierLabel}</span>
                                            </div>
                                            <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-fluid-accent transition-colors">${series.name}</h3>
                                        </div>
                                        <div class="relative z-10 flex items-center justify-between mt-4">
                                            <span class="text-sm text-slate-500 font-medium">${series.models.length} Models</span>
                                            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center group-hover:bg-fluid-accent group-hover:text-white transition-all">
                                                <i class="fa-solid fa-arrow-right text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    `;
                });

                if (filteredSeries.length === 0) {
                    html += `<div class="text-center py-20 text-slate-500">No series found matching your criteria.</div>`;
                }

                html += `</div>`;
                return html;
            },

                                                calculateLivePrices(model, cpuStr, gpuStr) {
                const yearMatch = model.name.match(/20\d\d/);
                const yearStr = yearMatch ? yearMatch[0] : '2023';
                const year = parseInt(yearStr, 10);
                const age = 2026 - year;

                let D_t = 0.25;
                if (age <= 1) D_t = 0.72;
                else if (age === 2) D_t = 0.58;
                else if (age === 3) D_t = 0.45;
                else if (age === 4) D_t = 0.35;

                const mName = model.name.toLowerCase();
                let M_series = 1.00;
                if (mName.includes('zephyrus') || mName.includes('flow') || mName.includes('blade') || mName.includes('macbook') || mName.includes('xps')) {
                    M_series = 1.20;
                } else if (mName.includes('strix') || mName.includes('legion') || mName.includes('thinkpad')) {
                    M_series = 1.10;
                } else if (mName.includes('tuf') || mName.includes('nitro') || mName.includes('loq') || mName.includes('victus') || mName.includes('thin')) {
                    M_series = 1.00;
                } else if (mName.includes('aspire') || mName.includes('ideapad') || mName.includes('vivobook')) {
                    M_series = 0.88;
                }

                const c = (cpuStr || '').toLowerCase();
                let cpuIdx = 0;
                if (c.includes('i9') || c.includes('ryzen 9') || c.includes('ultra 9') || c.includes('ai max+')) cpuIdx = 2;
                else if (c.includes('i7') || c.includes('ryzen 7') || c.includes('ultra 7') || c.includes('ai 9') || c.includes('ai 7')) cpuIdx = 1;

                const g = (gpuStr || '').toLowerCase();
                let gpuIdx = 0;
                if (g.includes('4090') || g.includes('5090')) gpuIdx = 4;
                else if (g.includes('3080') || g.includes('4080') || g.includes('5080')) gpuIdx = 3;
                else if (g.includes('3070') || g.includes('4070') || g.includes('5070') || g.includes('6800s')) gpuIdx = 2;
                else if (g.includes('3060') || g.includes('4060') || g.includes('5060') || g.includes('7700s')) gpuIdx = 1;

                let baseRetail = 89995;
                if (mName.includes('tuf')) {
                    if (yearStr === '2026') baseRetail = 89995;
                    else if (yearStr === '2025') baseRetail = 84995;
                    else if (yearStr === '2024') baseRetail = 79995;
                    else if (yearStr === '2023') baseRetail = 64995;
                    else if (yearStr === '2022') baseRetail = 59995;
                    else baseRetail = 49995;
                } else {
                    if (yearStr === '2026') baseRetail = 139995;
                    else if (yearStr === '2025') baseRetail = 129995;
                    else if (yearStr === '2024') baseRetail = 119995;
                    else if (yearStr === '2023') baseRetail = 109995;
                    else if (yearStr === '2022') baseRetail = 99995;
                    else baseRetail = 89995;
                }

                const isZeph = mName.includes('zephyrus');
                const baseCpuIdx = isZeph ? 1 : 0;
                const baseGpuIdx = isZeph ? 1 : 0;

                const cpuPrices = [0, 5000, 10000];
                const gpuPrices = [0, 15000, 30000, 60000, 90000];

                const cpuDelta = Math.max(0, cpuPrices[cpuIdx] - cpuPrices[baseCpuIdx]);
                const gpuDelta = Math.max(0, gpuPrices[gpuIdx] - gpuPrices[baseGpuIdx]);

                const configMsrp = baseRetail + cpuDelta + gpuDelta;

                const haloBonus = (cpuIdx === 2) ? 3000 : 0;
                let penalties = 0;
                if (c.includes('7435hs') || c.includes('7235hs')) penalties -= 2000;

                const depreciated = configMsrp * D_t * M_series * 1.00 * 1.05;
                const usedPrice = Math.round((depreciated + haloBonus + penalties) / 1000) * 1000;

                return {
                    originalPrice: `₱${configMsrp.toLocaleString()}`,
                    secondhandPrice: `₱${usedPrice.toLocaleString()}`
                };
            },

            selectCpu(cpu) {
                this.state.selectedCpu = cpu;
                this.state.isConfigSwitch = true;
                this.render();
                this.triggerConfigFlashAnimation();
            },

            selectGpu(gpu) {
                this.state.selectedGpu = gpu;
                this.state.isConfigSwitch = true;
                this.render();
                this.triggerConfigFlashAnimation();
            },

            triggerConfigFlashAnimation() {
                const elements = [
                    document.getElementById('pricing-banner'),
                    document.getElementById('system-architecture-section'),
                    document.getElementById('strengths-considerations-section')
                ];
                elements.forEach(el => {
                    if (el) {
                        el.classList.remove('config-flash-anim');
                        void el.offsetWidth;
                        el.classList.add('config-flash-anim');
                    }
                });
            },

            renderPost() {
                // Find model and parent series
                let model = null;
                let parentSeries = null;
                for (const series of laptopSeriesData) {
                    model = series.models.find(m => m.id === this.state.currentModelId);
                    if (model) {
                        parentSeries = series;
                        break;
                    }
                }

                if (!model) return '<div class="text-center py-20 font-bold text-2xl">Model not found.</div>';

                // Helpers for text formatting and escaping
                const esc = (str) => str ? str.replace(/'/g, "\\'") : '';
                const cleanTgp = (str) => str ? str.replace(/\s*\([0-9-]+\s*W\)/gi, '').trim() : '';

                // Extract unique CPUs and GPUs available ONLY for this specific laptop model
                const availableCpus = model.configurations ? [...new Set(model.configurations.map(c => c.cpu))] : [];
                const availableGpus = model.configurations ? [...new Set(model.configurations.map(c => c.gpu))] : [];

                // Initialize default selections if not already set or invalid for this model
                if (!this.state.selectedCpu || !availableCpus.includes(this.state.selectedCpu)) {
                    this.state.selectedCpu = availableCpus[0] || '';
                }
                if (!this.state.selectedGpu || !availableGpus.includes(this.state.selectedGpu)) {
                    this.state.selectedGpu = availableGpus[0] || '';
                }

                // Find matching preset configuration object for RAM, screen, battery info
                let config = model.configurations ? model.configurations.find(c => c.cpu === this.state.selectedCpu && c.gpu === this.state.selectedGpu) : null;
                if (!config && model.configurations) {
                    config = model.configurations.find(c => c.cpu === this.state.selectedCpu) || 
                             model.configurations.find(c => c.gpu === this.state.selectedGpu) || 
                             model.configurations[0];
                }
                if (!config) config = model.specs || {};

                // Calculate dynamic live prices
                const livePrices = this.calculateLivePrices(model, this.state.selectedCpu, this.state.selectedGpu);

                // Determine animation based on whether we just switched configs
                const animationClass = this.state.isConfigSwitch ? '' : 'animate-fade-up';
                this.state.isConfigSwitch = false; // Reset immediately

                return `
                    <article class="max-w-5xl mx-auto ${animationClass} px-6 py-12">
                        <button onclick="app.goBackFromPost()" class="kinetic-pill inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-fluid-accent mb-8">
                            <i class="fa-solid fa-arrow-left mr-2"></i> Back to Series
                        </button>

                        <header class="mb-8">
                            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <span class="text-fluid-accent text-sm font-bold uppercase tracking-wider">${parentSeries.brand} &bull; ${parentSeries.name}</span>
                                
                                <!-- Weight Badge right at top -->
                                <div class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm">
                                    <i class="fa-solid fa-weight-hanging text-fluid-accent mr-2"></i>
                                    <span>${model.weight || config.weight || 'N/A'}</span>
                                </div>
                            </div>
                            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">${model.name}</h1>
                            
                            <!-- DYNAMIC CPU & GPU SELECTOR UI -->
                            ${model.configurations && model.configurations.length > 0 ? `
                            <div class="flex flex-col gap-6 mb-10 relative w-full z-20 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
                                
                                <!-- CPU Selector Pill Bar -->
                                <div>
                                    <span class="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                                        <i class="fa-solid fa-microchip text-blue-500 mr-2 text-sm"></i> Select Processor (CPU) for ${model.name.split(' (')[0]}
                                    </span>
                                    <div class="flex flex-wrap gap-2.5">
                                        ${availableCpus.map(cpu => `
                                            <button onclick="app.selectCpu('${esc(cpu)}')" 
                                                    class="px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border ${cpu === this.state.selectedCpu ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-[1.02]' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'}">
                                                ${cpu}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- GPU Selector Pill Bar -->
                                <div>
                                    <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center">
                                        <i class="fa-solid fa-display text-emerald-500 mr-2 text-sm"></i> Select Graphics (GPU) for ${model.name.split(' (')[0]}
                                    </span>
                                    <div class="flex flex-wrap gap-2.5">
                                        ${availableGpus.map(gpu => `
                                            <button onclick="app.selectGpu('${esc(gpu)}')" 
                                                    class="px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border ${gpu === this.state.selectedGpu ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30 scale-[1.02]' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500'}">
                                                ${cleanTgp(gpu)}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="bg-indigo-50/70 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                    <span class="flex items-center">
                                        <i class="fa-solid fa-sliders text-fluid-accent mr-2 text-sm"></i>
                                        Pick any CPU & GPU pairing above. Live market valuations recalculate dynamically based on Philippine retail SRPs and hardware age depreciation.
                                    </span>
                                </div>
                            </div>
                            ` : ''}
                        </header>

                        <!-- Pricing Separation Banner -->
                        <div id="pricing-banner" class="w-full bg-slate-900 dark:bg-slate-800 border-4 border-slate-800 dark:border-slate-700 rounded-3xl p-6 md:p-8 flex flex-col justify-between items-center mb-16 shadow-2xl relative overflow-hidden">
                            <div class="absolute -right-20 -top-20 w-64 h-64 bg-fluid-accent/30 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div class="w-full flex flex-col md:flex-row justify-between items-center relative z-10">
                                <div class="mb-4 md:mb-0">
                                    <span class="text-sm font-bold uppercase tracking-widest text-slate-400 block mb-2">Retail Market Price</span>
                                    <span class="text-4xl md:text-5xl font-black text-white tracking-tight">${livePrices.originalPrice}</span>
                                </div>
                                <div class="w-full md:w-auto h-px md:h-16 w-16 md:w-px bg-slate-700 dark:bg-slate-600 mx-8 mb-4 md:mb-0"></div>
                                <div class="text-left md:text-right w-full md:w-auto">
                                    <span class="text-sm font-bold uppercase tracking-widest text-slate-400 block mb-2">Second-hand / Refurbished</span>
                                    <span class="text-2xl md:text-3xl font-bold text-slate-300">${livePrices.secondhandPrice}</span>
                                </div>
                            </div>

                            <!-- Second-Hand Price Disclaimer Note -->
                            <div class="w-full mt-6 pt-4 border-t border-slate-800/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-400 font-medium relative z-10">
                                <span class="flex items-center">
                                    <i class="fa-solid fa-circle-info text-fluid-accent mr-2"></i>
                                    Second-hand market estimates reflect typical Philippine marketplace value based on release age & hardware specs. Actual prices vary by physical condition, battery wear & seller terms.
                                </span>
                            </div>
                        </div>

                        <!-- System Architecture Section (Bento Grid of Architecture Cards) -->
                        <section id="system-architecture-section" class="mb-12">
                            <h2 class="text-2xl font-bold mb-8 text-slate-900 dark:text-white flex items-center">
                                <i class="fa-solid fa-microchip text-fluid-accent mr-3"></i> System Architecture
                            </h2>
                            
                            <!-- Capability Graphs -->
                            <div class="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mb-8 shadow-sm">
                                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Performance Metrics</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    ${model.scores ? `
                                        <div>
                                            <div class="flex justify-between mb-2"><span class="font-semibold text-slate-700 dark:text-slate-300">General Performance</span><span class="font-bold text-slate-900 dark:text-white">${model.scores.performance}</span></div>
                                            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3"><div class="bg-blue-500 h-3 rounded-full transition-all duration-1000" style="width: ${model.scores.performance}%"></div></div>
                                        </div>
                                        <div>
                                            <div class="flex justify-between mb-2"><span class="font-semibold text-slate-700 dark:text-slate-300">Gaming</span><span class="font-bold text-slate-900 dark:text-white">${model.scores.gaming}</span></div>
                                            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3"><div class="bg-purple-500 h-3 rounded-full transition-all duration-1000" style="width: ${model.scores.gaming}%"></div></div>
                                        </div>
                                        <div>
                                            <div class="flex justify-between mb-2"><span class="font-semibold text-slate-700 dark:text-slate-300">Display Quality</span><span class="font-bold text-slate-900 dark:text-white">${model.scores.display}</span></div>
                                            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3"><div class="bg-amber-500 h-3 rounded-full transition-all duration-1000" style="width: ${model.scores.display}%"></div></div>
                                        </div>
                                        <div>
                                            <div class="flex justify-between mb-2"><span class="font-semibold text-slate-700 dark:text-slate-300">Battery Life</span><span class="font-bold text-slate-900 dark:text-white">${model.scores.battery}</span></div>
                                            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3"><div class="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style="width: ${model.scores.battery}%"></div></div>
                                        </div>
                                    ` : '<div class="text-sm text-slate-400 italic col-span-2">Graph data pending injection...</div>'}
                                </div>
                            </div>

                            <!-- Processing & Visual Engine Cards -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <!-- Processor (CPU) Card -->
                                <div class="p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl transition-colors flex flex-col justify-between shadow-sm">
                                    <div>
                                        <span class="text-xs font-extrabold uppercase tracking-widest text-blue-500 mb-3 block flex items-center font-bold">
                                            <span class="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> Processor (CPU)
                                        </span>
                                        <div class="flex items-center text-xl md:text-2xl font-black text-blue-950 dark:text-blue-100 leading-tight mb-4">
                                            <i class="fa-solid fa-microchip mr-4 text-3xl text-blue-500/80 drop-shadow-sm"></i>
                                            ${this.state.selectedCpu || config.cpu || 'Pending'}
                                        </div>
                                    </div>
                                    <div class="mt-auto">
                                        <div class="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800/50 shadow-sm">
                                            <i class="fa-solid fa-list-check mr-2"></i> ${config.cpuCoresThreads || 'Cores / Threads: Configured'}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Graphics & Display Engine Card (Unified Visual Hub) -->
                                <div class="p-6 md:p-8 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl transition-colors flex flex-col justify-between shadow-sm">
                                    <div>
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-extrabold uppercase tracking-widest text-emerald-500 flex items-center font-bold">
                                                <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Graphics & Display Engine
                                            </span>
                                            <!-- Prominent TGP Badge -->
                                            <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-sm">
                                                <i class="fa-solid fa-bolt mr-1"></i> ${config.gpuTgp || 'N/A'} Max TGP
                                            </span>
                                        </div>
                                        
                                        <!-- Emphasized Main Dedicated GPU -->
                                        <div class="flex items-center text-xl md:text-2xl font-black text-emerald-950 dark:text-emerald-100 leading-tight mb-4">
                                            <i class="fa-solid fa-display mr-4 text-3xl text-emerald-500/80 drop-shadow-sm"></i>
                                            ${cleanTgp(this.state.selectedGpu || config.gpu || 'Integrated Graphics')}
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                                        <!-- Integrated GPU & Display Panel Info -->
                                        <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <span class="inline-flex items-center">
                                                <i class="fa-solid fa-microchip text-emerald-600 dark:text-emerald-400 mr-1.5"></i>
                                                iGPU: ${config.integratedGpu || 'Standard Graphics'}
                                            </span>
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                                                <i class="fa-solid fa-tv mr-1.5"></i>
                                                ${config.displaySize ? config.displaySize + ' ' : ''}${config.displayType || 'IPS LCD'} @ ${config.refreshRate || '120 Hz'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Secondary Architecture Cards: Battery/Charging + Chassis Material -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <!-- Battery & Power Delivery Card -->
                                <div class="p-6 md:p-8 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl transition-colors flex flex-col justify-between shadow-sm">
                                    <div>
                                        <span class="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 block flex items-center font-bold">
                                            <span class="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span> Battery & Power System
                                        </span>
                                        <div class="flex items-center text-xl md:text-2xl font-black text-amber-950 dark:text-amber-100 leading-tight mb-2">
                                            <i class="fa-solid fa-battery-three-quarters mr-4 text-3xl text-amber-500/80 drop-shadow-sm"></i>
                                            ${config.batteryCapacity || 'N/A'} Capacity
                                        </div>
                                    </div>

                                    <div class="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-800/40">
                                        <div class="flex flex-col gap-2">
                                            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <span class="flex items-center">
                                                    <i class="fa-solid fa-plug text-amber-600 dark:text-amber-400 mr-2"></i> AC Power Charger:
                                                </span>
                                                <span class="font-extrabold text-amber-900 dark:text-amber-200">${config.chargePower || 'Standard Adapter'}</span>
                                            </div>
                                            
                                            <div class="flex items-center justify-between text-xs font-bold ${config.usbCharging === 'Yes' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}">
                                                <span class="flex items-center">
                                                    <i class="fa-solid fa-bolt-lightning text-emerald-500 mr-2"></i> USB-C PD Fast Charge:
                                                </span>
                                                <span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 font-extrabold">
                                                    ${config.usbCharging === 'Yes' ? 'Supported (Up to 100W PD)' : 'Not Supported'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Surprise Build & Chassis Material Card -->
                                <div class="p-6 md:p-8 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-slate-200 dark:border-slate-800/50 rounded-3xl transition-colors flex flex-col justify-between shadow-sm relative overflow-hidden">
                                    <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                    
                                    <div>
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center font-bold">
                                                <span class="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span> Build & Chassis Craftsmanship
                                            </span>
                                            <span class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                                Premium Armor
                                            </span>
                                        </div>

                                        <div class="flex items-center text-lg md:text-xl font-black text-purple-950 dark:text-purple-100 leading-snug mb-3">
                                            <i class="fa-solid fa-shield-halved mr-4 text-3xl text-purple-500/80 drop-shadow-sm"></i>
                                            ${config.chassisMaterial || 'Precision Aluminum'}
                                        </div>
                                    </div>

                                    <div class="mt-4 pt-3 border-t border-purple-200/60 dark:border-purple-800/40">
                                        <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                                            <span>Structure Grade:</span>
                                            <span class="font-bold text-purple-700 dark:text-purple-300">Aerospace Thermal Alloy</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Memory & Storage Specifications Component (Cleaned without opinions) -->
                        <div class="mb-12 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-blue-900/10 dark:from-slate-900 dark:to-indigo-950/40 p-6 md:p-8 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/40 shadow-sm relative overflow-hidden">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center">
                                    <i class="fa-solid fa-memory text-fluid-accent mr-3"></i> Memory & Storage Specifications
                                </h3>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- RAM Insights Card -->
                                <div class="bg-white/90 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center font-bold">
                                                <i class="fa-solid fa-microchip mr-2"></i> System RAM (Memory)
                                            </span>
                                            <span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                                ${config.ramSize || config.maxRamCapacity || '16GB'}
                                            </span>
                                        </div>
                                        <div class="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            ${config.ramType || 'DDR5'} ${config.ramClock ? '@ ' + config.ramClock : ''}
                                        </div>
                                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            ${config.ramUpgradable === 'Yes' ? '✓ Upgradable SO-DIMM Slots (' + (config.ramSlots || '2 Slots') + ')' : '🔒 Soldered Memory (Fixed Capacity)'}
                                        </p>
                                    </div>
                                </div>

                                <!-- Storage Insights Card -->
                                <div class="bg-white/90 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-center justify-between mb-3">
                                            <span class="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center font-bold">
                                                <i class="fa-solid fa-hard-drive mr-2"></i> High-Speed Storage
                                            </span>
                                            <span class="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                                ${config.storageSize || config.storageCapacity || '1TB'}
                                            </span>
                                        </div>
                                        <div class="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            ${config.storageBus || 'PCIe Gen 4.0 (4x)'} ${config.nvme === 'Yes' ? 'NVMe' : ''} SSD
                                        </div>
                                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            ${config.storageUpgradable === 'Yes' ? '✓ M.2 Expansion Slot Available' : '🔒 Fixed M.2 Storage Slot'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sections 2 & 3: Strengths and Considerations -->
                        <div id="strengths-considerations-section" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section class="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 class="text-lg font-bold text-green-700 dark:text-green-400 mb-6 flex items-center">
                                    <i class="fa-solid fa-plus-circle mr-3 text-xl"></i> Strengths
                                </h3>
                                ${model.pros.length > 0 ? `<ul class="space-y-4">
                                    ${model.pros.map(pro => `
                                        <li class="flex items-start text-sm text-slate-700 dark:text-slate-300">
                                            <i class="fa-solid fa-check text-green-500 mt-1 mr-3 text-xs"></i><span>${pro}</span>
                                        </li>
                                    `).join('')}
                                </ul>` : `<div class="text-slate-400 text-sm italic">Data Pending</div>`}
                            </section>
                            
                            <section class="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 class="text-lg font-bold text-rose-700 dark:text-rose-400 mb-6 flex items-center">
                                    <i class="fa-solid fa-minus-circle mr-3 text-xl"></i> Considerations
                                </h3>
                                ${model.cons.length > 0 ? `<ul class="space-y-4">
                                    ${model.cons.map(con => `
                                        <li class="flex items-start text-sm text-slate-700 dark:text-slate-300">
                                            <i class="fa-solid fa-xmark text-rose-500 mt-1 mr-3 text-xs"></i><span>${con}</span>
                                        </li>
                                    `).join('')}
                                </ul>` : `<div class="text-slate-400 text-sm italic">Data Pending</div>`}
                            </section>
                        </div>
                    </article>
                `;
            }
        };

        window.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
