$path = $args[0];
cd "$PSScriptRoot"

npm run unpack "$path"
if (-not $?) {throw "Failed to unpack"}

npm run convert "$path" music 128 128
if (-not $?) {throw "Failed to convert music"}

npm run convert "$path" samples 128
if (-not $?) {throw "Failed to convert samples"}

npm run convert "$path" voice 128
if (-not $?) {throw "Failed to convert voices"}

npm run convert "$path" video
if (-not $?) {throw "Failed to convert video"}
