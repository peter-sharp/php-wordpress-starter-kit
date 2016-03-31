#! /usr/bin/env bash

function install_phpmyadmin {
  echo 'Checking phpMyAdmin installed...'

  # variables

  mkdir -p /var/www/vendor

  # if a file does not exist...
  if [ ! -f /var/www/vendor/phpMyAdmin/config.inc.php ];
  then

    echo -e 'phpMyAdmin not found, \e[1m\e[34minstalling...\e[39m\e[0m'

    apt-get -y install phpmyadmin > /dev/null 2>&1

    echo -e "\n--- Configure Apache to use phpmyadmin ---\n"

    sed -i -e 's/^ *Listen 81 */ /' "/etc/apache2/ports.conf"

    echo -e "\n\nListen 81\n" >> /etc/apache2/ports.conf

    cat > /etc/apache2/conf-available/phpmyadmin.conf <<EOF
    <VirtualHost *:81>
        ServerAdmin webmaster@localhost
        DocumentRoot /usr/share/phpmyadmin
        DirectoryIndex index.php
        ErrorLog ${APACHE_LOG_DIR}/phpmyadmin-error.log
        CustomLog ${APACHE_LOG_DIR}/phpmyadmin-access.log combined
    </VirtualHost>
EOF
    a2enconf phpmyadmin > /dev/null 2>&1
    echo -e "\n--- \e[105mrestulting config \e[49m ---\n"
    cat /etc/apache2/ports.conf
    echo -e '\n ---------------------------------------- \n'
    cat /etc/apache2/conf-available/phpmyadmin.conf

    echo -e "\n--- Restarting \e[95mApache\e[39m ---\n"
    service apache2 restart #> /dev/null 2>&1
  fi
}

function import_mysql {
  echo "importing sql dumps..."
  FILES=/var/www/public/sql_dumps/*.sql
  for file in $FILES
  do
    echo "Importing $file ....."

    mysql -uroot -proot scotchbox < $file > import_log.tab
  done
}

install_phpmyadmin
import_mysql
