"""Google autocomplete for a country.

  python scripts/autocomplete.py py "vendo terreno urgente" "sucesion paraguay"
  python scripts/autocomplete.py bo "anticretico" "garzonier"

Prints what Google suggests to a searcher in that country (gl=py / gl=bo): evidence that locals type a phrase.
"""
import sys, json, time, urllib.request, urllib.parse

sys.stdout.reconfigure(encoding='utf-8')
gl = sys.argv[1]
for q in sys.argv[2:]:
    url = 'https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=%s&q=%s' % (gl, urllib.parse.quote(q))
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15).read()
        try:
            data = json.loads(raw.decode('utf-8'))
        except Exception:
            data = json.loads(raw.decode('latin-1'))
        print(q, '=>', ' | '.join(data[1][:10]) or '(no suggestions)')
    except Exception as e:
        print(q, '=> ERR', e)
    time.sleep(0.3)
