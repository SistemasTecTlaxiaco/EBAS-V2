#!/bin/bash
set -e

echo "=== Instalación automática de Soroban CLI y entorno Rust en Ubuntu (Bash) ==="

# 1. Actualizar repositorios e instalar dependencias básicas (sin pedir confirmación)
sudo apt-get update -y
sudo apt-get install -y curl build-essential git

# 2. Instalar Rust mediante rustup en modo desatendido
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# 3. Configurar variable de entorno para que rustup sea reconocible en Bash
source "$HOME/.cargo/env"

# 4. Añadir soporte para el target wasm32-unknown-unknown (requerido por Soroban)
rustup target add wasm32-unknown-unknown

# 5. Descargar e instalar Soroban CLI (versión 22.x+)
SOROBAN_VERSION="22.2.0"
ARCH="x86_64-unknown-linux-gnu"
SOROBAN_URL="https://github.com/stellar/soroban-tools/releases/download/v${SOROBAN_VERSION}/soroban-cli-${SOROBAN_VERSION}-${ARCH}.tar.gz"

echo "Descargando Soroban CLI versión $SOROBAN_VERSION..."
wget -q "$SOROBAN_URL"
tar -xvf "soroban-cli-${SOROBAN_VERSION}-${ARCH}.tar.gz"
sudo mv soroban /usr/local/bin/
sudo chmod +x /usr/local/bin/soroban
rm "soroban-cli-${SOROBAN_VERSION}-${ARCH}.tar.gz"

# 6. Verificar instalaciones
echo "=== Verificando instalación de Rust ==="
rustc --version || { echo "Error: Rust no se instaló correctamente"; exit 1; }
cargo --version || { echo "Error: Cargo no se instaló correctamente"; exit 1; }
rustup --version || { echo "Error: rustup no se instaló correctamente"; exit 1; }

echo "=== Verificando instalación de Soroban CLI ==="
soroban --version || { echo "Error: Soroban CLI no se instaló correctamente"; exit 1; }

echo "=== Verificando instalación de Git ==="
git --version

echo "=== Instalación completada correctamente ==="
