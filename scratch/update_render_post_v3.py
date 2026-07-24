"""
update_render_post_v3.py
"""

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace renderPost body
old_render_post_start = "            renderPost() {"
old_render_post_end = "                        <!-- Sections 2 & 3: Strengths and Considerations -->"

start_idx = code.find(old_render_post_start)
end_idx = code.find(old_render_post_end)

if start_idx == -1 or end_idx == -1:
    print("Error: Could not locate renderPost markers!")
    exit(1)

new_render_post = """            renderPost() {
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
                const esc = (str) => str ? str.replace(/'/g, "\\\\'") : '';
                const cleanTgp = (str) => str ? str.replace(/\\s*\\([0-9-]+\\s*W\\)/gi, '').trim() : '';

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

"""

new_code = code[:start_idx] + new_render_post + code[end_idx:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Successfully created scratch/update_render_post_v3.py and updated js/app.js!")
