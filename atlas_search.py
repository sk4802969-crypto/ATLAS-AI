import requests
from bs4 import BeautifulSoup
from html import unescape
from urllib.parse import quote

API = "https://en.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "ATLASAssistant/1.0 (learning project)"}

def search(query):
    response = requests.get(
        API,
        params={
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 5
        },
        headers=HEADERS,
        timeout=20
    )
    response.raise_for_status()
    return response.json().get("query", {}).get("search", [])

print("=== ATLAS AI ===")
print("Wikipedia search ready!")
print("Sawal likho. Band karne ke liye exit likho.")

while True:
    query = input("\nTumhara sawal: ").strip()

    if query.lower() in ("exit", "quit", "band"):
        print("ATLAS: Bye, Boss!")
        break

    if not query:
        continue

    try:
        results = search(query)

        if not results:
            print("ATLAS: Koi result nahi mila.")
            continue

        print("\nATLAS: Ye results mile:")
        for i, item in enumerate(results, 1):
            title = item["title"]
            snippet = BeautifulSoup(
                item["snippet"], "html.parser"
            ).get_text(" ", strip=True)

            print(f"\n{i}. {title}")
            print(unescape(snippet))
            print("https://en.wikipedia.org/wiki/" + quote(title.replace(" ", "_")))

    except Exception as e:
        print("ATLAS: Search error:", e)
