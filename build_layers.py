"""Add licensed-source background choices and full source location coverage.
Standalone: python scripts/build_layers.py RELEASE.zip extracted/mappalachia.db
Also called by build_data.py. Requires Pillow; no network access.
"""
import json,sqlite3,zipfile,io,math,sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def enrich(atlas,db,archive):
    db.row_factory=sqlite3.Row
    z=archive if isinstance(archive,zipfile.ZipFile) else zipfile.ZipFile(archive)
    names=set(z.namelist())
    # Idempotent: preserve all original reference and destination IDs.
    atlas['records']=[r for r in atlas['records'] if r['category'] not in ('area','region','interior')]
    destinations=[r for r in atlas['records'] if r['category']=='location']
    for r in destinations:
        r['accuracy']='exact-map-marker'
        r['travelStatus']='not-exported'
    for s in atlas['spaces'].values():
        s['backgrounds']={'satellite':{'name':'Satellite / terrain','image':s['image'],'sourceImage':s['sourceImage'],
            'note':'Game-world overhead render. Best for precise point placement.'}}
    app=atlas['spaces']['2480661']
    for key,title,filename,note in [
        ('game','Illustrated game map','Appalachia_menu.jpg','In-game map artwork supplied in this release. Drawn landmarks are stylized; use satellite view for precise terrain.'),
        ('military','Military map','Appalachia_military.jpg','Alternate military map artwork supplied upstream. Labels and depicted geography may predate expansions; use satellite view for current terrain.')]:
        member='img/wrld/'+filename
        im=Image.open(io.BytesIO(z.read(member))).convert('RGB');im.thumbnail((4096,4096))
        output=f'assets/maps/appalachia-{key}.webp';im.save(ROOT/output,quality=86,method=4)
        app['backgrounds'][key]={'name':title,'image':output,'sourceImage':member,'note':note}
    # Named Location records carry cell associations, not an exact POI coordinate.
    byloc={}
    for cell in db.execute('select * from Cell order by locationFormID,x,y'):
        byloc.setdefault(cell['locationFormID'],[]).append((cell['x'],cell['y']))
    matched=0;unnamed=0
    for loc in db.execute('select * from Location order by locationFormID'):
        label=loc['locationDisplayName'].strip();sid=str(loc['spaceFormID'])
        if not label: unnamed+=1;continue
        cells=sorted(set(byloc[loc['locationFormID']]))
        normalize=lambda s:''.join(c for c in s.casefold() if c.isalnum())
        # Avoid hiding an unrelated location just because the label is shared.
        equivalent=[r for r in destinations if r['space']==sid and normalize(r['name'])==normalize(label)
                    and (math.floor(r['x']/4096),math.floor(r['y']/4096)) in cells]
        if equivalent:
            matched+=1
            for r in equivalent:r.setdefault('locationFormIds',[]);r['locationFormIds']=sorted(set(r['locationFormIds']+[f"{loc['locationFormID']:08X}"]))
            continue
        cx=sum(c[0] for c in cells)/len(cells);cy=sum(c[1] for c in cells)/len(cells)
        anchor=min(cells,key=lambda c:((c[0]-cx)**2+(c[1]-cy)**2,c))
        region=loc['locationEditorID'].lower().startswith(('region','subregion'))
        atlas['records'].append({'id':f"loc-{loc['locationFormID']:08X}",'category':'region' if region else 'area',
            'name':label,'area':label,'space':sid,'x':(anchor[0]+.5)*4096,'y':(anchor[1]+.5)*4096,
            'formId':f"{loc['locationFormID']:08X}",'editorId':loc['locationEditorID'],
            'accuracy':'representative-cell','travelStatus':'not-exported','cells':cells,
            'directions':f"Named {'region' if region else 'area'} from the game's Location table. This pin represents one of its {len(cells)} associated 4,096-unit map cells, not a verified entrance or fast-travel point. Selecting it outlines the source cells; those cells are coarse data associations, not surveyed boundaries."})
    for s in db.execute('select * from Space order by spaceFormID'):
        sid=str(s['spaceFormID'])
        if sid not in atlas['spaces']:
            member=f"img/{'wrld' if s['isWorldspace'] else 'cell'}/{s['spaceEditorID']}.jpg"
            target=f'assets/maps/{sid}.webp';has=member in names
            if has:
                im=Image.open(io.BytesIO(z.read(member))).convert('RGB');im.thumbnail((1536,1536));im.save(ROOT/target,quality=83,method=4)
            atlas['spaces'][sid]={'name':s['spaceDisplayName'],'editorId':s['spaceEditorID'],'world':bool(s['isWorldspace']),
                'cx':s['centerX'],'cy':s['centerY'],'range':s['maxRange'],'northAngle':s['northAngle'],
                'image':target if has else None,'sourceImage':member if has else None,
                'backgrounds':{'satellite':{'name':'Satellite / terrain','image':target if has else None,'sourceImage':member if has else None,'note':'Overhead render of this source space.'}}}
        if sid=='2480661':continue
        atlas['records'].append({'id':f"space-{int(sid):08X}",'category':'interior','name':s['spaceDisplayName'],
            'area':s['spaceDisplayName'],'space':sid,'x':s['centerX'],'y':s['centerY'],
            'formId':f"{int(sid):08X}",'editorId':s['spaceEditorID'],'accuracy':'map-center','travelStatus':'not-exported',
            'directions':"This is a map-directory entry at the source space's render center, not a door, item or travel destination. The source can include quest-specific, instanced and otherwise inaccessible spaces. Use this entry to explore the map and its available loot layers."})
    atlas['meta']['locationCoverage']={'mapMarkers':len(destinations),'locationRecords':db.execute('select count(*) from Location').fetchone()[0],'matchedLocationRecords':matched,
        'unnamedLocationRecords':unnamed,'additionalNamedRecords':sum(r['category'] in ('area','region') for r in atlas['records']),
        'spaces':len(atlas['spaces']),'travelEligibility':'Not available in this upstream export. No travel/non-travel guarantee is inferred.'}
    atlas['meta']['coverage']='All source map markers, all nonempty named Location records (deduplicated only against matching destination cells), all source spaces, and selected loot references. Not an exhaustive community catalog of unnamed scenery or live travel availability.'
    return atlas
if __name__=='__main__':
    db=sqlite3.connect(sys.argv[2]);atlas=json.loads((ROOT/'data/atlas.json').read_text(encoding='utf-8'))
    enrich(atlas,db,sys.argv[1]);db.close()
    (ROOT/'data/atlas.json').write_text(json.dumps(atlas,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'records':len(atlas['records']),**atlas['meta']['locationCoverage']},indent=2))
