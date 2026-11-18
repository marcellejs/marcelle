# Deployment of a Marcelle Application using Nginx and PM2

Once your application is mature enough, you might want to deploy it so that other people can access it. This tutorial focuses on that in an Unix environment using common NodeJS deployment technologies (Nginx&PM2)

## Introduction

For this tutorial, we are going to take an example of a Marcelle App (called rlhf-nlp-app in this tutorial) composed of three elements:

- A main web client (created using Marcelle)
- A Marcelle Backend (running a mongoDB database) (cf. TODO)
- A python server delivering a machine learning model through the Ray library (cf. [server side inference](/guides/machine-learning-models/server-side-inference))

### Requirements

In order to follow this tutorial you will need :

- A working application that uses Marcelle
- A linux environment ready to host your application (in the case of this example we are using an Ubuntu 24 VM)
- A domain name to make it publicly accessible. In this tutorial we will use "vm-marcelle-test.fr"

## Method 1 : Using the Devtool

The Marcelle dev tool has a script to automatically generate the scripts and config files we might need. To launch the devtool go to your app folder and run :

```
npx marcelle
```

then choose "Prepare the deployment" then "Deploy my app with Nginx & PM2" then fill the form.
Once that is done the devtool should have generated 4-6 files in the "deployment" folder of your app (depending on what your app needs).

- createSystemUser.sh : a shell script to config the VM to be launched by a system user instead of a regular user (more secure)
- deployNginxPM2.sh : the main deployment script
- ecosystem.config.cjs : a config file to launch the PM2 app
- pyproject.toml : if your app uses a python server
- nginx.conf : the main nginx conf file
- "YourDomainName".conf : the nginx config file specific for our app

Now let's use those generated files and put them where they belong accordingly.

### Shell scripts

If you opted for deploying with a system user you should have 2 ".sh" scripts. First you should run the "createSystemUser.sh" script with the following command:

_Note : the following scripts assume that you have sudo permissions_

```sh
sudo ./ createSystemUser.sh
```

Once that is done you should then run the main install script :

```sh
sudo ./ deployNginxPM2.sh
```

This script will install a lot of things. Once this script is done running, we will need to add our config files to the correct folders.

### Config Files

### Nginx

Our script has made a fresh nginx install. We need to add our app in the right places to make it work.

- You have to add the following line in the http bloc of the /etc/nginx/nginx.conf :

```conf
include /etc/nginx/sites-enabled/*;
```

if you are not sure where to add it : a default nginx.conf file with this line added has been generated. You can also replace the nginx.conf file in etc/nginx by this file.

- Then in "etc/sites-available/" we should add our "YourDomainName.conf" file.
- make sure that in "etc/sites-enabled" there is a symbolic link called with your domain name (and that the "default" symbolic has been deleted)

### Project dependent files

#### Marcelle Backend

Depending on what your app is using, you might get different files. In general you won't need to do much for the code. If you have a backend, you will need to move your data need to be moved to the backend on your VM This can be done with [the mongodump and mongostore commands](https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/).

#### Python serving models

