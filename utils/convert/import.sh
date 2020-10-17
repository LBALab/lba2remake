#!/bin/sh
set -e
npm run unpack "$1" "$2"
npm run convert "$1" music 128 128
npm run convert "$1" samples 128
npm run convert "$1" voice 128
npm run convert "$1" video
