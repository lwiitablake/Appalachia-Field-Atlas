"""Build a pinned, attributed atlas from a Mappalachia release; no network calls.
Usage: python scripts/build_data.py /path/to/Mappalachia.zip
Requires Pillow. Run from the app directory. Read DATA-MAINTENANCE.md first.
"""
import sys, json, sqlite3, zipfile, tempfile, math, hashlib, io
from pathlib import Path
from PIL import Image
from build_layers import enrich

ROOT = Path(__file__).resolve().parents[1]
RELEASE = '2.0.5.2'
SOURCE = f'https://github.com/AHeroicLlama/Mappalachia/releases/tag/{RELEASE}'
def build(archive):
    z = zipfile.ZipFile(archive)
    with tempfile.TemporaryDirectory() as tmp:
        z.extract('data/mappalachia.db', tmp)
        db = sqlite3.connect(Path(tmp)/'data/mappalachia.db')
        db.row_factory = sqlite3.Row
        game = db.execute("select value from Meta where key='GameVersion'").fetchone()[0]
        if game != '1.7.26.13':
            raise ValueError('Unreviewed game version: update version constants and review mappings first.')
        spaces = {r['spaceFormID']: dict(r) for r in db.execute('select * from Space')}
        markers = [dict(r) for r in db.execute('select rowid,* from MapMarker')]
        cells = {(r['spaceFormID'],r['x'],r['y']):r['locationDisplayName'] for r in db.execute('select Cell.*,Location.locationDisplayName from Cell join Location using(locationFormID)')}
        records=[]
        categories = {
            'LPI_Loot_Bobbleheads':'bobblehead', 'LPI_Loot_Magazines':'magazine',
            'W05_Denizen_LPI_Loot_Magazines_Unstoppables':'magazine',
            'LPI_Loot_CapsStash_Tin':'caps', 'Loot_CapsStash_High':'caps',
            'Loot_CapsStash_Medium':'caps','Loot_CapsStash_Standard':'caps','Burn_Loot_CapsStash_Jackpot':'caps',
            'LPI_Ammo_FusionCore':'fusion','LPI_Ammo_FusionCore_Dmg50':'fusion',
            'LPI_PowerArmorFurniture_General':'armor','LPI_PowerArmorFurniture_General_Locked':'armor',
            'LPI_PowerArmorFurniture_Raider':'armor','LPI_PowerArmorFurniture_Raider_Locked':'armor',
            'LPI_PowerArmorFurniture_T45':'armor','LPI_PowerArmorFurnitureFrame_NoCore':'armor',
        }
        titles={'bobblehead':'Bobblehead','magazine':'Magazine','caps':'Caps stash','fusion':'Fusion core','armor':'Power armor'}
        for p in db.execute('select p.*,e.editorID from Position p join Entity e on p.referenceFormID=e.entityFormID order by p.instanceFormID'):
            cat=categories.get(p['editorID'])
            if not cat: continue
            s=spaces[p['spaceFormID']]
            nearby=[m for m in markers if m['spaceFormID']==p['spaceFormID']]
            near=min(nearby,key=lambda m:(m['x']-p['x'])**2+(m['y']-p['y'])**2) if nearby else None
            area=cells.get((p['spaceFormID'],math.floor(p['x']/4096),math.floor(p['y']/4096))) or (near['label'] if near else s['spaceDisplayName'])
            r={'id':f"ref-{p['instanceFormID']:08X}",'category':cat,'name':titles[cat],'area':area,
               'space':str(p['spaceFormID']),'x':round(p['x'],4),'y':round(p['y'],4),'z':round(p['z'],4),
               'formId':f"{p['instanceFormID']:08X}",'baseId':f"{p['referenceFormID']:08X}",'editorId':p['editorID'],'lock':p['lockLevel']}
            if near:
                dx,dy=p['x']-near['x'],p['y']-near['y']
                direction=['east','northeast','north','northwest','west','southwest','south','southeast'][round(math.atan2(dy,dx)/(math.pi/4))%8]
                r['directions']=f"The placed reference is {direction} of the {near['label']} map marker, about {round(math.hypot(dx,dy)):,} game units away in the horizontal plane. Follow the crosshair on the overhead image; elevation is {p['z']:,.0f} game units."
                r['nearest']=near['label']
            else:
                r['directions']=f"Inside {s['spaceDisplayName']} ({s['spaceEditorID']}). Follow the crosshair on this interior's overhead image. Local coordinates: X {p['x']:,.0f}, Y {p['y']:,.0f}, Z {p['z']:,.0f}. Different floors can share the same map position."
            records.append(r)
        for m in markers:
            # Coordinate identity is stable when unrelated upstream rows are inserted.
            identity=f"{m['spaceFormID']}:{m['label']}:{round(m['x'])}:{round(m['y'])}"
            records.append({'id':'place-'+hashlib.sha256(identity.encode()).hexdigest()[:16],'category':'location',
                'name':m['label'],'area':m['label'],'space':str(m['spaceFormID']),'x':m['x'],'y':m['y'],
                'directions':'Official map-marker position from the game data. This marks the named destination; individual loot points are shown separately.'})
        used=set(r['space'] for r in records)
        outspaces={}
        (ROOT/'assets/maps').mkdir(parents=True,exist_ok=True)
        for sid in sorted(used):
            s=spaces[int(sid)]
            imagepath=f"img/{'wrld' if s['isWorldspace'] else 'cell'}/{s['spaceEditorID']}.jpg"
            target=f'assets/maps/{sid}.webp'
            hasimage=imagepath in z.namelist()
            if hasimage:
                im=Image.open(io.BytesIO(z.read(imagepath))).convert('RGB')
                im.thumbnail((6144,6144) if s['spaceEditorID']=='APPALACHIA' else (1536,1536))
                im.save(ROOT/target,quality=83,method=6)
            outspaces[sid]={'name':s['spaceDisplayName'],'editorId':s['spaceEditorID'],
                'world':bool(s['isWorldspace']),'cx':s['centerX'],'cy':s['centerY'],'range':s['maxRange'],
                'northAngle':s['northAngle'],'image':target if hasimage else None,'sourceImage':imagepath if hasimage else None}
        meta={'release':RELEASE,'gameVersion':game,'source':SOURCE,'released':'2026-09-15',
            'reviewed':'2026-09-19','archiveSHA256':hashlib.file_digest(open(archive,'rb'),'sha256').hexdigest(),
            'coverage':'Placed references in the explicitly selected categories, plus map markers, across available worldspaces and interiors. Not a live server feed. Not every obtainable item or scripted spawn.',
            'rights':'Game data and imagery © Bethesda Softworks / ZeniMax. Mappalachia by AHeroicLlama and contributors; GPL-3.0 for their work, game assets distributed upstream on a stated fair-use basis. See SOURCES.md.'}
        output=enrich({'meta':meta,'spaces':outspaces,'records':records},db,z)
        (ROOT/'data/atlas.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        print(json.dumps({'records':len(output['records']),'spaces':len(outspaces),'categories':{k:sum(r['category']==k for r in output['records']) for k in [*titles,'location','area','region','interior']}},indent=2))
        db.close()
if __name__=='__main__': build(sys.argv[1])
