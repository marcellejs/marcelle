import fs from 'fs';
import path from 'path';
// import { bold, green } from 'kleur/colors';
// import prompts from 'prompts';
// import { kebabCase, camelCase, pascalCase } from 'scule';
import { mkdirp } from './utils.js';
//
// const onCancel = () => {
// 	process.exit();
// };

var homeVar = '$HOME';

// var existBackend=false;
// var existPythonRayServe=false;

// export async function getProjectInfo(cwd: string) Promise<void>{
//
//
// }

export async function generateSystemUserScript(cwd: string): Promise<void> {
  let destination = path.join(cwd, 'deployment');
  mkdirp(destination);
  let scriptFile = `#!/bin/bash

# Note : this script assumes to be run with sudo permissions

# First create a system user (no home (-r) + unable to login (--shell to path nologin))
echo "Creating server user..."
useradd -r --shell /usr/sbin/nologin serverUser
echo "Done"

# Create a shared folder that the new user can access
echo "Creating and configuring a shared folder..."
mkdir /home/sharedFolder/

# Create a group where the system user is gonna be.
groupadd sharedFolderGroup
# add the system user to the group
usermod --append --groups sharedFolderGroup serverUser
# This group is gonna be the owner of the shared folder
chgrp sharedFolderGroup /home/sharedFolder
# restrict the permissions on the shared folder
chmod 1770 /home/sharedFolder/
echo "Done"
`;
  homeVar = '/home/sharedFolder';
  fs.writeFileSync(path.join(destination, `createSystemUser.sh`), scriptFile);
}

