"""Import Column A titles and Column B hyperlinks from an Excel workbook."""
import json
import posixpath
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'

def extract(path):
    groups, skipped = [], 0
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(t.text or '' for t in x.iter(M+'t')) for x in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        def value(cell):
            if cell is None: return ''
            if cell.get('t') == 'inlineStr': return ''.join(t.text or '' for t in cell.iter(M+'t')).strip()
            v = cell.find(M+'v')
            if v is None: return ''
            return (strings[int(v.text)] if cell.get('t') == 's' else v.text or '').strip()
        rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).find(M+'sheets'):
            target = rels[sheet.get(R+'id')]
            name = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
            root = ET.fromstring(z.read(name))
            relpath = posixpath.dirname(name)+'/_rels/'+posixpath.basename(name)+'.rels'
            links = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read(relpath))} if relpath in z.namelist() else {}
            hyperlinks = {h.get('ref'): links.get(h.get(R+'id'), '') for h in root.iter(M+'hyperlink')}
            recipes, seen = [], set()
            for row in root.iter(M+'row'):
                cells = {re.sub(r'\d', '', c.get('r')): c for c in row.findall(M+'c')}
                title = value(cells.get('A'))
                if not title or title.upper() in ('RECIPE NAME', 'MADE', 'NOT MADE', 'RECIPE'): continue
                address = 'B'+row.get('r')
                url = hyperlinks.get(address) or value(cells.get('B'))
                cell = cells.get('B')
                formula = cell.find(M+'f') if cell is not None else None
                if formula is not None:
                    match = re.match(r'HYPERLINK\("([^"]+)"', formula.text or '', re.I)
                    if match: url = match.group(1)
                if url.startswith('www.'): url = 'https://'+url
                parsed = urlsplit(url)
                if parsed.scheme not in ('https', 'http') or not parsed.hostname or '.' not in parsed.hostname:
                    skipped += 1
                    continue
                key = (title, url)
                if key not in seen:
                    recipes.append({'title': title, 'url': url})
                    seen.add(key)
            if recipes: groups.append({'name': sheet.get('name'), 'recipes': recipes})
    if len(groups) < 3: raise ValueError('At least three tabs need a recipe with a valid web link.')
    return groups, skipped

if __name__ == '__main__':
    groups, skipped = extract(sys.argv[1])
    output = Path(__file__).resolve().parents[1] / 'dist/recipes.json'
    output.write_text(json.dumps(groups, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'tabs': len(groups), 'recipes': sum(len(g['recipes']) for g in groups), 'rows_without_valid_links': skipped, 'per_tab': {g['name']: len(g['recipes']) for g in groups}}))
