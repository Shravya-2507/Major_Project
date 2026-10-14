
from rag.retrieve import db

data = db.get(include=["metadatas"])
metadata = data["metadatas"]

vtu_sources = []

for item in metadata:
    source = item.get("source", "")
    if "VTU" in source.replace("\\", "/").upper():
        vtu_sources.append(source)

print("Total ChromaDB chunks:", len(metadata))
print("VTU chunks:", len(vtu_sources))
print("VTU PDF sources:")

for source in sorted(set(vtu_sources)):
    print(source)