export async function generateNginxPM2Configs(
  cwd: string,
  hasSystemUser: boolean,
  hasBackend: boolean,
  hasPythonServer: boolean,
  modelServingFct: string,
  appName: string,
  gitPath: string,
  domainName: string,
): Promise<void> {
  let appPath = path.join(homeVar, appName);

  let scriptFile = `#!/bin/bash

# Note : this script assumes to be run with sudo permissions

TMP=$HOME
HOME=${homeVar}

# Install MongoDB
# https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-ubuntu/

# Import the public key
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
 sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
 --dearmor

# Create the list file.j
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload the package database
sudo apt-get update

# Download & Install MongoDB
sudo apt-get install -y mongodb-org

# Ensure MongoDB has the correct rights
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock

# /!\ Comment créer automatiquement la base MONGODB ??? /!\
# use preferenceDatabase
# db.createCollection("${appName}")


# Run MongoDB
sudo systemctl start mongod


#### CHECK MONGODB is Running
service mongod status
#mongosh

# ----------------------------------------------------
# Install NodeJS

# change installation folder to be local to the shared folder
export NVM_DIR="${homeVar}/.nvm"
# create the folder
mkdir ${homeVar}/.nvm

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
`;
  if (hasSystemUser) {
    scriptFile += `
# make the group control the nvm files
chgrp -R sharedFolderGroup ${homeVar}/.nvm
`;
  }

  scriptFile += `
# locate nvm
\. "${homeVar}/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# ----------------------------------------------------
# Install PNPM (for all users)
npm install -g pnpm

# ----------------------------------------------------
# Add Marcelle lib and compile it

cd ${homeVar}

# clone the repo & get on dev branch
echo "Cloning Marcelle..."
git clone https://github.com/marcellejs/marcelle.git
cd marcelle/
git checkout develop
echo "Done"

# DL deps & compile Marcelle
echo "Building Marcelle..."
pnpm i
pnpm build
echo "Done"

### check build sucessfull
#TODO

# ----------------------------------------------------
# Get your app and everything it needs

# Get App inside the correct folder
cd ${homeVar}
git clone ${gitPath}

# grab app dependencies
cd ${appPath}
pnpm i
# link marcelle dependencies
pnpm link ../marcelle/packages/core; pnpm link ../marcelle/packages/gui-widgets; pnpm link ../marcelle/packages/layouts; pnpm link ../marcelle/packages/devtools; pnpm link ../marcelle/packages/tensorflow; pnpm link ../marcelle/packages/backend

# build app
# Note : if top-level await is not available error => update vite.config.js of your project
pnpm build


# ----------------------------------------------------

# Install Nginx
sudo apt install nginx

# Create the sites-available and sites-enabled if they don't exist already
sudo mkdir -p /etc/nginx/sites-available/
sudo mkdir -p /etc/nginx/sites-enabled/

`;
  let nginxConfFile = `server {
	listen 80;

	server_name ${domainName};

	root /var/www/html;

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;
	location / {
	  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	  proxy_set_header X-Real-IP $remote_addr;
	  proxy_set_header Host $http_host;

	  proxy_http_version 1.1;
	  proxy_set_header Upgrade $http_upgrade;
	  proxy_set_header Connection "upgrade";

	  proxy_pass http://127.0.0.1:3000/;
	  proxy_redirect off;
	  proxy_read_timeout 240s;
	}

`;
  if (hasBackend) {
    nginxConfFile += `
	location /api/ {
      rewrite ^/api(/?)(.*) /$2 break;
      proxy_pass http://127.0.0.1:3030;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header HOST $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_pass_request_headers on;
      client_max_body_size 100M;
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header X-Content-Type-Options "nosniff" always;
      #add_header Access-Control-Allow-Origin https://ihm2023.marcelle.dev;
      #add_header Referrer-Policy "no-referrer-when-downgrade" always;
      add_header Content-Security-Policy "default-src * data: 'unsafe-eval' 'unsafe-inline'" always;
      # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
      # enable strict transport security only if you understand the implications
	}

`;
  }
  if (hasPythonServer) {
    nginxConfFile += `
  location /model/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header Host $http_host;

      #proxy_http_version 1.1;
      #proxy_set_header Upgrade $http_upgrade;
      #proxy_set_header Connection "upgrade";

      proxy_pass http://127.0.0.1:8000/;
      proxy_redirect off;
      proxy_read_timeout 240s;
  }

`;
  }
  nginxConfFile += `}`;

  let mainNginxConf = `user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	# multi_accept on;
}

http {
	include /etc/nginx/sites-enabled/*;

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;

	##
	# Gzip Settings
	##

	gzip on;

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	##
	# Virtual Host Configs
	##

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
`;

  scriptFile += `
# Create symbolic link in sites-enabled
sudo ln -s /etc/nginx/sites-available/${domainName}.conf ${domainName}
sudo rm default
`;
  if (hasPythonServer) {
    scriptFile += `
# ----------------------------------------------------
# python


# have to be sudo to install uv
cd ${homeVar}
mkdir uv

# change some env var to use uv in a separate folder:
export UV_UNMANAGED_INSTALL=${homeVar}/uv
export UV_PYTHON_INSTALL_DIR=$UV_UNMANAGED_INSTALL/python
export UV_CACHE_DIR=${homeVar}/.cache/uv

# Create an alias to use uv
alias uv=${homeVar}/uv/uv

# then install uv
curl -LsSf https://astral.sh/uv/install.sh | sh -s -- -v

# make the group control the uv files
chgrp -R sharedFolderGroup ${homeVar}/uv
chgrp -R sharedFolderGroup ${homeVar}/.cache

# Create a python venv
uv venv --python 3.13

# add pyproject.toml in app
cd ${homeVar}/rlhf-nlp-app
sudo touch pyproject.toml
`;
    var pyprojectFile = `[project]
name = "${appName}"
version = "0.1.0"
description = "Python server for Marcelle App"
readme = "README.md"
requires-python = "==3.13.*"
dependencies = [
  "ray[serve]",
	"transformers",
	"torch",
]
`;
    scriptFile += `
# update venv according to pyproject
uv sync

# go to the right folder and run ray serve
#cd src/
#${homeVar}/uv/uv run serve run serve_model:promptCompleter
`;
  }
  scriptFile += `
# ----------------------------------------------------
# Setup your PM2 project

# Install PM2 (for all users)
npm install pm2 -g

export PM2_HOME="${homeVar}/.pm2"

# ----------------------------------------------------
# Sanity checks :
# -> make the group owner of the sharedFolder
#chgrp -R sharedFolderGroup ${homeVar}
# build your app in case any change was done
cd ${homeVar}/${appName}
pnpm build


HOME=$TMP
# ----------------------------------------------------

# Running the app

# Locate npm & uv
#\. "${homeVar}/.nvm/nvm.sh"
#alias uv=${homeVar}/uv/uv
`;
  if (hasSystemUser) {
    scriptFile += `
#sudo -u serverUser bash -c 'source "${homeVar}/.nvm/nvm.sh" && pm2 start ecosystem.config.cjs'

### CHECK user run
#ps aux
`;
  } else {
    scriptFile += `
	#pm2 start ecosystem.config.cjs
`;
  }

  let ecosystemconfigFile = `module.exports = {
apps: [
  {
    name: '${appName}',
    script: 'serve',
    env: {
      PM2_SERVE_PATH: './rlhf-nlp-app/dist',
      PM2_SERVE_PORT: 3000,
      PM2_SERVE_SPA: true,
      PM2_SERVE_HOMEPAGE: '/index.html',
    },
  }`;
  if (hasBackend) {
    ecosystemconfigFile += `,
  {
	  name: '${appName}/api',
	  script: 'npm',
	  args: 'run backend',
	  cwd: './rlhf-nlp-app',
	  env: {
		  DEBUG: true,
		  NODE_ENV: 'production',
		  PORT: 3030,
		  MONGODB_URL: 'mongodb://127.0.0.1:27017/${appName}',
	  }
  }
`;
  }
  if (hasPythonServer) {
    ecosystemconfigFile += `,
	{
		name: '${appName}/model',
		script: 'uv',
		args: 'run serve run serve_model:${modelServingFct}',
		cwd: './rlhf-nlp-app/src',
		env: {

		}
	}
`;
  }
  ecosystemconfigFile += `],
}
`;

  let destination = path.join(cwd, 'deployment');
  mkdirp(destination);
  fs.writeFileSync(path.join(destination, `deployNginxPM2.sh`), scriptFile);
  fs.writeFileSync(path.join(destination, `nginx.conf`), mainNginxConf);
  fs.writeFileSync(path.join(destination, `${domainName}.conf`), nginxConfFile);
  fs.writeFileSync(path.join(destination, `ecosystem.config.cjs`), ecosystemconfigFile);
  if (pyprojectFile != null)
    fs.writeFileSync(path.join(destination, `pyproject.toml`), pyprojectFile);
}
