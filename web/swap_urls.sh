#!/bin/bash

if [ ! -z ${API_HOST} ]; then
    cat <<END
    window.api_url = '${API_HOST}'
END
fi

