#!/bin/bash

# Sai imediatamente se um comando falhar
set -e

# --- Variáveis (CONFIGURE AQUI) ---
GIT_REPO_URL="https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git"
PROJECT_DIR="painel-financeiro" # Nome da pasta que será criada após o clone

# 1. ATUALIZAR O SERVIDOR
echo "--- Atualizando pacotes do servidor ---"
sudo apt-get update
sudo apt-get upgrade -y

# 2. INSTALAR DEPENDÊNCIAS DO SISTEMA
echo "--- Instalando Git, Nginx, Node.js e npm ---"
sudo apt-get install -y git nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. CLONAR O PROJETO
echo "--- Clonando o repositório do projeto ---"
# Remove o diretório antigo se ele existir
if [ -d "$PROJECT_DIR" ]; then
  echo "Diretório do projeto existente encontrado. Removendo para um clone limpo."
  rm -rf "$PROJECT_DIR"
fi
git clone $GIT_REPO_URL

# 4. INSTALAR DEPENDÊNCIAS E CONSTRUIR O PROJETO
echo "--- Instalando dependências do projeto e construindo para produção ---"
cd $PROJECT_DIR
npm install
npm run build

# 5. CONFIGURAR O NGINX
echo "--- Configurando o Nginx para servir a aplicação ---"
# Cria um arquivo de configuração para o Nginx
# Ele irá servir os arquivos estáticos da pasta 'dist'
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root $(pwd)/dist;
    index index.html;

    server_name _;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Reinicia o Nginx para aplicar as novas configurações
sudo systemctl restart nginx

echo "--- Instalação concluída com sucesso! ---"
echo "Sua aplicação deve estar acessível no endereço IP da sua VPS."