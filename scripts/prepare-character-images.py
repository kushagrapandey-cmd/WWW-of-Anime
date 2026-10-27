"""Download only reviewed manifest URLs, preserve proportions, strip metadata.
Requires Pillow. Run from repository root. Portraits share one identity across forms.
The source manifest records attribution, not a grant of image rights.
"""
import concurrent.futures, io, json, sys, time, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'src/data/character-images.json').read_text())

def prepare(item):
    identity, entry = item
    output = ROOT / 'public' / entry['image'].lstrip('/')
    small = ROOT / 'public' / entry['thumbnail'].lstrip('/')
    if output.exists() and small.exists() and '--force' not in sys.argv:
        return identity, 'cached'
    for attempt in range(3):
        try:
            request = urllib.request.Request(entry['sourceImage'], headers={'User-Agent': 'WWW-of-Anime portrait build'})
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read(5_000_001)
            if len(raw) > 5_000_000:
                raise ValueError('Source image exceeds 5 MB')
            image = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
            image.thumbnail((360, 480), Image.Resampling.LANCZOS)
            output.parent.mkdir(parents=True, exist_ok=True)
            image.save(output, 'WEBP', quality=82, method=6)
            image.thumbnail((144, 192), Image.Resampling.LANCZOS)
            image.save(small, 'WEBP', quality=78, method=6)
            return identity, 'ready'
        except Exception as error:
            if attempt == 2:
                return identity, str(error)
            time.sleep(attempt + 1)

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for identity, result in pool.map(prepare, manifest.items()):
            print(identity, result, flush=True)
