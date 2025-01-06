#!/usr/bin/env bash

if [ -f ./server/marker ]; then
  export DEV="Anton"
  cd server && ./marker
else
  echo "ERROR: No executable found."
  echo "       Try running 'make build' first"
fi
