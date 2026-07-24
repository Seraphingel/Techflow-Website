"""
modularize_html.py
"""

with open('techflow_journal.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

html_head_body = "".join(lines[0:211])

style_start = html_head_body.find('<style>')
style_end = html_head_body.find('</style>') + len('</style>')

clean_html = html_head_body[:style_start] + '<link rel="stylesheet" href="css/styles.css">' + html_head_body[style_end:]
clean_html += '\n    <!-- External Data & App Logic Scripts -->\n    <script src="data/laptopData.js"></script>\n    <script src="js/app.js"></script>\n</body>\n</html>\n'

with open('techflow_journal.html', 'w', encoding='utf-8') as f:
    f.write(clean_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(clean_html)

print("Slimmed down techflow_journal.html and index.html successfully!")
