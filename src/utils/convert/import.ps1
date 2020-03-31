$path = $args[0];
cd "$PSScriptRoot"

npm run unpack "$path"
if (-not $?) {throw "Failed to unpack"}

npm run convert music 128 128
if (-not $?) {throw "Failed to convert music"}

npm run convert video
if (-not $?) {throw "Failed to convert video"}

npm run convert voice 128
if (-not $?) {throw "Failed to convert voices"}

npm run convert samples 128
if (-not $?) {throw "Failed to convert samples"}
