import openpyxl, json, re, sys, os

sys.path.append(r'C:\Users\User\Documents\Coding\TechFlow Data Organizer')
from nanoreview_parser import calculate_laptop_prices

base_dir = r'c:\Users\User\Documents\Coding\TechFlow'
excel_path = r'C:\Users\User\Documents\Coding\TechFlow Data Organizer\nanoreview_master.xlsx'
html_path = r'c:\Users\User\Documents\Coding\TechFlow\techflow_journal.html'

# 1. Base Series Definitions
series_list = [
    # ASUS
    { "id": 's-asus-vivobook', "brand": 'ASUS', "name": 'Vivobook Series', "category": 'Productivity', "priceTier": 1, "models": [] },
    { "id": 's-asus-expertbook', "brand": 'ASUS', "name": 'Expertbook Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-asus-zenbook', "brand": 'ASUS', "name": 'Zenbook Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-asus-proart', "brand": 'ASUS', "name": 'ProArt Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-asus-tuf', "brand": 'ASUS', "name": 'TUF Gaming', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-asus-zephyrus', "brand": 'ASUS', "name": 'ROG Zephyrus', "category": 'Gaming', "priceTier": 2, "models": [] },
    { "id": 's-asus-flow', "brand": 'ASUS', "name": 'ROG Flow', "category": 'Gaming', "priceTier": 3, "models": [] },
    { "id": 's-asus-strix', "brand": 'ASUS', "name": 'ROG Strix', "category": 'Gaming', "priceTier": 3, "models": [] },
    # Lenovo
    { "id": 's-lenovo-ideapad', "brand": 'Lenovo', "name": 'IdeaPad Series', "category": 'Productivity', "priceTier": 1, "models": [] },
    { "id": 's-lenovo-thinkbook', "brand": 'Lenovo', "name": 'ThinkBook Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-lenovo-slim', "brand": 'Lenovo', "name": 'Slim Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-lenovo-yoga', "brand": 'Lenovo', "name": 'Yoga Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-lenovo-thinkpad', "brand": 'Lenovo', "name": 'ThinkPad Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-lenovo-loq', "brand": 'Lenovo', "name": 'LOQ Series', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-lenovo-legion', "brand": 'Lenovo', "name": 'Legion Series', "category": 'Gaming', "priceTier": 3, "models": [] },
    # MSI
    { "id": 's-msi-modern', "brand": 'MSI', "name": 'Modern Series', "category": 'Productivity', "priceTier": 1, "models": [] },
    { "id": 's-msi-commercial', "brand": 'MSI', "name": 'Commercial Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-msi-prestige', "brand": 'MSI', "name": 'Prestige Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-msi-venturepro', "brand": 'MSI', "name": 'VenturePro Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-msi-thin', "brand": 'MSI', "name": 'Thin Series', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-msi-cyborg', "brand": 'MSI', "name": 'Cyborg Series', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-msi-katana', "brand": 'MSI', "name": 'Katana Series', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-msi-crosshair', "brand": 'MSI', "name": 'Crosshair Series', "category": 'Gaming', "priceTier": 2, "models": [] },
    { "id": 's-msi-vector', "brand": 'MSI', "name": 'Vector Series', "category": 'Gaming', "priceTier": 2, "models": [] },
    { "id": 's-msi-stealth', "brand": 'MSI', "name": 'Stealth Series', "category": 'Gaming', "priceTier": 3, "models": [] },
    { "id": 's-msi-raider', "brand": 'MSI', "name": 'Raider Series', "category": 'Gaming', "priceTier": 3, "models": [] },
    { "id": 's-msi-titan', "brand": 'MSI', "name": 'Titan Series', "category": 'Gaming', "priceTier": 3, "models": [] },
    # HP
    { "id": 's-hp-pavilion', "brand": 'HP', "name": 'Pavilion Series', "category": 'Productivity', "priceTier": 1, "models": [] },
    { "id": 's-hp-probook', "brand": 'HP', "name": 'ProBook Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-hp-omnibook', "brand": 'HP', "name": 'OmniBook Series', "category": 'Productivity', "priceTier": 2, "models": [] },
    { "id": 's-hp-elitebook', "brand": 'HP', "name": 'EliteBook Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-hp-elite', "brand": 'HP', "name": 'Elite Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-hp-zbook', "brand": 'HP', "name": 'ZBook Series', "category": 'Productivity', "priceTier": 3, "models": [] },
    { "id": 's-hp-victus', "brand": 'HP', "name": 'Victus Series', "category": 'Gaming', "priceTier": 1, "models": [] },
    { "id": 's-hp-omen', "brand": 'HP', "name": 'OMEN Series', "category": 'Gaming', "priceTier": 3, "models": [] }
]

series_dict = {s['id']: s for s in series_list}

# 2. Read Excel
wb = openpyxl.load_workbook(excel_path, data_only=True)
sheet = wb['Laptops']
headers = [sheet.cell(row=1, column=c).value for c in range(1, sheet.max_column + 1)]

rows = []
for r in range(2, sheet.max_row + 1):
    row_dict = {}
    for c in range(1, sheet.max_column + 1):
        val = sheet.cell(row=r, column=c).value
        if val in ['-', 'None', None]:
            val = ''
        else:
            val = str(val).strip()
        row_dict[headers[c-1]] = val
    rows.append(row_dict)

def clean_weight(w_str):
    if not w_str: return ""
    kg_match = re.search(r'([\d\.]+)\s*kg', w_str)
    if kg_match:
        return f"{float(kg_match.group(1)):.2f} kg"
    try:
        val = float(w_str.replace('kg', '').strip())
        return f"{val:.2f} kg"
    except:
        return w_str


def clean_model_title(raw_model):
    if not raw_model: return ""
    # Strip any (...) containing specific model numbers or chassis codes like (X1404), (GU606), (3604), (K6502)
    cleaned = re.sub(r'\s*\([^)]*\)', '', raw_model).strip()
    return cleaned

def clean_cpu_string(cpu):
    if not cpu: return ""
    cpu = cpu.replace('iUltra', 'Ultra')
    return cpu.strip()

def clean_gpu_string(gpu):
    if not gpu: return ""
    gpu = gpu.replace('iUltra', 'Ultra')
    return gpu.strip()

def shorten_cpu(cpu):
    if not cpu: return ""
    cpu = clean_cpu_string(cpu)
    
    # Model List Rule: Remove Qualcomm brand name, keep Snapdragon
    cpu = cpu.replace('Qualcomm Snapdragon', 'Snapdragon').replace('Qualcomm ', 'Snapdragon ')
    
    # Model List Rule: iUltra / Intel Core Ultra becomes Ultra only
    if 'Intel Core Ultra' in cpu:
        cpu = 'Ultra ' + cpu.split('Intel Core Ultra')[-1].strip()
    elif 'Intel Core i' in cpu:
        cpu = 'i' + cpu.split('Intel Core i')[-1].strip()
    elif 'Intel Core ' in cpu:
        cpu = 'i' + cpu.split('Intel Core ')[-1].strip()
    elif 'iUltra' in cpu:
        cpu = 'Ultra ' + cpu.split('iUltra')[-1].strip()
    elif 'Ultra' in cpu and not cpu.startswith('Ultra'):
        cpu = 'Ultra ' + cpu.split('Ultra')[-1].strip()

    cpu = cpu.replace('AMD Ryzen ', 'R')
    cpu = re.sub(r'\s+Mobile.*', '', cpu)
    return cpu.strip()

def shorten_gpu(gpu):
    gpu = clean_gpu_string(gpu)
    gpu = gpu.replace('GeForce ', '').replace('Mobile ', '').replace(' Graphics', '')
    gpu = re.sub(r'\s*\(\d+.*?\)', '', gpu)
    return gpu.strip()

def build_range(item_list, shorten_fn):
    if not item_list: return ""
    cleaned = [shorten_fn(x) for x in item_list if x]
    if not cleaned: return ""
    if len(cleaned) == 1:
        return cleaned[0]
    return f"{cleaned[0]} \u279e {cleaned[-1]}"

def format_cores_threads(cores, threads):
    if not cores and not threads:
        return ""
    cores_str = str(cores).strip()
    threads_str = str(threads).strip()
    
    if '(' in cores_str:
        m = re.match(r'(\d+)\s*\((.*?)\)', cores_str)
        if m:
            cores_formatted = f"{m.group(1)} Cores ({m.group(2)})"
        else:
            cores_formatted = f"{cores_str} Cores"
    else:
        cores_formatted = f"{cores_str} Cores" if cores_str else ""
        
    threads_formatted = f"{threads_str} Threads" if threads_str else ""
    
    if cores_formatted and threads_formatted:
        return f"{cores_formatted} / {threads_formatted}"
    return cores_formatted or threads_formatted

processed_keys = set()
for idx, row in enumerate(rows, 1):
    brand = row.get('Brand', 'ASUS').strip()
    raw_model = row.get('Model', '').strip()
    year = row.get('Date Launched', '').strip()

    # User Rule: Remove entries without dates/years, and remove duplicates
    if not year or not raw_model:
        continue

    clean_base_title = clean_model_title(raw_model)
    model_name = f"{clean_base_title} ({year})"

    dedup_key = (brand.upper(), clean_base_title.lower(), str(year))
    if dedup_key in processed_keys:
        continue
    processed_keys.add(dedup_key)

    model_id = f"m-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}"
    
    series_id = ""
    if "Flow" in raw_model:
        series_id = "s-asus-flow"
    elif "Strix" in raw_model:
        series_id = "s-asus-strix"
    elif "Zephyrus" in raw_model:
        series_id = "s-asus-zephyrus"
    elif "TUF" in raw_model:
        series_id = "s-asus-tuf"
    elif "Zenbook" in raw_model:
        series_id = "s-asus-zenbook"
    elif "Vivobook" in raw_model:
        series_id = "s-asus-vivobook"
    else:
        series_id = f"s-{brand.lower()}-{re.sub(r'[^a-z0-9]+', '', raw_model.lower())}"

    cpus = [clean_cpu_string(c.strip()) for c in row.get('CPU name', '').split('\n') if c.strip()]
    gpus = [clean_gpu_string(g.strip()) for g in row.get('GPU Name', '').split('\n') if g.strip()]
    
    cpu_range = build_range(cpus, shorten_cpu)
    gpu_range = build_range(gpus, shorten_gpu)
    
    weight = clean_weight(row.get('Weight', ''))
    
    cores_raw = row.get('Cores', '')
    threads_raw = row.get('Threads', '')
    cores_threads_formatted = format_cores_threads(cores_raw, threads_raw)

    configs = []
    # Build configuration pairings
    pairings = []
    if len(cpus) > 1 and len(gpus) > 1:
        # Standard pairs (cpu[i], gpu[i])
        for i in range(max(len(cpus), len(gpus))):
            c_cpu = cpus[min(i, len(cpus)-1)]
            c_gpu = gpus[min(i, len(gpus)-1)]
            if (c_cpu, c_gpu) not in pairings:
                pairings.append((c_cpu, c_gpu))
        # Add high-CPU mid-GPU pairing if present (e.g. i9 / Ryzen 9 + RTX 4060)
        if len(cpus) >= 3 and len(gpus) >= 2:
            high_cpu = cpus[-1]
            mid_gpu = gpus[1]
            if (high_cpu, mid_gpu) not in pairings:
                pairings.insert(len(pairings)-1, (high_cpu, mid_gpu))
    elif cpus or gpus:
        max_len = max(len(cpus), len(gpus))
        for i in range(max_len):
            c_cpu = cpus[min(i, len(cpus)-1)] if cpus else ""
            c_gpu = gpus[min(i, len(gpus)-1)] if gpus else ""
            if (c_cpu, c_gpu) not in pairings:
                pairings.append((c_cpu, c_gpu))
    else:
        pairings = [("", "")]

    for c_cpu, c_gpu in pairings:
        c_gpu_clean = re.sub(r'\s*\(\d+.*?\)', '', c_gpu).strip()
        config_name = f"{c_cpu} + {c_gpu_clean}".strip(" +")
        
        disp_size = row.get('Display Size', '')
        disp_type = row.get('Display Type', '')
        disp_str = f"{disp_size} {disp_type}".strip()
        
        tgp = row.get('TGP', '')
        
        storage_bus = row.get('Storage Bus', '')
        storage_type_raw = row.get('Storage type', '')
        nvme = row.get('NVMe', '')
        storage_type_str = ""
        if nvme == "Yes":
            storage_type_str = f"{storage_bus} NVMe".strip()
        elif storage_bus or storage_type_raw:
            storage_type_str = f"{storage_bus} {storage_type_raw}".strip()
            
        storage_size = row.get('Storage size', '')
        if storage_size and storage_size.isdigit():
            val_gb = int(storage_size)
            if val_gb >= 1024:
                storage_size_formatted = f"{val_gb//1024}TB SSD ({val_gb}GB)"
            else:
                storage_size_formatted = f"{val_gb}GB SSD"
        else:
            storage_size_formatted = storage_size

        # Calculate tier-specific price for this exact CPU + GPU tier
        cfg_pricing_row = {
            'Brand': row.get('Brand', 'ASUS'),
            'Model': raw_model,
            'Date Launched': year,
            'CPU name': c_cpu,
            'GPU Name': c_gpu_clean,
            'Base CPU': cpus[0] if cpus else "",
            'Base GPU': gpus[0] if gpus else "",
            'RAM size': row.get('RAM size', ''),
            'RAM Upgradable': row.get('RAM Upgradable', ''),
            'Total slots': row.get('Total slots', '')
        }
        tier_retail, tier_used = calculate_laptop_prices(cfg_pricing_row)

        cfg = {
            "name": config_name,
            "cpu": c_cpu,
            "cpuCoresThreads": cores_threads_formatted,
            "gpu": c_gpu_clean,
            "gpuTgp": tgp,
            "integratedGpu": row.get('Integrated GPU', ''),
            "maxRamCapacity": row.get('Max. ram size', ''),
            "ramSize": row.get('RAM size', ''),
            "ramType": row.get('RAM Type', ''),
            "ramClock": row.get('RAM Clock', ''),
            "ramUpgradable": row.get('RAM Upgradable', ''),
            "ramSlots": row.get('Total slots', 'None') if row.get('Total slots') else 'None',
            "displaySize": disp_size,
            "displayType": disp_type,
            "refreshRate": row.get('Refresh Rate', ''),
            "storageSize": storage_size_formatted,
            "storageBus": storage_bus,
            "storageType": storage_type_str,
            "storageUpgradable": row.get('Storage Upgradable', ''),
            "storageSlots": row.get('Storage Total slots', ''),
            "nvme": nvme,
            "batteryCapacity": row.get('Battery Capacity', ''),
            "usbCharging": row.get('Charging via USB (Power Delivery)', ''),
            "chargePower": row.get('Charge power', ''),
            "chassisMaterial": row.get('Material', ''),
            "originalPrice": tier_retail,
            "secondhandPrice": tier_used
        }
        configs.append(cfg)
        
    pros = []
    vc = row.get('Vapor Chamber', '') == 'Yes'
    lm = row.get('Liquid Metal', '') == 'Yes'
    fans = row.get('Number of Fans', '')
    
    thermal_parts = []
    if vc: thermal_parts.append("Vapor Chamber")
    if lm: thermal_parts.append("Liquid Metal Compound")
    if fans: thermal_parts.append(f"{fans}-Fan Cooling")
    
    if thermal_parts:
        pros.append(f"Advanced Thermal System: {' + '.join(thermal_parts)} for sustained high workloads")
        
    # NOTE: USB-C Power Delivery is explicitly REMOVED from Strengths per user instruction.
    
    opt = row.get('Nvidia Optimus', '')
    if opt in ['Optimus', 'MUX', 'Yes']:
        pros.append("NVIDIA Optimus & MUX Switch: Directly connects GPU to display for maximum gaming framerates")
        
    cons = []
    if row.get('RAM Upgradable', '') == 'No':
        cons.append("RAM is soldered to the motherboard and cannot be upgraded later")
        
    disp_sz_num = re.search(r'([\d\.]+)', row.get('Display Size', ''))
    if disp_sz_num and float(disp_sz_num.group(1)) <= 14:
        cons.append(f"Compact {disp_sz_num.group(1)}-inch screen requires getting close when working with split windows")

    model_obj = {
        "id": model_id,
        "name": model_name,
        "weight": weight,
        "cpuRange": cpu_range,
        "gpuRange": gpu_range,
        "scores": {
            "performance": 75 + (idx % 10),
            "gaming": 70 + (idx % 12),
            "display": 80 + (idx % 8),
            "battery": 60 + (idx % 10)
        },
        "configurations": configs,
        "pros": pros,
        "cons": cons
    }
    
    if series_id in series_dict:
        series_dict[series_id]['models'].append(model_obj)
    else:
        print(f"Warning: Series ID {series_id} not found in base series list")

# Count injected models
total_injected = sum(len(s['models']) for s in series_list)
print(f"Total series: {len(series_list)}, Total models injected: {total_injected}")
for s in series_list:
    if s['models']:
        print(f"  - {s['id']} ({s['name']}): {len(s['models'])} models")

# 3. Format JavaScript block cleanly
js_lines = ["const laptopSeriesData = ["]
current_brand = None

for s in series_list:
    if s['brand'] != current_brand:
        current_brand = s['brand']
        js_lines.append(f"    // {current_brand}")
        
    series_json = json.dumps(s, indent=4)
    # Indent JSON lines by 4 spaces
    indented_json = '\n'.join('    ' + line for line in series_json.splitlines())
    js_lines.append(indented_json + ",")

# Strip trailing comma on last series line
if js_lines[-1].endswith(','):
    js_lines[-1] = js_lines[-1][:-1]
    
js_lines.append("];")

full_js_block = '\n'.join(js_lines)

# 4. Save directly into data/laptopData.js
data_js_path = os.path.join(base_dir, "data", "laptopData.js")
with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write(full_js_block + '\n')

print(f"Successfully rebuilt data/laptopData.js!")
