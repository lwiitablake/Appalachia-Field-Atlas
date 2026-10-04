from pathlib import Path
import sqlite3,json,hashlib,math,sys
root=Path(__file__).resolve().parents[1]
db=sqlite3.connect(sys.argv[1]);db.row_factory=sqlite3.Row
atlas=json.loads((root/'data/atlas.json').read_text(encoding='utf-8'))
atlas['records']=[r for r in atlas['records'] if r['category'] not in ('toiletpaper','plunger','safe')]
known={r['id'] for r in atlas['records']};spaces=atlas['spaces']
assert db.execute("select value from Meta where key='GameVersion'").fetchone()[0]==atlas['meta']['gameVersion'], 'Review game version before importing'
markers=[dict(r) for r in db.execute('select * from MapMarker')]
cells={(str(r['spaceFormID']),r['x'],r['y']):r['locationDisplayName'] for r in db.execute('select Cell.*,Location.locationDisplayName from Cell join Location using(locationFormID)')}
groups={};direct=[];excluded=0
query="""select p.*,e.editorID,e.displayName,e.signature from Position p join Entity e on e.entityFormID=p.referenceFormID where e.signature in ('MISC','CONT','ALCH','AMMO','ARMO','BOOK','NOTE','KEYM','WEAP','FLOR','FURN','TERM','DOOR','ACTI') and length(trim(e.displayName))>0 order by p.instanceFormID"""
for p in db.execute(query):
 sid=str(p['spaceFormID']);rid=f"ref-{p['instanceFormID']:08X}"
 if rid in known:continue
 if sid not in spaces:excluded+=1;continue
 name=p['displayName'];sig=p['signature'];editor=p['editorID']
 if sig=='MISC' and name=='Toilet Paper':cat='toiletpaper'
 elif sig=='MISC' and name=='Plunger':cat='plunger'
 elif sig=='CONT' and 'safe' in name.lower():cat='safe'
 else:cat='object'
 area=cells.get((sid,math.floor(p['x']/4096),math.floor(p['y']/4096))) or spaces[sid]['name']
 key=hashlib.sha256((sig+':'+name).encode()).hexdigest()[:16]
 record={'id':rid,'category':cat,'name':name,'area':area,'space':sid,'x':round(p['x'],4),'y':round(p['y'],4),'z':round(p['z'],4),'formId':f"{p['instanceFormID']:08X}",'baseId':f"{p['referenceFormID']:08X}",'editorId':editor,'lock':p['lockLevel'],'signature':sig,'itemKey':key,'directions':f'Source-placed {name} in {area}. Use the overhead crosshair and local coordinates. Access, activation and availability can depend on quests or world state; a placed record does not guarantee a usable or collectible object.'}
 if cat!='object':direct.append(record)
 else:
  group=groups.setdefault(key,{'id':key,'name':name,'signature':sig,'records':[]});group['records'].append(record)
atlas['records']+=direct
(root/'data/atlas.json').write_text(json.dumps(atlas,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
out=root/'data/interactables';out.mkdir(exist_ok=True)
catalog=[]
for key,g in groups.items():
 (out/(key+'.json')).write_text(json.dumps(g['records'],ensure_ascii=False,separators=(',',':')),encoding='utf-8');catalog.append({k:v for k,v in g.items() if k!='records'}|{'count':len(g['records'])})
(root/'data/interactables.json').write_text(json.dumps(sorted(catalog,key=lambda g:(g['name'].lower(),g['signature'])),ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(root/'data/interactable-ids.json').write_text(json.dumps(sorted(r['id'] for g in groups.values() for r in g['records']),separators=(',',':')),encoding='utf-8')
report={'baseline':'fe81934','checked':'2026-10-04','source':atlas['meta']['source'],'direct':{cat:sum(r['category']==cat for r in direct) for cat in ['toiletpaper','plunger','safe']},'catalogGroups':len(catalog),'catalogRecords':sum(g['count'] for g in catalog),'excludedUnknownSpaces':excluded,'signatures':['MISC','CONT','ALCH','AMMO','ARMO','BOOK','NOTE','KEYM','WEAP','FLOR','FURN','TERM','DOOR','ACTI']}
(root/'data/v3310-import-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
