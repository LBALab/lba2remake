#!/bin/sh
set -e
npm run unpack "$1"
npm run convert music 128 128
npm run convert video
npm run convert voice 128
npm run convert samples 128
