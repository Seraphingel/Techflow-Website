/**
 * TechFlow - Luminous Laptop Hardware Journal & Valuation Matrix
 * Built for Seraphingel (https://github.com/Seraphingel)
 */

const app = {
    state: {
        view: 'home', // 'home', 'list', 'post'
        activeRoute: 'home', // 'home', 'all', 'asus', 'lenovo', 'msi', 'hp'
        currentSeriesId: null,
        currentModelId: null,
        currentConfigIndex: 0,
        selectedCpu: null,
        selectedGpu: null,
        searchQuery: '',
        isSearchOpen: false,
        isCreatorModalOpen: false,
        isConfigSwitch: false,
        isMobileMenuOpen: false,
        modelSortKey: 'alpha', // 'alpha' or 'year'
        modelSortDir: 'asc',   // 'asc' or 'desc'
        currentPickerSeriesId: null,
        activeCategoryFilter: 'all', // 'all', 'Productivity', 'Gaming'
        activeTierFilter: 'all',     // 'all', 1, 2, 3
        theme: 'dark',
        searchSelectedIndex: -1
    },

    init() {
        this.initTheme();
        this.bindEvents();
        this.updateNavUI();
        this.render();
    },

    /* ==========================================================================
       THEME MANAGEMENT (BETTER-UI TRANSITION SUPPRESSION)
       ========================================================================== */
    initTheme() {
        const saved = localStorage.getItem('techflow-theme');
        if (saved) {
            this.state.theme = saved;
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.theme = prefersDark ? 'dark' : 'light';
        }
        this.applyTheme(this.state.theme);
    },

    toggleTheme() {
        // Better-UI recipe: suppress transitions during theme flip to prevent muddy color smearing
        const style = document.createElement('style');
        style.append(document.createTextNode('*,*::before,*::after{transition:none !important}'));
        document.head.append(style);
        const _flush = document.body.offsetHeight;

        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.state.theme = newTheme;
        localStorage.setItem('techflow-theme', newTheme);
        this.applyTheme(newTheme);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => style.remove());
        });
    },

    applyTheme(theme) {
        const html = document.documentElement;
        const icon = document.getElementById('theme-toggle-icon');
        if (theme === 'dark') {
            html.classList.add('dark');
            if (icon) icon.className = 'fa-solid fa-sun text-xs text-amber-400';
        } else {
            html.classList.remove('dark');
            if (icon) icon.className = 'fa-solid fa-moon text-xs text-slate-600';
        }
    },

    /* ==========================================================================
       CREATOR PROFILE MODAL
       ========================================================================== */
    toggleCreatorModal() {
        this.state.isCreatorModalOpen = !this.state.isCreatorModalOpen;
        const modal = document.getElementById('creator-modal');
        if (modal) {
            if (this.state.isCreatorModalOpen) {
                modal.classList.add('modal-active');
            } else {
                modal.classList.remove('modal-active');
            }
        }
    },

    /* ==========================================================================
       EVENT BINDINGS & KEYBOARD SHORTCUTS
       ========================================================================== */
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggleSearch();
                return;
            }

            if (e.key === 'Escape') {
                if (this.state.isSearchOpen) this.toggleSearch();
                if (this.state.isCreatorModalOpen) this.toggleCreatorModal();
                if (document.getElementById('model-picker-modal').classList.contains('modal-active')) this.closeModelPicker();
                if (this.state.isMobileMenuOpen) this.closeMobileMenu();
            }
        });

        // Search Input Live Typing & Keyboard Navigation (Arrow Keys + Enter)
        const searchInput = document.getElementById('globalSearchOverlay');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleLiveSearch(e.target.value);
            });
            searchInput.addEventListener('keydown', (e) => {
                const items = document.querySelectorAll('.search-result-item');
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.state.searchSelectedIndex = (this.state.searchSelectedIndex + 1) % items.length;
                    this.updateSearchSelection(items);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.state.searchSelectedIndex = (this.state.searchSelectedIndex - 1 + items.length) % items.length;
                    this.updateSearchSelection(items);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.state.searchSelectedIndex >= 0 && items[this.state.searchSelectedIndex]) {
                        items[this.state.searchSelectedIndex].click();
                    } else if (items[0]) {
                        items[0].click();
                    }
                }
            });
        }

        // Backdrop click listeners
        document.addEventListener('click', (e) => {
            // Mobile Menu
            const mobileMenu = document.getElementById('mobile-menu');
            const hamburgerBtn = document.getElementById('hamburger-btn');
            if (mobileMenu && this.state.isMobileMenuOpen && hamburgerBtn) {
                if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }

            // Search Modal
            const searchOverlay = document.getElementById('search-overlay');
            if (searchOverlay && this.state.isSearchOpen && e.target === searchOverlay) {
                this.toggleSearch();
            }

            // Creator Modal
            const creatorModal = document.getElementById('creator-modal');
            if (creatorModal && this.state.isCreatorModalOpen && e.target === creatorModal) {
                this.toggleCreatorModal();
            }

            // Model Picker Modal
            const modelModal = document.getElementById('model-picker-modal');
            if (modelModal && modelModal.classList.contains('modal-active') && e.target === modelModal) {
                this.closeModelPicker();
            }
        });
    },

    /* ==========================================================================
       COMMAND PALETTE LIVE SEARCH
       ========================================================================== */
    toggleSearch() {
        this.state.isSearchOpen = !this.state.isSearchOpen;
        this.state.searchSelectedIndex = -1;
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('globalSearchOverlay');

        if (this.state.isSearchOpen) {
            overlay.classList.add('modal-active');
            input.value = '';
            setTimeout(() => {
                input.focus();
                this.handleLiveSearch('');
            }, 80);
        } else {
            overlay.classList.remove('modal-active');
        }
    },

    updateSearchSelection(items) {
        items.forEach((item, idx) => {
            if (idx === this.state.searchSelectedIndex) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
                item.removeAttribute('aria-selected');
            }
        });
    },

    handleLiveSearch(query) {
        const container = document.getElementById('search-results-list');
        if (!container) return;

        this.state.searchSelectedIndex = -1;
        const q = (query || '').trim().toLowerCase();

        // Match series
        const matchedSeries = laptopSeriesData.filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.brand.toLowerCase().includes(q)
        ).slice(0, 4);

        // Match individual models
        let matchedModels = [];
        for (const series of laptopSeriesData) {
            for (const model of series.models) {
                const nameMatch = model.name.toLowerCase().includes(q);
                const cpuMatch = (model.cpuRange || '').toLowerCase().includes(q);
                const gpuMatch = (model.gpuRange || '').toLowerCase().includes(q);

                if (!q || nameMatch || cpuMatch || gpuMatch) {
                    matchedModels.push({ model, series });
                }
                if (matchedModels.length >= 8) break;
            }
            if (matchedModels.length >= 8) break;
        }

        if (matchedSeries.length === 0 && matchedModels.length === 0) {
            container.innerHTML = `
                <div class="py-12 text-center text-slate-400">
                    <i class="fa-solid fa-magnifying-glass text-2xl mb-2 text-sky-400 opacity-60"></i>
                    <p class="text-sm font-semibold">No hardware found for "${query}"</p>
                    <p class="text-xs text-slate-400 mt-1">Try searching for ThinkPad, Zephyrus, Legion, RTX 4080, or OLED</p>
                </div>
            `;
            return;
        }

        let html = '';

        if (matchedSeries.length > 0) {
            html += `
                <div class="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">
                    Series Lineups (${matchedSeries.length})
                </div>
            `;
            matchedSeries.forEach(series => {
                const bGradient = this.getBrandGradient(series.brand);
                html += `
                    <div onclick="app.selectSeriesFromSearch('${series.id}')" 
                         class="search-result-item tactile-btn group cursor-pointer p-3 rounded-2xl bg-white/70 dark:bg-[#0e172e]/70 hover:bg-sky-50 dark:hover:bg-[#162244] border border-sky-100 dark:border-sky-950/80 flex items-center justify-between transition-colors"
                         role="option" tabindex="-1">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr ${bGradient} text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                ${series.brand.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                                    ${series.name}
                                </div>
                                <div class="text-xs text-slate-400">
                                    ${series.brand} &bull; ${series.category} &bull; <span class="tabular-nums font-mono">${series.models.length}</span> Models
                                </div>
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-right text-xs text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                `;
            });
        }

        if (matchedModels.length > 0) {
            html += `
                <div class="px-2 pt-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">
                    Configured Laptop Models (${matchedModels.length})
                </div>
            `;
            matchedModels.forEach(({ model, series }) => {
                const yearMatch = model.name.match(/\((\d{4})\)/);
                const yearBadge = yearMatch ? `<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-900/40 tabular-nums">${yearMatch[1]}</span>` : '';
                const cleanName = model.name.replace(/\s*\(\d{4}\)/, '');

                html += `
                    <div onclick="app.selectModelFromSearch('${model.id}')" 
                         class="search-result-item tactile-btn group cursor-pointer p-3 rounded-2xl bg-white/70 dark:bg-[#0e172e]/70 hover:bg-sky-50 dark:hover:bg-[#162244] border border-sky-100 dark:border-sky-950/80 flex items-center justify-between transition-colors"
                         role="option" tabindex="-1">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-laptop"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">${cleanName}</span>
                                    ${yearBadge}
                                </div>
                                <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>${series.brand} ${series.name}</span>
                                    <span>&bull;</span>
                                    <span class="font-mono text-[11px] text-slate-400">${model.cpuRange || 'Multi-Core'}</span>
                                </div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    },

    selectSeriesFromSearch(seriesId) {
        this.toggleSearch();
        this.openModelPicker(seriesId);
    },

    selectModelFromSearch(modelId) {
        this.toggleSearch();
        this.navigate('post', modelId);
    },

    /* ==========================================================================
       ROUTING & NAVIGATION
       ========================================================================== */
    toggleMobileMenu() {
        this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
        const menu = document.getElementById('mobile-menu');
        const icon = document.getElementById('hamburger-icon');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (this.state.isMobileMenuOpen) {
            menu.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
            menu.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            if (icon) icon.className = 'fa-solid fa-xmark text-xs';
            if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
        } else {
            this.closeMobileMenu();
        }
    },

    closeMobileMenu() {
        this.state.isMobileMenuOpen = false;
        const menu = document.getElementById('mobile-menu');
        const icon = document.getElementById('hamburger-icon');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (menu) {
            menu.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            menu.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
        }
        if (icon) icon.className = 'fa-solid fa-bars text-xs';
        if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    },

    updateNavUI() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-[#0e172e]', 'text-sky-600', 'dark:text-sky-400', 'shadow-sm', 'font-bold');
            btn.classList.add('text-slate-500', 'dark:text-slate-400', 'font-semibold');
        });
        const activeBtn = document.getElementById(`nav-${this.state.activeRoute}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
            activeBtn.classList.add('bg-white', 'dark:bg-[#0e172e]', 'text-sky-600', 'dark:text-sky-400', 'shadow-sm', 'font-bold');
        }
    },

    navigate(route, modelId = null) {
        this.closeMobileMenu();
        this.state.isConfigSwitch = false;
        this.state.activeRoute = ['home', 'all', 'asus', 'lenovo', 'msi', 'hp'].includes(route) ? route : this.state.activeRoute;
        
        if (route === 'home') {
            this.state.view = 'home';
        } else if (route === 'post') {
            this.state.view = 'post';
            this.state.currentModelId = modelId;
            this.state.currentConfigIndex = 0;
            this.state.selectedCpu = null;
            this.state.selectedGpu = null;

            const series = laptopSeriesData.find(s => s.models.some(m => m.id === modelId));
            if (series) this.state.currentSeriesId = series.id;
        } else {
            this.state.view = 'list';
        }

        this.updateNavUI();
        window.scrollTo({ top: 0, behavior: 'instant' });
        this.render();
    },

    setCategoryFilter(cat) {
        this.state.activeCategoryFilter = cat;
        this.render();
    },

    setTierFilter(tier) {
        this.state.activeTierFilter = tier;
        this.render();
    },

    getBrandGradient(brand) {
        const b = (brand || '').toLowerCase();
        if (b.includes('asus')) return 'from-sky-500 to-blue-600';
        if (b.includes('lenovo')) return 'from-cyan-500 to-sky-600';
        if (b.includes('msi')) return 'from-blue-600 to-indigo-700';
        return 'from-sky-400 to-cyan-600'; // HP
    },

    /* ==========================================================================
       MODEL PICKER MODAL
       ========================================================================== */
    openModelPicker(seriesId) {
        const series = laptopSeriesData.find(s => s.id === seriesId);
        if (!series) return;

        this.state.currentPickerSeriesId = seriesId;
        if (!this.state.modelSortKey) {
            this.state.modelSortKey = 'alpha';
            this.state.modelSortDir = 'asc';
        }

        document.getElementById('modal-series-title').innerText = series.name;
        document.getElementById('modal-brand-tag').innerText = series.brand;
        document.getElementById('modal-category-tag').innerText = series.category;
        
        const noticeEl = document.getElementById('modal-discontinued-notice');
        const noticeTextEl = document.getElementById('modal-discontinued-text');
        if (series.discontinuedNotice) {
            if (noticeTextEl) noticeTextEl.innerText = series.discontinuedNotice;
            if (noticeEl) noticeEl.classList.remove('hidden');
        } else {
            if (noticeEl) noticeEl.classList.add('hidden');
        }

        this.renderPickerModels();
        document.getElementById('model-picker-modal').classList.add('modal-active');
    },

    closeModelPicker() {
        document.getElementById('model-picker-modal').classList.remove('modal-active');
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
        this.closeModelPicker();
        this.navigate('post', modelId);
    },

    goBackFromPost() {
        const previousSeriesId = this.state.currentPickerSeriesId;
        this.navigate(this.state.activeRoute, null);
        if (previousSeriesId) {
            this.openModelPicker(previousSeriesId);
        }
    },

    renderPickerModels() {
        const seriesId = this.state.currentPickerSeriesId;
        if (!seriesId) return;
        const series = laptopSeriesData.find(s => s.id === seriesId);
        if (!series) return;

        const sortKey = this.state.modelSortKey || 'alpha';
        const sortDir = this.state.modelSortDir || 'asc';

        const btnAlpha = document.getElementById('sort-btn-alpha');
        const btnYear = document.getElementById('sort-btn-year');

        if (btnAlpha && btnYear) {
            if (sortKey === 'alpha') {
                btnAlpha.className = 'px-3 py-1 rounded-full transition-all flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold text-xs';
                btnYear.className = 'px-3 py-1 rounded-full transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs';
            } else {
                btnYear.className = 'px-3 py-1 rounded-full transition-all flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold text-xs';
                btnAlpha.className = 'px-3 py-1 rounded-full transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs';
            }
        }

        const listContainer = document.getElementById('modal-models-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (series.models.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-10 text-slate-400 italic text-sm">No models currently cataloged for this series.</div>`;
            return;
        }

        const parseNameYear = (fullName) => {
            const match = fullName.match(/^(.*?)\s*\((\d{4})\)$/);
            if (match) return { base: match[1].trim(), year: parseInt(match[2], 10) };
            return { base: fullName.trim(), year: 9999 };
        };

        const sortedModels = [...series.models].sort((a, b) => {
            const infoA = parseNameYear(a.name);
            const infoB = parseNameYear(b.name);

            if (sortKey === 'year') {
                if (infoA.year !== infoB.year) {
                    return sortDir === 'asc' ? (infoA.year - infoB.year) : (infoB.year - infoA.year);
                }
                return infoA.base.localeCompare(infoB.base, undefined, { numeric: true, sensitivity: 'base' });
            } else {
                const nameCompare = infoA.base.localeCompare(infoB.base, undefined, { numeric: true, sensitivity: 'base' });
                if (nameCompare !== 0) return sortDir === 'asc' ? nameCompare : -nameCompare;
                return infoA.year - infoB.year;
            }
        });

        sortedModels.forEach((model, idx) => {
            const info = parseNameYear(model.name);
            const cleanTitle = info.base;
            const yearBadge = info.year !== 9999 ? `<span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/50 tabular-nums">${info.year}</span>` : '';
            const configCount = model.configurations ? model.configurations.length : 1;
            const delayMs = Math.min(idx * 20, 200);

            listContainer.innerHTML += `
                <div onclick="app.selectModelFromPicker('${model.id}')" 
                     class="tactile-btn glass-card stagger-card group cursor-pointer p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-sky-100 dark:border-sky-950/60"
                     style="animation-delay: ${delayMs}ms;"
                     role="button"
                     aria-label="Select model ${cleanTitle}">
                    <div>
                        <div class="flex items-center gap-2 mb-1.5">
                            <h4 class="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">${cleanTitle}</h4>
                            ${yearBadge}
                        </div>
                        <div class="flex items-center gap-3 text-xs text-slate-400">
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-microchip text-sky-500"></i> ${model.cpuRange || 'Multi-Core'}</span>
                            <span>&bull;</span>
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-display text-sky-500"></i> ${model.gpuRange || 'Integrated'}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-sky-100 dark:border-sky-950/60">
                        <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200/50 dark:border-sky-900/40 tabular-nums">
                            ${configCount} ${configCount === 1 ? 'Spec Config' : 'Configs'}
                        </span>
                        <div class="w-8 h-8 rounded-full bg-sky-50 dark:bg-[#0e172e] group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                            <i class="fa-solid fa-chevron-right text-xs translate-x-[0.5px]"></i>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    /* ==========================================================================
       VALUATION & SPEC ENGINE
       ========================================================================== */
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
        const retainedPercent = Math.round((usedPrice / configMsrp) * 100);

        return {
            originalPrice: `₱${configMsrp.toLocaleString()}`,
            secondhandPrice: `₱${usedPrice.toLocaleString()}`,
            retainedPercent: retainedPercent
        };
    },

    calculateLiveRatings(model, config, selectedCpu, selectedGpu) {
        const parseNum = (val, def) => {
            if (!val) return def;
            const m = String(val).match(/(\d+(\.\d+)?)/);
            return m ? parseFloat(m[1]) : def;
        };

        const cpuTier = (name) => {
            const n = String(name).toUpperCase();
            if (n.includes('I9') || n.includes('RYZEN 9') || n.includes('ULTRA 9')) return 95;
            if (n.includes('I7') || n.includes('RYZEN 7') || n.includes('ULTRA 7')) return 80;
            if (n.includes('I5') || n.includes('RYZEN 5') || n.includes('ULTRA 5')) return 65;
            if (n.includes('I3') || n.includes('RYZEN 3')) return 45;
            return 35;
        };

        const gpuTier = (name) => {
            const n = String(name).toUpperCase();
            if (['5090', '4090', '5080', '4080'].some(x => n.includes(x))) return 100;
            if (['5070', '4070', '3080', '7900'].some(x => n.includes(x))) return 85;
            if (['5060', '4060', '3070', '5050', '4050', '3060'].some(x => n.includes(x))) return 70;
            if (['3050', '2050', '1650', 'MX'].some(x => n.includes(x))) return 50;
            if (['ARC', 'IRIS', '680M', '780M', '880M', '890M'].some(x => n.includes(x))) return 35;
            return 20;
        };

        const cpuStr = selectedCpu || config.cpu || '';
        const gpuStr = selectedGpu || config.gpu || '';

        const ramGb = parseNum(config.ramSize, 8);
        const storageGb = parseNum(config.storageSize, 512);
        const tgpW = parseNum(config.gpuTgp, 15);
        const refreshHz = parseNum(config.refreshRate, 60);
        const batteryWh = parseNum(config.batteryCapacity, 45);
        const weightKg = parseNum(model.weight, 2.0);
        const displayIn = parseNum(config.displaySize, 15.6);

        const cScore = cpuTier(cpuStr);
        const rScore = Math.min(100, (ramGb / 32.0) * 100);
        const sScore = Math.min(100, (storageGb / 1024.0) * 80 + 20);
        const coolingScore = model.pros && model.pros.some(p => p.toLowerCase().includes('thermal')) ? 80 : 40;
        const perfRating = Math.round(0.45 * cScore + 0.25 * rScore + 0.20 * sScore + 0.10 * coolingScore);

        const gScore = gpuTier(gpuStr);
        const tScore = Math.min(100, (tgpW / 140.0) * 100);
        const refScore = Math.min(100, (refreshHz / 240.0) * 100);
        const optScore = model.pros && model.pros.some(p => p.toLowerCase().includes('optimus')) ? 100 : 0;
        const gamingRating = Math.round(0.60 * gScore + 0.15 * tScore + 0.15 * refScore + 0.10 * optScore);

        const capScore = Math.min(100, (batteryWh / 99.9) * 100);
        const effScore = (/[UvV]\b|Snapdragon/i).test(cpuStr) ? 85 : 60;
        const batteryRating = Math.round(0.70 * capScore + 0.30 * effScore);

        const weightScore = Math.max(0, Math.min(100, 100 - ((weightKg - 0.8) / (3.0 - 0.8)) * 100));
        const sizeScore = Math.max(0, Math.min(100, 100 - (displayIn - 13.0) * 15));
        const pdScore = config.usbCharging && String(config.usbCharging).toUpperCase().includes('YES') ? 100 : 0;
        const displayRating = Math.round(0.65 * weightScore + 0.20 * sizeScore + 0.15 * pdScore);

        const getTierLabel = (val) => {
            if (val >= 85) return 'Tier S (Flagship)';
            if (val >= 70) return 'Tier A (High-End)';
            if (val >= 50) return 'Tier B (Balanced)';
            return 'Tier C (Entry)';
        };

        return {
            performance: perfRating,
            gaming: gamingRating,
            battery: batteryRating,
            display: displayRating,
            perfTier: getTierLabel(perfRating),
            gamingTier: getTierLabel(gamingRating),
            batteryTier: getTierLabel(batteryRating),
            displayTier: getTierLabel(displayRating)
        };
    },

    selectCpu(cpu) {
        this.state.selectedCpu = cpu;
        this.state.isConfigSwitch = true;
        this.render();
        this.triggerConfigPulse();
    },

    selectGpu(gpu) {
        this.state.selectedGpu = gpu;
        this.state.isConfigSwitch = true;
        this.render();
        this.triggerConfigPulse();
    },

    triggerConfigPulse() {
        const elements = [
            document.getElementById('pricing-banner'),
            document.getElementById('system-architecture-section'),
            document.getElementById('strengths-considerations-section')
        ];
        elements.forEach(el => {
            if (el) {
                el.classList.remove('config-pulse-anim');
                void el.offsetWidth;
                el.classList.add('config-pulse-anim');
            }
        });
    },

    /* ==========================================================================
       MAIN VIEW RENDERER
       ========================================================================== */
    render() {
        const container = document.getElementById('app-container');
        if (!container) return;

        if (this.state.view === 'home') {
            container.innerHTML = this.renderHome();
        } else if (this.state.view === 'list') {
            container.innerHTML = this.renderSeriesList();
        } else if (this.state.view === 'post') {
            container.innerHTML = this.renderPost();
        }
    },

    /* ==========================================================================
       VIEW: HOME
       ========================================================================== */
    renderHome() {
        const totalSeries = laptopSeriesData.length;
        let totalModels = 0;
        laptopSeriesData.forEach(s => totalModels += s.models.length);

        let filteredSeries = laptopSeriesData.filter(s => {
            if (this.state.activeRoute !== 'home' && this.state.activeRoute !== 'all' && s.brand.toLowerCase() !== this.state.activeRoute) return false;
            if (this.state.activeCategoryFilter !== 'all' && s.category !== this.state.activeCategoryFilter) return false;
            if (this.state.activeTierFilter !== 'all' && s.priceTier !== this.state.activeTierFilter) return false;
            return true;
        });

        return `
            <div class="w-full flex flex-col">
                
                <!-- HERO SECTION -->
                <section class="w-full px-4 sm:px-6 pt-10 pb-12 md:pt-16 md:pb-16 max-w-5xl mx-auto flex flex-col items-center text-center relative">
                    
                    <!-- Minimalist Category Chip -->
                    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel text-xs font-bold text-sky-600 dark:text-sky-400 mb-6 shadow-sm border border-sky-200/60 dark:border-sky-900/50">
                        <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                        Laptop Hardware Architecture & Valuation
                    </div>

                    <!-- Glowing Monochrome Headline -->
                    <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-[1.1] mb-5">
                        The Living Index of <br class="hidden sm:inline" />
                        <span class="text-gradient-blue">
                            Laptop Silicon & Value.
                        </span>
                    </h1>

                    <p class="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
                        Chip-level architecture, TGP wattages, and real-time Philippine secondary valuations across every major series.
                    </p>

                    <!-- Interactive Glass Hero Search Bar -->
                    <div class="w-full max-w-xl mb-6 relative">
                        <div onclick="app.toggleSearch()" 
                             class="tactile-btn cursor-pointer w-full py-3.5 pl-12 pr-4 glass-card rounded-full shadow-lg shadow-sky-500/5 flex items-center justify-between text-left group border border-sky-200/70 dark:border-sky-900/50 hover:border-sky-400">
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-magnifying-glass text-sky-500 text-sm"></i>
                                <span class="text-slate-400 text-xs sm:text-sm font-medium">Search ThinkPad, Zephyrus, Legion, RTX 4080...</span>
                            </div>
                            <kbd class="hidden sm:inline-flex px-2 py-0.5 bg-sky-100/60 dark:bg-slate-800 text-sky-700 dark:text-sky-300 text-[11px] font-mono font-bold rounded-full border border-sky-200/50 dark:border-slate-700">Ctrl K</kbd>
                        </div>

                        <!-- Trending Chips -->
                        <div class="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs font-semibold">
                            <span class="text-slate-400">Popular:</span>
                            <button onclick="app.searchFromHero('ThinkPad')" class="tactile-btn px-3 py-1 rounded-full glass-card text-sky-600 dark:text-sky-400 hover:scale-105 transition-transform border border-sky-200/50 dark:border-sky-900/40">ThinkPad</button>
                            <button onclick="app.searchFromHero('Zephyrus')" class="tactile-btn px-3 py-1 rounded-full glass-card text-sky-600 dark:text-sky-400 hover:scale-105 transition-transform border border-sky-200/50 dark:border-sky-900/40">Zephyrus</button>
                            <button onclick="app.searchFromHero('Legion')" class="tactile-btn px-3 py-1 rounded-full glass-card text-sky-600 dark:text-sky-400 hover:scale-105 transition-transform border border-sky-200/50 dark:border-sky-900/40">Legion</button>
                            <button onclick="app.searchFromHero('RTX 4080')" class="tactile-btn px-3 py-1 rounded-full glass-card text-sky-600 dark:text-sky-400 hover:scale-105 transition-transform border border-sky-200/50 dark:border-sky-900/40">RTX 4080</button>
                        </div>
                    </div>

                    <!-- Metric Counters -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl pt-6 border-t border-sky-100 dark:border-sky-950/60 text-center">
                        <div class="glass-card p-3 rounded-2xl">
                            <div class="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">4</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Top Brands</div>
                        </div>
                        <div class="glass-card p-3 rounded-2xl">
                            <div class="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">${totalSeries}</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Architecture Lines</div>
                        </div>
                        <div class="glass-card p-3 rounded-2xl">
                            <div class="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">${totalModels}+</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Laptops Cataloged</div>
                        </div>
                        <div class="glass-card p-3 rounded-2xl">
                            <div class="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">Live ₱</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Resale Engine</div>
                        </div>
                    </div>
                </section>

                <!-- UNIFIED CATALOG EXPLORER -->
                <section class="w-full px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                    
                    <!-- Filter Controls Bar -->
                    <div class="mb-8 pb-4 border-b border-sky-100 dark:border-sky-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cataloged Series</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Select any series to inspect chipsets, generations, and resale value</p>
                        </div>

                        <div class="flex flex-wrap items-center gap-2.5">
                            <!-- Category Filter Pills -->
                            <div class="flex items-center glass-panel p-1 rounded-full text-xs font-semibold shadow-sm border border-sky-100 dark:border-sky-950/60">
                                <button onclick="app.setCategoryFilter('all')" 
                                        class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'all' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    All
                                </button>
                                <button onclick="app.setCategoryFilter('Productivity')" 
                                        class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'Productivity' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    Productivity
                                </button>
                                <button onclick="app.setCategoryFilter('Gaming')" 
                                        class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'Gaming' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    Gaming
                                </button>
                            </div>

                            <!-- Tier Filter Pills -->
                            <div class="flex items-center glass-panel p-1 rounded-full text-xs font-semibold shadow-sm border border-sky-100 dark:border-sky-950/60">
                                <button onclick="app.setTierFilter('all')" 
                                        class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 'all' ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    All Tiers
                                </button>
                                <button onclick="app.setTierFilter(1)" 
                                        class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 1 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    Budget
                                </button>
                                <button onclick="app.setTierFilter(2)" 
                                        class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 2 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    Mid-Range
                                </button>
                                <button onclick="app.setTierFilter(3)" 
                                        class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 3 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                                    Flagship
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Series Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        ${filteredSeries.map((s, idx) => this.renderSeriesCard(s, idx)).join('')}
                    </div>

                    ${filteredSeries.length === 0 ? `
                        <div class="text-center py-16 glass-card rounded-3xl">
                            <i class="fa-solid fa-filter-circle-xmark text-3xl text-sky-400 mb-2 opacity-60"></i>
                            <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No series match current filters</h3>
                            <p class="text-xs text-slate-400 mt-1">Try resetting the category or tier filter.</p>
                        </div>
                    ` : ''}
                </section>

            </div>
        `;
    },

    searchFromHero(term) {
        this.toggleSearch();
        const input = document.getElementById('globalSearchOverlay');
        if (input) {
            input.value = term;
            this.handleLiveSearch(term);
        }
    },

    /* ==========================================================================
       VIEW: SERIES CATALOG (BRAND-FOCUSED)
       ========================================================================== */
    renderSeriesList() {
        let filteredSeries = laptopSeriesData.filter(s => {
            if (this.state.activeRoute !== 'all' && s.brand.toLowerCase() !== this.state.activeRoute) return false;
            if (this.state.searchQuery && !s.name.toLowerCase().includes(this.state.searchQuery)) return false;
            if (this.state.activeCategoryFilter !== 'all' && s.category !== this.state.activeCategoryFilter) return false;
            if (this.state.activeTierFilter !== 'all' && s.priceTier !== this.state.activeTierFilter) return false;
            return true;
        });

        const routeTitle = this.state.activeRoute === 'all' ? 'All Manufacturer Series' : `${this.state.activeRoute.toUpperCase()} Architectures`;

        return `
            <div class="w-full px-4 sm:px-6 py-8 max-w-7xl mx-auto">
                
                <!-- Controls Header -->
                <div class="mb-8 pb-4 border-b border-sky-100 dark:border-sky-950/60 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                            <span class="cursor-pointer hover:text-sky-500" onclick="app.navigate('home')">Home</span>
                            <span>/</span>
                            <span class="text-sky-600 dark:text-sky-400 font-bold">${routeTitle}</span>
                        </div>
                        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            ${routeTitle}
                        </h1>
                        <p class="text-xs text-slate-400 mt-0.5">
                            Displaying <span class="tabular-nums font-mono">${filteredSeries.length}</span> verified series
                        </p>
                    </div>

                    <!-- Filter Pills -->
                    <div class="flex flex-wrap items-center gap-2.5">
                        <div class="flex items-center glass-panel p-1 rounded-full text-xs font-semibold shadow-sm border border-sky-100 dark:border-sky-950/60">
                            <button onclick="app.setCategoryFilter('all')" 
                                    class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'all' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                All
                            </button>
                            <button onclick="app.setCategoryFilter('Productivity')" 
                                    class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'Productivity' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                Productivity
                            </button>
                            <button onclick="app.setCategoryFilter('Gaming')" 
                                    class="px-3 py-1 rounded-full transition-all ${this.state.activeCategoryFilter === 'Gaming' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                Gaming
                            </button>
                        </div>

                        <div class="flex items-center glass-panel p-1 rounded-full text-xs font-semibold shadow-sm border border-sky-100 dark:border-sky-950/60">
                            <button onclick="app.setTierFilter('all')" 
                                    class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 'all' ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                All Tiers
                            </button>
                            <button onclick="app.setTierFilter(1)" 
                                    class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 1 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                Budget
                            </button>
                            <button onclick="app.setTierFilter(2)" 
                                    class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 2 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                Mid
                            </button>
                            <button onclick="app.setTierFilter(3)" 
                                    class="px-2.5 py-1 rounded-full transition-all ${this.state.activeTierFilter === 3 ? 'bg-white dark:bg-[#0e172e] text-sky-600 dark:text-sky-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400'}">
                                Flagship
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    ${filteredSeries.map((s, idx) => this.renderSeriesCard(s, idx)).join('')}
                </div>

                <!-- Empty State -->
                ${filteredSeries.length === 0 ? `
                    <div class="text-center py-20 glass-card rounded-3xl">
                        <i class="fa-solid fa-filter-circle-xmark text-3xl text-sky-400 mb-2 opacity-60"></i>
                        <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No series match current filters</h3>
                        <p class="text-xs text-slate-400 mt-1">Select "All" above to show all cataloged series.</p>
                    </div>
                ` : ''}

            </div>
        `;
    },

    renderSeriesCard(series, index = 0) {
        const isDisc = series.discontinued || false;
        const tierLabel = isDisc ? 'Discontinued' : (series.priceTier === 1 ? 'Budget' : (series.priceTier === 2 ? 'Mid-Range' : 'Flagship'));
        const badgeClass = isDisc 
            ? 'bg-sky-50 dark:bg-sky-950/40 text-slate-400 border border-sky-200/40 dark:border-sky-900/30' 
            : (series.priceTier === 3 
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-300/60 dark:border-sky-800/60 font-bold' 
                : 'bg-white dark:bg-[#0e172e] text-slate-600 dark:text-slate-300 border border-sky-100 dark:border-sky-950/60');

        const delayMs = Math.min(index * 25, 300);

        return `
            <div onclick="app.openModelPicker('${series.id}')" 
                 class="tactile-btn glass-card stagger-card group cursor-pointer rounded-3xl p-5 flex flex-col justify-between h-52 relative overflow-hidden border border-sky-100 dark:border-sky-950/80"
                 style="animation-delay: ${delayMs}ms;"
                 role="button"
                 aria-label="Open ${series.name} series with ${series.models.length} cataloged models">
                <div>
                    <div class="flex justify-between items-start mb-2.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">${series.brand}</span>
                        <span class="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeClass}">${tierLabel}</span>
                    </div>
                    <h3 class="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors leading-snug">${series.name}</h3>
                </div>
                
                <div class="pt-4 border-t border-sky-100 dark:border-sky-950/60 flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-slate-400 tabular-nums">${series.models.length} Models</span>
                    <div class="w-8 h-8 rounded-full bg-sky-50 dark:bg-[#0e172e] group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                        <i class="fa-solid fa-chevron-right text-xs translate-x-[0.5px]"></i>
                    </div>
                </div>
            </div>
        `;
    },

    /* ==========================================================================
       VIEW: POST (HARDWARE ARCHITECTURE & VALUATION)
       ========================================================================== */
    renderPost(modelId = null) {
        if (modelId) this.state.currentModelId = modelId;
        let model = null;
        let parentSeries = null;
        for (const series of laptopSeriesData) {
            model = series.models.find(m => m.id === this.state.currentModelId);
            if (model) {
                parentSeries = series;
                break;
            }
        }

        if (!model) {
            return `
                <div class="text-center py-24">
                    <h2 class="text-2xl font-bold mb-4">Model Specification Not Found</h2>
                    <button onclick="app.navigate('all')" class="tactile-btn px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold">
                        Back to Lineups
                    </button>
                </div>
            `;
        }

        const esc = (str) => str ? str.replace(/'/g, "\\'") : '';
        const cleanTgp = (str) => str ? str.replace(/\s*\([0-9-]+\s*W\)/gi, '').trim() : '';

        const availableCpus = model.configurations ? [...new Set(model.configurations.map(c => c.cpu))] : [];
        const availableGpus = model.configurations ? [...new Set(model.configurations.map(c => c.gpu))] : [];

        if (!this.state.selectedCpu || !availableCpus.includes(this.state.selectedCpu)) {
            this.state.selectedCpu = availableCpus[0] || '';
        }
        if (!this.state.selectedGpu || !availableGpus.includes(this.state.selectedGpu)) {
            this.state.selectedGpu = availableGpus[0] || '';
        }

        let config = model.configurations ? model.configurations.find(c => c.cpu === this.state.selectedCpu && c.gpu === this.state.selectedGpu) : null;
        if (!config && model.configurations) {
            config = model.configurations.find(c => c.cpu === this.state.selectedCpu) || 
                     model.configurations.find(c => c.gpu === this.state.selectedGpu) || 
                     model.configurations[0];
        }
        if (!config) config = model.specs || {};

        const livePrices = this.calculateLivePrices(model, this.state.selectedCpu, this.state.selectedGpu);
        const liveRatings = this.calculateLiveRatings(model, config, this.state.selectedCpu, this.state.selectedGpu);

        const yearMatch = model.name.match(/\((\d{4})\)/);
        const yearVal = yearMatch ? yearMatch[1] : '';
        const cleanModelName = model.name.replace(/\s*\(\d{4}\)/, '');

        const bGrad = this.getBrandGradient(parentSeries.brand);

        return `
            <article class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                
                <!-- Breadcrumbs & Back -->
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-sky-100 dark:border-sky-950/60">
                    <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <button onclick="app.navigate('home')" class="hover:text-sky-500 font-semibold">Home</button>
                        <span>/</span>
                        <button onclick="app.navigate('${parentSeries.brand.toLowerCase()}')" class="hover:text-sky-500 font-semibold">${parentSeries.brand}</button>
                        <span>/</span>
                        <button onclick="app.goBackFromPost()" class="hover:text-sky-500 font-semibold">${parentSeries.name}</button>
                        <span>/</span>
                        <span class="text-sky-600 dark:text-sky-400 font-bold truncate max-w-[180px] sm:max-w-none">${cleanModelName}</span>
                    </div>

                    <button onclick="app.goBackFromPost()" 
                            class="tactile-btn inline-flex items-center px-3.5 py-1.5 rounded-full glass-card text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sky-500 shadow-sm border border-sky-100 dark:border-sky-950/60"
                            aria-label="Back to series lineup">
                        <i class="fa-solid fa-arrow-left mr-1.5 text-xs -translate-x-px"></i>
                        <span>Back</span>
                    </button>
                </div>

                <!-- Model Header Banner -->
                <header class="mb-8">
                    <div class="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold px-3 py-0.5 rounded-full bg-gradient-to-r ${bGrad} text-white shadow-xs">
                                ${parentSeries.brand} &bull; ${parentSeries.category}
                            </span>
                            ${yearVal ? `<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-900/40 tabular-nums">${yearVal}</span>` : ''}
                        </div>
                        
                        <!-- System Weight -->
                        <div class="inline-flex items-center px-3 py-1 rounded-full glass-panel text-slate-500 dark:text-slate-300 text-xs font-mono font-medium border border-sky-100 dark:border-sky-950/60 tabular-nums">
                            <i class="fa-solid fa-weight-hanging text-sky-500 mr-1.5 text-xs"></i>
                            <span>${model.weight || config.weight || 'N/A'}</span>
                        </div>
                    </div>

                    <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                        ${cleanModelName}
                    </h1>

                    <!-- INTERACTIVE SILICON CONFIGURATOR (CPU & GPU SELECTORS) -->
                    ${availableCpus.length > 0 || availableGpus.length > 0 ? `
                        <div class="mt-6 glass-card p-5 sm:p-6 rounded-3xl shadow-sm border border-sky-100 dark:border-sky-950/60 relative overflow-hidden">
                            <div class="flex items-center justify-between pb-3 mb-4 border-b border-sky-100 dark:border-sky-950/60">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs">
                                        <i class="fa-solid fa-sliders"></i>
                                    </div>
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Hardware Silicon Configurator</h3>
                                </div>
                                <span class="text-[11px] font-mono text-slate-400">Recalculates valuations & ratings</span>
                            </div>

                            <div class="space-y-4">
                                <!-- CPU Selector -->
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center">
                                            <i class="fa-solid fa-microchip text-sky-500 mr-1.5 text-xs"></i> Processor (CPU)
                                        </span>
                                        <span class="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold tabular-nums">${config.cpuCoresThreads || ''}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        ${availableCpus.map(cpu => `
                                            <button onclick="app.selectCpu('${esc(cpu)}')" 
                                                    aria-pressed="${cpu === this.state.selectedCpu ? 'true' : 'false'}"
                                                    class="tactile-btn px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${cpu === this.state.selectedCpu 
                                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-md shadow-sky-500/20 font-bold' 
                                                        : 'glass-panel text-slate-600 dark:text-slate-300 border-sky-100 dark:border-sky-950/60 hover:border-sky-400'}">
                                                ${cpu}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- GPU Selector -->
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center">
                                            <i class="fa-solid fa-display text-sky-500 mr-1.5 text-xs"></i> Dedicated Graphics (GPU)
                                        </span>
                                        <span class="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold tabular-nums">${config.gpuTgp || ''} Max TGP</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        ${availableGpus.map(gpu => `
                                            <button onclick="app.selectGpu('${esc(gpu)}')" 
                                                    aria-pressed="${gpu === this.state.selectedGpu ? 'true' : 'false'}"
                                                    class="tactile-btn px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${gpu === this.state.selectedGpu 
                                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-md shadow-sky-500/20 font-bold' 
                                                        : 'glass-panel text-slate-600 dark:text-slate-300 border-sky-100 dark:border-sky-950/60 hover:border-sky-400'}">
                                                ${cleanTgp(gpu)}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </header>

                <!-- MINIMALIST MARKET VALUATION CARD -->
                <div id="pricing-banner" class="w-full glass-card rounded-3xl p-6 sm:p-7 mb-10 shadow-md border border-sky-200/70 dark:border-sky-900/50 relative overflow-hidden">
                    <div class="absolute -right-16 -top-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div class="flex items-center justify-between pb-3.5 mb-5 border-b border-sky-100 dark:border-sky-950/60">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Philippine Market Valuation Telemetry</h3>
                        </div>
                        <span class="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/50 tabular-nums">
                            ${livePrices.retainedPercent}% Value Retained
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
                        <div>
                            <span class="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1 font-semibold">Retail Launch Price (MSRP)</span>
                            <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
                                ${livePrices.originalPrice}
                            </div>
                            <p class="text-xs text-slate-400 mt-1">Introductory Philippine SRP for configured silicon.</p>
                        </div>

                        <div class="md:border-l md:border-sky-100 md:dark:border-sky-950/60 md:pl-6">
                            <span class="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1 font-bold">Estimated Secondary Resale Rate</span>
                            <div class="text-3xl sm:text-4xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight font-mono tabular-nums">
                                ${livePrices.secondhandPrice}
                            </div>
                            <p class="text-xs text-slate-400 mt-1">Fair marketplace rate accounting for generational depreciation.</p>
                        </div>
                    </div>

                    <div class="mt-5 pt-3 border-t border-sky-100 dark:border-sky-950/60 flex items-start gap-2 text-xs text-slate-400">
                        <i class="fa-solid fa-circle-info text-sky-500 mt-0.5 flex-shrink-0"></i>
                        <span>Secondary valuations reflect typical Philippine enthusiast marketplace conditions based on generation and tier. Actual transactions vary with cosmetic condition, battery health, and accessories.</span>
                    </div>
                </div>

                <!-- SYSTEM ARCHITECTURE & CAPABILITIES -->
                <section id="system-architecture-section" class="mb-10">
                    <div class="flex items-center gap-2 mb-5">
                        <div class="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs shadow-sm">
                            <i class="fa-solid fa-microchip"></i>
                        </div>
                        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">System Architecture & Capabilities</h2>
                    </div>

                    <!-- Capability Benchmark Meters -->
                    <div class="w-full glass-card rounded-3xl p-5 sm:p-6 mb-6 shadow-sm border border-sky-100 dark:border-sky-950/60">
                        <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-5">Calculated Capability Index</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <!-- Computing -->
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Computing & Silicon Core</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">${liveRatings.perfTier}</span>
                                        <span class="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">${liveRatings.performance}/100</span>
                                    </div>
                                </div>
                                <div class="w-full bg-sky-50 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-sky-100 dark:border-slate-700/50">
                                    <div class="bg-gradient-to-r from-sky-400 to-blue-600 h-2 rounded-full gauge-bar-fill" style="width: ${liveRatings.performance}%"></div>
                                </div>
                            </div>

                            <!-- Gaming -->
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Gaming & 3D Acceleration</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">${liveRatings.gamingTier}</span>
                                        <span class="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">${liveRatings.gaming}/100</span>
                                    </div>
                                </div>
                                <div class="w-full bg-indigo-50/50 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-indigo-100/60 dark:border-slate-700/50">
                                    <div class="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full gauge-bar-fill" style="width: ${liveRatings.gaming}%"></div>
                                </div>
                            </div>

                            <!-- Display -->
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Display & Visual Fidelity</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">${liveRatings.displayTier}</span>
                                        <span class="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">${liveRatings.display}/100</span>
                                    </div>
                                </div>
                                <div class="w-full bg-purple-50/50 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-purple-100/60 dark:border-slate-700/50">
                                    <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full gauge-bar-fill" style="width: ${liveRatings.display}%"></div>
                                </div>
                            </div>

                            <!-- Battery -->
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Battery & Power Efficiency</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">${liveRatings.batteryTier}</span>
                                        <span class="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">${liveRatings.battery}/100</span>
                                    </div>
                                </div>
                                <div class="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-emerald-100/60 dark:border-slate-700/50">
                                    <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full gauge-bar-fill" style="width: ${liveRatings.battery}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BENTO SPECIFICATION MATRIX (6 STRUCTURED GLASS CARDS WITH SEMANTIC ACCENTS) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        <!-- 1. CPU -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center">
                                        <i class="fa-solid fa-microchip mr-1.5 text-xs text-sky-500"></i> Processor Core
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-900/40">
                                        CPU
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${this.state.selectedCpu || config.cpu || 'Multi-Core Processor'}
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs font-mono text-slate-400 tabular-nums">
                                ${config.cpuCoresThreads || 'Architecture Cores / Threads Configured'}
                            </div>
                        </div>

                        <!-- 2. GPU -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center">
                                        <i class="fa-solid fa-display mr-1.5 text-xs text-indigo-500"></i> Graphics Core
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/40 tabular-nums">
                                        ${config.gpuTgp || 'Max TGP'}
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${cleanTgp(this.state.selectedGpu || config.gpu || 'Integrated Graphics')}
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs font-mono text-slate-400">
                                iGPU: ${config.integratedGpu || 'Integrated Graphics'}
                            </div>
                        </div>

                        <!-- 3. Display (Purple) -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60 hover:border-purple-300/50 dark:hover:border-purple-800/50">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center">
                                        <i class="fa-solid fa-tv mr-1.5 text-xs text-purple-500"></i> Display Panel
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40 tabular-nums">
                                        ${config.refreshRate || '60 Hz'}
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${config.displaySize || '15.6"'} ${config.displayType || 'Display Panel'}
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs font-mono text-slate-400 tabular-nums">
                                Refresh: ${config.refreshRate || 'Standard 60 Hz'}
                            </div>
                        </div>

                        <!-- 4. RAM -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center">
                                        <i class="fa-solid fa-memory mr-1.5 text-xs text-cyan-500"></i> Memory Subsystem
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-900/40 tabular-nums">
                                        ${config.ramSize || config.maxRamCapacity || '16GB'}
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${config.ramType || 'DDR5'} ${config.ramClock ? '@ ' + config.ramClock : ''}
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs text-slate-400">
                                ${config.ramUpgradable === 'Yes' ? 'SO-DIMM Slots: Upgradable' : 'Soldered (Fixed Capacity)'}
                            </div>
                        </div>

                        <!-- 5. Storage -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center">
                                        <i class="fa-solid fa-hard-drive mr-1.5 text-xs text-blue-500"></i> NVMe Storage
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 tabular-nums">
                                        ${config.storageSize || config.storageCapacity || '1TB'}
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${config.storageBus || 'PCIe Gen 4.0 x4'} SSD
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs text-slate-400">
                                ${config.storageUpgradable === 'Yes' ? 'M.2 Expansion Available' : 'Single M.2 Slot'}
                            </div>
                        </div>

                        <!-- 6. Power & Mobility (Green) -->
                        <div class="glass-card rounded-3xl p-5 flex flex-col justify-between border border-sky-100 dark:border-sky-950/60 hover:border-emerald-300/50 dark:hover:border-emerald-800/50">
                            <div>
                                <div class="flex items-center justify-between mb-2.5">
                                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center">
                                        <i class="fa-solid fa-battery-half mr-1.5 text-xs text-emerald-500"></i> Power & Mobility
                                    </span>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40 tabular-nums">
                                        ${config.batteryCapacity || 'Battery'}
                                    </span>
                                </div>
                                <div class="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                                    ${config.chargePower || 'Standard'} Charger
                                </div>
                            </div>
                            <div class="pt-2.5 border-t border-sky-100 dark:border-sky-950/60 text-xs text-slate-400">
                                USB-C PD: ${config.usbCharging === 'Yes' ? 'Supported (100W PD)' : 'Not Supported'}
                            </div>
                        </div>

                    </div>
                </section>

                <!-- STRENGTHS & CONSIDERATIONS -->
                <div id="strengths-considerations-section" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                    
                    <!-- Strengths (Green) -->
                    <div class="glass-card p-5 sm:p-6 rounded-3xl shadow-sm border border-sky-100 dark:border-sky-950/60">
                        <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-sky-100 dark:border-sky-950/60">
                            <div class="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-circle-check"></i>
                            </div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Architectural Strengths</h3>
                        </div>
                        ${model.pros && model.pros.length > 0 ? `
                            <ul class="space-y-2.5">
                                ${model.pros.map(pro => `
                                    <li class="flex items-start text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                        <i class="fa-solid fa-check text-emerald-500 mt-1 mr-2 text-xs flex-shrink-0"></i>
                                        <span>${pro}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : `<div class="text-xs text-slate-400 italic">No verified strengths recorded.</div>`}
                    </div>

                    <!-- Considerations (Amber) -->
                    <div class="glass-card p-5 sm:p-6 rounded-3xl shadow-sm border border-sky-100 dark:border-sky-950/60">
                        <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-sky-100 dark:border-sky-950/60">
                            <div class="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-circle-info"></i>
                            </div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Engineering Considerations</h3>
                        </div>
                        ${model.cons && model.cons.length > 0 ? `
                            <ul class="space-y-2.5">
                                ${model.cons.map(con => `
                                    <li class="flex items-start text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                        <i class="fa-solid fa-circle-info text-amber-500 mt-1 mr-2 text-xs flex-shrink-0"></i>
                                        <span>${con}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : `<div class="text-xs text-slate-400 italic">No verified considerations recorded.</div>`}
                    </div>

                </div>

            </article>
        `;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
