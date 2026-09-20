"""Regenerate lossless native terrain quadrants from the same pinned source ZIP."""
from pathlib import Path
from PIL import Image, ImageChops
import json,sys,zipfile
root=Path(__file__).resolve().parents[1]
with zipfile.ZipFile(sys.argv[1]) as archive:
    source=Image.open(archive.open('img/wrld/APPALACHIA.jpg')).convert('RGB')
    if source.size!=(4096,4096):raise ValueError('Changed source dimensions: review bounds and tile generation before importing.')
    tiles=[]
    for row in range(2):
        for col in range(2):
            path=f'assets/maps/appalachia-native-{row}-{col}.webp'
            crop=source.crop((col*2048,row*2048,(col+1)*2048,(row+1)*2048))
            crop.save(root/path,lossless=True,method=4)
            assert ImageChops.difference(crop,Image.open(root/path).convert('RGB')).getbbox() is None
            tiles.append({'image':path,'bounds':[[(1-row)*2048,col*2048],[(2-row)*2048,(col+1)*2048]]})
file=root/'data/atlas.json';atlas=json.loads(file.read_text(encoding='utf-8'))
atlas['spaces']['2480661']['backgrounds']['native']={'name':'Terrain / source quality','tiles':tiles,'image':atlas['spaces']['2480661']['image'],'sourceImage':'img/wrld/APPALACHIA.jpg','note':'Source-quality terrain: lossless copies of the decoded source JPEG, loaded in four sections (~30 MB). Still 4096 × 4096 total; deep zoom magnifies source pixels, not new detail.'}
file.write_text(json.dumps(atlas,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Four quadrants generated and pixel equality verified.')
