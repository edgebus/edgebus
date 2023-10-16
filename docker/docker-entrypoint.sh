#!/bin/sh
#

set -e

if [ "${1}" == "--use-ssl" ]; then
	echo "Starting the NGINX(secured)..."
	echo
	exec nginx -g "daemon off;" -c /etc/nginx/nginx-https.conf
else
	echo "Starting the NGINX(unsecured)... You may use '--use-ssl' command line argument to start NGINX in secured mode."
	echo
	exec nginx -g "daemon off;" -c /etc/nginx/nginx-http.conf
fi

