import urllib.request
import urllib.parse
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

def get_wikimedia_image(query, filename):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch={urllib.parse.quote(query)}&pithumbsize=800"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id in pages:
                    if 'thumbnail' in pages[page_id]:
                        img_url = pages[page_id]['thumbnail']['source']
                        urllib.request.urlretrieve(img_url, filename)
                        print(f"Downloaded {filename}")
                        return True
    except Exception as e:
        print(f"Failed {filename}: {e}")
    return False

get_wikimedia_image("filetype:bitmap hot dog dark", "c:/Users/User/Desktop/burguer/img-perro.jpg")
if not get_wikimedia_image("filetype:bitmap salchipapa", "c:/Users/User/Desktop/burguer/img-salchi-sencilla.jpg"):
    get_wikimedia_image("filetype:bitmap french fries meat", "c:/Users/User/Desktop/burguer/img-salchi-sencilla.jpg")
get_wikimedia_image("filetype:bitmap loaded fries", "c:/Users/User/Desktop/burguer/img-salchi-tradicional.jpg")
