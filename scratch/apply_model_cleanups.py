"""
apply_model_cleanups.py
"""

with open('scratch/build_clean_laptop_data.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Add helper functions clean_model_title, clean_cpu_string, clean_gpu_string
clean_helpers = """
def clean_model_title(raw_model):
    if not raw_model: return ""
    # Strip any (...) containing model codes like (X1502), (GU606), (K6604, 2023), (12th Gen)
    cleaned = re.sub(r'\\s*\\([^)]*\\)', '', raw_model).strip()
    return cleaned

def clean_cpu_string(cpu):
    if not cpu: return ""
    cpu = cpu.replace('Qualcomm Snapdragon', 'Snapdragon').replace('Qualcomm ', 'Snapdragon ')
    cpu = cpu.replace('iUltra', 'Ultra').replace('Intel Core iUltra', 'Intel Core Ultra')
    return cpu.strip()

def clean_gpu_string(gpu):
    if not gpu: return ""
    gpu = gpu.replace('Qualcomm Snapdragon', 'Snapdragon').replace('Qualcomm ', 'Snapdragon ')
    gpu = gpu.replace('iUltra', 'Ultra')
    return gpu.strip()
"""

# Insert helpers before shorten_cpu
code = code.replace("def shorten_cpu(cpu):", clean_helpers + "\ndef shorten_cpu(cpu):")

# Update shorten_cpu to also clean Qualcomm and iUltra
code = code.replace("def shorten_cpu(cpu):\n    cpu = cpu.replace('AMD Ryzen ', 'R')", 
                    "def shorten_cpu(cpu):\n    cpu = clean_cpu_string(cpu)\n    cpu = cpu.replace('AMD Ryzen ', 'R')")

# Update shorten_gpu to also clean Qualcomm and iUltra
code = code.replace("def shorten_gpu(gpu):\n    gpu = gpu.replace('GeForce ', '')", 
                    "def shorten_gpu(gpu):\n    gpu = clean_gpu_string(gpu)\n    gpu = gpu.replace('GeForce ', '')")

# Add processed_keys set tracking before for idx, row loop
old_loop_start = "for idx, row in enumerate(rows, 1):"
new_loop_start = """processed_keys = set()
for idx, row in enumerate(rows, 1):"""

code = code.replace(old_loop_start, new_loop_start)

# Update model_name formatting and deduplication inside loop
old_row_processing = """    brand = row.get('Brand', 'ASUS').upper()
    raw_model = row.get('Model', '')
    year = row.get('Date Launched', '')
    
    if year and f"({year})" not in raw_model:
        model_name = f"{raw_model} ({year})"
    else:
        model_name = raw_model
        
    model_id = f"m-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}" """

new_row_processing = """    brand = row.get('Brand', 'ASUS').strip()
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

    model_id = f"m-{re.sub(r'[^a-z0-9]+', '-', model_name.lower()).strip('-')}" """

code = code.replace(old_row_processing.strip(), new_row_processing.strip())

# Clean CPUs and GPUs list processing
code = code.replace("cpus = [c.strip() for c in row.get('CPU name', '').split('\\n') if c.strip()]",
                    "cpus = [clean_cpu_string(c.strip()) for c in row.get('CPU name', '').split('\\n') if c.strip()]")
code = code.replace("gpus = [g.strip() for g in row.get('GPU Name', '').split('\\n') if g.strip()]",
                    "gpus = [clean_gpu_string(g.strip()) for g in row.get('GPU Name', '').split('\\n') if g.strip()]")

with open('scratch/build_clean_laptop_data.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated build_clean_laptop_data.py with user rules!")
