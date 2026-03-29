#!/bin/bash
# Remove unnecessary sklearn files to fit Lambda limits
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])")

echo "Cleaning up sklearn..."
rm -rf "$SITE_PACKAGES/sklearn/datasets" || true
rm -rf "$SITE_PACKAGES/sklearn/*/tests" || true
rm -rf "$SITE_PACKAGES/sklearn/tests" || true
rm -rf "$SITE_PACKAGES/"*.dist-info/WHEEL || true
rm -rf "$SITE_PACKAGES/pip" || true
rm -rf "$SITE_PACKAGES/setuptools" || true

echo "Build size after cleanup:"
du -sh "$SITE_PACKAGES" || true
