#!/bin/bash

# 1. Check if Homebrew is installed, install it if not
if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for the current session (especially for Apple Silicon Macs)
    if [[ $(uname -m) == "arm64" ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "Homebrew is already installed."
fi

# 2. Update Homebrew (optional but recommended)
echo "Updating Homebrew..."
brew update

# 3. Check if Node.js is already installed
if brew list node >/dev/null 2>&1; then
    echo "Node.js is already installed via Homebrew."
else
    echo "Installing Node.js..."
    brew install node
fi

echo "Installation complete. Node version: $(node -v)"