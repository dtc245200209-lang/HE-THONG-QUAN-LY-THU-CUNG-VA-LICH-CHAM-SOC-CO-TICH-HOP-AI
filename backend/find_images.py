import requests

def get_commons_images(query, limit=5):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json"
    }
    headers = {"User-Agent": "PetCareTester/1.0"}
    res = requests.get(url, params=params, headers=headers).json()
    pages = res.get("query", {}).get("pages", {})
    results = []
    for p in pages.values():
        title = p.get("title", "")
        info = p.get("imageinfo", [{}])[0]
        file_url = info.get("url", "")
        if file_url:
            results.append((title, file_url))
    return results

categories = [
    ("Dry Dog Food Pack", "Royal Canin OR dog food bag"),
    ("Dry Cat Food Pack", "cat food dry OR Royal Canin cat"),
    ("Canned Dog / Cat Food", "canned cat food OR canned dog food OR cat food can"),
    ("Dog Toy", "dog toy chew OR rubber dog toy OR KONG"),
    ("Cat Tree / Scratch", "cat tree OR scratching post"),
    ("Pet Carrier", "pet carrier bag OR cat carrier"),
    ("Pet Bowl", "dog food bowl OR stainless steel pet bowl")
]

for cat_name, q in categories:
    print(f"\n=== {cat_name} ===")
    for title, u in get_commons_images(q, 4):
        print(f"{title} -> {u}")
