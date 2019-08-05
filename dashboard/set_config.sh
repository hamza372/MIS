#!/bin/bash

if [ ! -z ${API_HOST} ]; then
    cat <<END
    window.api_url = '${API_HOST}'
	window.version = '${SHA_VERSION}'
    window.username = '${USERNAME}'
    window.password = '${PASSWORD}'
END
fi
