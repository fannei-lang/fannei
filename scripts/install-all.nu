def main [] {
    let os = $nu.os-info.name
    print $"Detecting system: ($os)"

    match $os {
        "windows" => {
            print "Using winget to install Node.js..."
            winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        }
        "macos" => {
            if (which brew | is-empty) {
                error make {msg: "Homebrew not found. Please install it at https://brew.sh"}
            }
            print "Using Homebrew to install Node.js..."
            brew install node
        }
        "linux" => {
            install-linux
        }
        _ => {
            print $"Unsupported OS: ($os)"
        }
    }
}

def install-linux [] {
    if not (which apt-get | is-empty) {
        print "Detected Debian/Ubuntu. Using apt..."
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    } else if not (which dnf | is-empty) {
        print "Detected Fedora. Using dnf..."
        sudo dnf install -y nodejs
    } else if not (which nix-env | is-empty) {
        print "Detected NixOS/Nix. Using nix-env..."
        nix-env -iA nixpkgs.nodejs
    } else {
        error make {msg: "No supported Linux package manager found (apt, dnf, or nix)."}
    }
}