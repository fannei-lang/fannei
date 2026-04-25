# Check for Node.js existence first
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node.js is already installed: $(node -v)" -ForegroundColor Green
    exit
}

if ($IsWindows) {
    Write-Host "Detected Windows. Using winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
}
elseif ($IsMacOS) {
    if (-not (Get-Command brew -ErrorAction SilentlyContinue)) {
        Write-Error "Homebrew is not installed. Please install it from https://brew.sh"
        exit 1
    }
    Write-Host "Detected macOS. Using Homebrew..." -ForegroundColor Cyan
    brew install node
}
elseif ($IsLinux) {
    Write-Host "Detected Linux. Checking package managers..." -ForegroundColor Cyan
    
    if (Get-Command apt-get -ErrorAction SilentlyContinue) {
        Write-Host "Using apt..."
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    }
    elseif (Get-Command dnf -ErrorAction SilentlyContinue) {
        Write-Host "Using dnf..."
        sudo dnf install -y nodejs
    }
    elseif (Get-Command nix-env -ErrorAction SilentlyContinue) {
        Write-Host "Using nix-env..."
        nix-env -iA nixpkgs.nodejs
    }
    else {
        Write-Error "No supported package manager found (apt, dnf, or nix)."
        exit 1
    }
}
else {
    Write-Error "Unsupported Operating System."
    exit 1
}

Write-Host "Installation process finished." -ForegroundColor Green
