#!/bin/bash
# Fetch all files from Harshverma8055/campusrate using GitHub API
OWNER="Harshverma8055"
REPO="campusrate"
BRANCH="main"
BASE_URL="https://api.github.com/repos/$OWNER/$REPO/git/trees/$BRANCH?recursive=1"
DEST="/home/gabbar/final project"

echo "Fetching file tree..."
TREE=$(curl -s "$BASE_URL")

echo "$TREE" | python3 -c "
import sys, json, os, urllib.request

data = json.load(sys.stdin)
items = data.get('tree', [])
dest = '/home/gabbar/final project'

for item in items:
    if item['type'] == 'blob':
        path = item['path']
        full_path = os.path.join(dest, path)
        # Skip binary-likely files based on extension for now, handle separately
        dir_path = os.path.dirname(full_path)
        os.makedirs(dir_path, exist_ok=True)
        url = f'https://raw.githubusercontent.com/Harshverma8055/campusrate/main/{path}'
        try:
            urllib.request.urlretrieve(url, full_path)
            print(f'OK: {path}')
        except Exception as e:
            print(f'FAIL: {path} -> {e}')
"
echo "Done!"
