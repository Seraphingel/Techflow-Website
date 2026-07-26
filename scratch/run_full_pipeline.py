import sys
import os
import openpyxl
import subprocess

BASE_DIR = r"c:\Users\User\Documents\Coding\TechFlow"
ORGANIZER_DIR = r"C:\Users\User\Documents\Coding\TechFlow Data Organizer"

sys.path.append(ORGANIZER_DIR)
from nanoreview_parser import calculate_laptop_prices

def run_pipeline():
    print("==================================================")
    print(">>> TECHFLOW AUTOMATED DATA & PRICING PIPELINE <<<")
    print("==================================================")
    
    xlsx_path = os.path.join(ORGANIZER_DIR, "nanoreview_master.xlsx")
    
    # Step 1: Calculate & update prices in Excel sheet
    if os.path.exists(xlsx_path):
        wb = openpyxl.load_workbook(xlsx_path)
        ws = wb.active
        headers = [cell.value for cell in ws[1]]
        retail_col = headers.index('Retail Market Price') + 1
        used_col = headers.index('Estimated Used Price') + 1

        count = 0
        for r_idx in range(2, ws.max_row + 1):
            row_vals = [ws.cell(row=r_idx, column=c_idx).value for c_idx in range(1, len(headers) + 1)]
            rdata = dict(zip(headers, row_vals))
            retail, used = calculate_laptop_prices(rdata)
            ws.cell(row=r_idx, column=retail_col, value=retail)
            ws.cell(row=r_idx, column=used_col, value=used)
            count += 1
        wb.save(xlsx_path)
        print(f"[1/2] Recalculated dynamic prices for {count} rows in nanoreview_master.xlsx")

    # Step 2: Inject models into website HTML
    script_path = os.path.join(BASE_DIR, "scratch", "build_clean_laptop_data.py")
    res = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    print(res.stdout)
    print("[2/2] Successfully injected models into index.html")

if __name__ == "__main__":
    run_pipeline()
