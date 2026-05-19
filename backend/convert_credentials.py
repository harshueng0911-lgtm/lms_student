import json

with open("credentials.json") as f:
    data = json.load(f)

print(json.dumps(data))