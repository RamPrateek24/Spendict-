#!/usr/bin/env python3
import shutil
from pathlib import Path

# Remove unnecessary sklearn files after installation
site_packages = Path("/vercel/path0/.vercel/python/.venv/lib/python3.12/site-packages")

# Directories to remove
remove_dirs = [
    "sklearn/datasets",  # Not needed for inference
    "sklearn/ensemble",  # Keep only what model uses
    "sklearn/tests",
    "sklearn/externals",
    "pip",
    "setuptools",
    "wheel",
    "cython",
]

for dir_name in remove_dirs:
    dir_path = site_packages / dir_name
    if dir_path.exists():
        print(f"Removing {dir_name}...")
        shutil.rmtree(dir_path, ignore_errors=True)

print("Cleanup complete!")
