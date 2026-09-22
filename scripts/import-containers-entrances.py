import json,sqlite3,math,zipfile,io,hashlib,sys
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]; db=sqlite3.connect(sys.argv[1]);db.row_factory=sqlite3.Row
atlas=json.loads((root/'data/atlas.json').read_text(encoding='utf-8'));spaces=atlas['spaces']; source=atlas['meta']['source']
assert db.execute("select value from Meta where key='GameVersion'").fetchone()[0]==atlas['meta']['gameVersion'], 'Review the new game version before importing.'
atlas['records']=[r for r in atlas['records'] if r['category'] not in ['lunchbox','cooler']]
allspaces={str(r['spaceFormID']):dict(r) for r in db.execute('select * from Space')}
containers=[dict(r) for r in db.execute("select p.*, e.editorID,e.displayName from Position p join Entity e on p.referenceFormID=e.entityFormID where e.signature='CONT' and (e.displayName in ('Lunch Pail','Cooler','Chem Cooler') or e.editorID='Storm_CultistTunnels_SunnyLunchbox')")]
markers=[dict(r) for r in db.execute('select * from MapMarker')]
z=zipfile.ZipFile(sys.argv[2])
assert hashlib.sha256(z.read('data/mappalachia.db')).digest()==hashlib.sha256(Path(sys.argv[1]).read_bytes()).digest(), 'Database must match the supplied archive.'
for p in containers:
 sid=str(p['spaceFormID']);s=allspaces[sid]
 if sid not in spaces:
  img=f"img/{'wrld' if s['isWorldspace'] else 'cell'}/{s['spaceEditorID']}.jpg";target=f'assets/maps/{sid}.webp';has=img in z.namelist()
  if has:
   im=Image.open(io.BytesIO(z.read(img))).convert('RGB');im.thumbnail((1536,1536));im.save(root/target,quality=83)
  spaces[sid]={'name':s['spaceDisplayName'],'editorId':s['spaceEditorID'],'world':bool(s['isWorldspace']),'cx':s['centerX'],'cy':s['centerY'],'range':s['maxRange'],'northAngle':s['northAngle'],'image':target if has else None,'sourceImage':img if has else None}
 near=min((m for m in markers if m['spaceFormID']==p['spaceFormID']),key=lambda m:(m['x']-p['x'])**2+(m['y']-p['y'])**2,default=None)
 cat='lunchbox' if 'Lunch' in p['editorID'] and p['editorID']!='CambridgeConstructionLunchbox' else 'cooler'
 area=near['label'] if near else s['spaceDisplayName']
 directions=f"Placed {p['displayName'].lower()} container in {s['spaceDisplayName']}. "
 if near: directions+=f"About {round(math.hypot(p['x']-near['x'],p['y']-near['y'])):,} game units from the {near['label']} destination marker. "
 directions+='Use the overhead crosshair for the source position. This is generated placement context, not a verified room-level guide. Contents and access may vary.'
 atlas['records'].append({'id':f"ref-{p['instanceFormID']:08X}",'category':cat,'name':p['displayName'],'area':area,'space':sid,'x':p['x'],'y':p['y'],'z':p['z'],'formId':f"{p['instanceFormID']:08X}",'baseId':f"{p['referenceFormID']:08X}",'editorId':p['editorID'],'lock':p['lockLevel'],'directions':directions,'source':source})
# Reverse breadth-first propagation of sourced doors. Each interior gets its nearest
# door-chain to Appalachia, never a guessed coordinate transform or name match.
edges=[dict(r) for r in db.execute('select * from Position where teleportsToFormID is not null order by instanceFormID')]
anchors={}; frontier={'2480661':None}
for depth in range(len(allspaces)):
 nextlevel={}
 for e in edges:
  start,end=str(e['spaceFormID']),str(e['teleportsToFormID'])
  if start not in frontier or end=='2480661' or end in anchors or end in nextlevel or allspaces.get(end,{}).get('isWorldspace'):continue
  parent=frontier[start]; door=f"{e['instanceFormID']:08X}"
  nextlevel[end]={'space':'2480661','x':e['x'] if parent is None else parent['x'],'y':e['y'] if parent is None else parent['y'],'z':e['z'] if parent is None else parent['z'],'doorChain':([door] if parent is None else parent['doorChain']+[door]),'source':source,'method':'source-teleport-chain'}
 if not nextlevel:break
 anchors.update(nextlevel);frontier=nextlevel
(root/'data/interior-entrances.json').write_text(json.dumps(anchors,indent=2))
(root/'data/atlas.json').write_text(json.dumps(atlas,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
regions=json.loads((root/'data/regions.json').read_text(encoding='utf-8'))
for r in regions:
 if r['id']=='directory':r['interiors']=list(spaces)
 if r['id']=='appalachia':r['interiors']=sorted(set(r['interiors'])|set(anchors))
 if r.get('bounds'):
  x1,y1,x2,y2=r['bounds'];r['interiors']=sorted(set(r['interiors'])|{k for k,v in anchors.items() if x1<=v['x']<=x2 and y1<=v['y']<=y2})
for region in regions: region['interiors']=[sid for sid in region['interiors'] if sid in spaces]
(root/'data/regions.json').write_text(json.dumps(regions,indent=2))
details=json.loads((root/'data/details.json').read_text(encoding='utf-8'));details['ref-003C716E']['photos']=[p for p in details['ref-003C716E']['photos'] if p['path']!='assets/photos/community/issue-2/1.webp']
(root/'data/details.json').write_text(json.dumps(details,indent=2))
report={'containers':{k:sum(r['category']==k for r in atlas['records']) for k in ['lunchbox','cooler']},'linkedInteriors':len(anchors),'monongah':anchors.get('5807774'),'unmappedInteriorResources':sum(not spaces[r['space']]['world'] and r['space'] not in anchors and r['category'] not in ['interior','region','area','location'] for r in atlas['records'])}
(root/'data/v339-import-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
