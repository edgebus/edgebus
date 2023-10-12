#!/bin/sh
#

set -e

echo
echo "Launch EdgeBus console..."
echo

# sed -i "s/background-color:#fff !important/background-color:${PGADMIN_BG_COLOR} !important/g" /pgadmin4/pgadmin/static/js/generated/pgadmin.css
# if [ -z "${PGADMIN_BG_COLOR}" ]; then
# 	echo "A variable PGADMIN_BG_COLOR is not set" >&2
# 	exit 1
# fi


if [ "${1}" == "--use-ssl" ]; then
	echo "Starting the NGINX(secured)..."
	echo
	exec nginx -g "daemon off;" -c /etc/nginx/nginx-https.conf
else
	echo "Starting the NGINX(unsecured)... You may use '--use-ssl' command line argument to start NGINX in secured mode."
	echo
	exec nginx -g "daemon off;" -c /etc/nginx/nginx-http.conf
fi

