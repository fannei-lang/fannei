#!/bin/bash

# Check for Node.js installation
if command -v node >/dev/null 2>&1; then
    echo "Node.js is already installed: $(node -v)"
    exit 0
fi

echo "Detecting package manager..."

# Check for apt (Debian/Ubuntu)
if command -v apt-get >/dev/null 2>&1; then
    echo "Detected Debian/Ubuntu. Using apt..."
    sudo apt-get update
    sudo apt-get install -y nodejs npm

# Check for dnf (Fedora)
elif command -v dnf >/dev/null 2>&1; then
    echo "Detected Fedora. Using dnf..."
    sudo dnf install -y nodejs

# Check for nix-env (NixOS)
elif command -v nix-env >/dev/null 2>&1; then
    echo "Detected NixOS. Using nix-env..."
    nix-env -iA nixpkgs.nodejs

else
    echo "Error: Supported package manager (apt, dnf, or nix) not found."
    exit 1
fi

echo "Installation attempt complete."