If you selected the option for using Python to serve ML models, the devtool will have install [the uv python project manager](https://docs.astral.sh/uv/). It will also have generated a basic pyproject.toml file with the dependencies required to serve ML models. This pyproject.toml file is basic and might not be required if you already have one in your project. If not it should be put at the root of your marcelle app.

### PM2

Then once Nginx is correctly configured and you have your marcelle app running locally on the VM, we will need to configure the PM2 project manager to launch all the required process for our app.
In order to do so, a PM2 config file called "ecosystem.config.cjs" has been generated. It goes in the folder holding both the Marcelle folder and your app.
Depending on if you are using a system user or not the command to launch PM2 will differ.
In the folder where the ecosystem.config.cjs file is located launch :

```sh
## IF YOU DON'T HAVE A SYSTEM USER
pm2 start ecosystem.config.cjs

## IF YOU HAVE A SYSTEM USER
sudo -u serverUser bash -c 'source "/home/sharedFolder/.nvm/nvm.sh" && pm2 start ecosystem.config.cjs'
```

if you get an error "pm2 is unknow"/"pm2 is not install - install it with sudo apt-get...", it is probably because your nodeJS is not launched by default. if that is the case, you will need to source nodeJS before launching PM2. in general nodeJS installs itself in the home (run `source ~/.nvm/nvm.sh`). If you are using a system user it should be in the shared folder that the system user can access.

Once that is done : you can check that the PM2 processes are launched by the correct user with the following command:

```sh
ps aux
```

An extra bonus step is to make PM2 launch the processes automatically on restart. You can do it by saving the current state of PM2 then launching it through a config script. More info [here](https://pm2.keymetrics.io/docs/usage/startup/).

## Method 2 : Manual step-by-step install

### Configuring the Linux environment

Before going into deployment we want to create a **system user** (a user with no home and unable to login) that will be running our application. This will ensure basic security towards any code-related security breach as the user running our app has basically no rights over the linux environment and no access to any data (except the application data).
In order to make things accessible to this system user we need to create a folder that he will be allowed to access. This is done by creating a group that owns a "shared folder". This is where we will put our application code and install our dependencies.

To do so we perform the following commands:

```sh
# Note : these commands assume to be run with sudo permissions

# First create a system user (no home (-r) + unable to login (--shell to path nologin))
useradd -r --shell /usr/sbin/nologin serverUser

# Create a shared folder that the new user can access
mkdir /home/sharedFolder/

# Create a group where the system user is gonna be.
groupadd sharedFolderGroup

# add the system user to the group
usermod --append --groups sharedFolderGroup serverUser

# This group is gonna be the owner of the shared folder
chgrp sharedFolderGroup /home/sharedFolder

# restrict the permissions on the shared folder
chmod 1770 /home/sharedFolder/
```

or download and run as sudo <a href="/script/setupSystemUser.sh" type="application/x-sh" download>this script</a>

### Deployment

#### Installing NodeJS

To install NodeJS we need to first install NVM (the Node Version Manager). NVM and NodeJS are by default installing themselves in the user's home directory. Because our system user doesn't have one we need to change the installation directory to the shared folder. We will also need pnpm to build Marcelle so we also install it.

```sh
# Note : some of these commands assume to be run with sudo permissions

# change installation folder to be local to the shared folder
export NVM_DIR="/home/sharedFolder/.nvm"
# create the folder
mkdir /home/sharedFolder/.nvm

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# make the group control the nvm files
chgrp -R sharedFolderGroup /home/sharedFolder/.nvm

# locate nvm for the current shell session
\. "/home/sharedFolder/.nvm/nvm.sh"

# Download and install Node.js 24 :
nvm install 24

# Install PNPM (for all users)
npm install -g pnpm
```

#### Building Marcelle

We will need Marcelle for our app to run. So we clone and build it with the following commands:

::: warning Development version
The following steps are currently required for deploying the dev version of Marcelle

```sh
# clone the repo & get on dev branch
git clone https://github.com/marcellejs/marcelle.git
cd marcelle/
git checkout develop

# DL deps & compile Marcelle
pnpm i
pnpm build
```

:::

#### Installing MongoDB for the backend

If your Marcelle app has a backend, you will need MongoDB (_you can skip this section if you don't have one_). The following commands are standard install commands from [the official mongdb website](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-ubuntu/).

```sh
# Import the public key
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Create the list file.
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload the package database
sudo apt-get update

# Download & Install MongoDB
sudo apt-get install -y mongodb-org

# Ensure MongoDB has the correct rights
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

Then run MongoDB:

```sh
sudo systemctl start mongod
```

_Note: after installing MongoDB, you will need to import your current data into the newly created MongoDB database. This can be done with [the mongodump and mongostore commands](https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/)_.

#### Installing the Python server with uv

This part is only required if your Marcelle app is using python and this example focuses on serving a machine learning model through ray.
We will work with the 'uv' python project manager.
First we will create a local directory to install uv in the sharedFolder for our server user.
Then we export local variables to make a local install (an give the right permissions).

```sh
# sudo to install uv
mkdir /home/sharedFolder/uv

# change some env var to use uv in a separate folder:
export UV_UNMANAGED_INSTALL=/home/sharedFolder/uv
export UV_PYTHON_INSTALL_DIR=$UV_UNMANAGED_INSTALL/python
export UV_CACHE_DIR=/home/sharedFolder/.cache/uv

# Create an alias to use uv
alias uv=/home/sharedFolder/uv/uv

# then install uv
curl -LsSf https://astral.sh/uv/install.sh | sh -s -- -v

# make the group control the uv files
chgrp -R sharedFolderGroup /home/sharedFolder/uv
chgrp -R sharedFolderGroup /home/sharedFolder/.cache
```

Then once uv is installed we setup our project.

```sh
# Create a python venv
uv venv --python 3.13

# add pyproject.toml in app
cd /home/sharedFolder/rlhf-nlp-app
sudo touch pyproject.toml
echo '[project]
name = "rlhf-app"
version = "0.1.0"
description = "Python server for Marcelle App"
readme = "README.md"
requires-python = "==3.13.*"
dependencies = [
   "ray[serve]",
   "transformers",
   "torch",
]' > pyproject.toml

# get deps & update venv according to pyproject
uv sync
```

#### Download your app

Then once the technologies you need are properly installed, you can install your marcelle application.

```sh
cd /home/sharedFolder/
# note : clone your repo
git clone ..../rlhf-nlp-app

# Go into our app and install dependencies
cd rlhf-nlp-app/
pnpm i

# build app
pnpm build
```

::: warning Development version
The following steps are currently required for deploying you app with the dev version of Marcelle

```sh

# link marcelle dependencies
pnpm link ../marcelle/packages/core; pnpm link ../marcelle/packages/gui-widgets; pnpm link ../marcelle/packages/layouts; pnpm link ../marcelle/packages/devtools; pnpm link ../marcelle/packages/tensorflow; pnpm link ../marcelle/packages/backend

# build app
pnpm build
```

_Note : if when building you get an error "top-level await is not available" you will need update vite.config.js of your project with the following value_

```js
esbuild: {
	supported: {
		'top-level-await': true
	},
}
```

:::

#### Automate launching the app with the PM2 process manager

First let's install PM2

```sh
# Install PM2 (for all users)
npm install pm2 -g
```

_Note : Because we have installed NodeJS locally, every package installed with NodeJS is also going to be installed locally._
Then we create a build file. It has to be installed in the /home/sharedFolder directory. We create a file called "ecosystem.config.cjs". Here is the content of that file :

```js
module.exports = {
  apps: [
    {
      name: 'rlhf-nlp-app',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './rlhf-nlp-app/dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: true,
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
    },
    {
      name: 'rlhf-nlp-app/api',
      script: 'npm',
      args: 'run backend',
      cwd: './rlhf-nlp-app',
      env: {
        DEBUG: true,
        NODE_ENV: 'production',
        PORT: 3030,
        MONGODB_URL: 'mongodb://127.0.0.1:27017/rlhf-nlp-app',
      },
    },
    {
      name: 'rlhf-nlp-app/model',
      script: 'uv',
      args: 'run serve run serve_model:promptCompleter',
      cwd: './rlhf-nlp-app/src',
      env: {},
    },
  ],
};
```

Then we launch our processes with PM2 :

```sh
pm2 start -u serverUser ecosystem.config.cjs
```

#### Reverse Proxy with Nginx

Now that our app is ready to run locally, we need to make it accessible through the outside world.
First we install Nginx:

```sh
# Install Nginx
sudo apt install nginx
```

_Note: because nginx will install itself in /etc/, it will be accessible to our system user and we don't need to make a local install._
Then we need to create a site to be hosted in Nginx config files:

```sh
HOSTNAME="vm-marcelle-test.fr"

# Create the sites-available and sites-enabled if they don't exist already
sudo mkdir -p /etc/nginx/sites-available/
sudo mkdir -p /etc/nginx/sites-enabled/

# create their nginx.conf
sudo touch /etc/nginx/sites-available/"$HOSTNAME.conf"
```

In that file we just created, we will add all the reachable locations of our app:

```sh
server {
	listen 80;

	server_name vm-marcelle-test.fr;

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
}
```

_Note: Also make sure to update the code that might contain some "localhost:8000" or "localhost:3030" to actually use the hostname._

Now that our site is available in config, we need to enable it. To make that we need to create a symbolic to our config file in the "/sites-enabled/" folder. We also need to remove the default enabled site (by removing the link).

```sh
cd /ect/nginx/sites-enabled/
# Create the symbolic link to tell nginx to enable our site
sudo ln -s /etc/nginx/sites-available/"$HOSTNAME.conf" $HOSTNAME

# remove the site enabled by default
sudo rm default
```

Once that is done, we need to include "/sites-enabled/" in our main nginx.conf file. Open the file "/etc/nginx/nginx.conf" and add the following line in the 'http' block of the conf file:

```sh
include /etc/nginx/sites-enabled/*;
```

#### Sanity checks

Here are some sanity checks to make sure everything is running and correctly configured:

- run 'mongod status' to make sure mongodb is running
- go to your app folder and bmake sure it builds with the command 'pnpm build'
- run 'pm2 status' to check the status of your processes
- make sure the server user have access to the shared folder. Run 'chgrp -r sharedFolderGroup /home/sharedFolder'
- if you or a given user can't use npm in shell : make sure to locate npm for for that user (for the lifespan of that console with) the command '\. "/home/sharedFolder/.nvm/nvm.sh"'
- Similarly uv can be alias to be more accessible : 'alias uv=/home/sharedFolder/uv/uv'
