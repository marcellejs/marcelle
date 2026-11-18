#!/bin/bash

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
