import sys
from PIL import Image,ImageOps
Image.MAX_IMAGE_PIXELS=20000000
with Image.open(sys.argv[1]) as im:
 if im.format not in ('JPEG','PNG','WEBP'):raise ValueError('Only JPEG, PNG or WebP images are accepted.')
 if im.width*im.height>20000000:raise ValueError('Image exceeds 20 megapixels.')
 im.load();clean=ImageOps.exif_transpose(im).convert('RGB');clean.thumbnail((2000,2000))
 # New image omits EXIF/GPS and other source metadata.
 result=Image.new('RGB',clean.size);result.paste(clean);result.save(sys.argv[2],format='WEBP',quality=85)
