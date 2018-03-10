# Getting Started

These instructions describe how to setup a local copy of the source code if you'd like to contribute or modify the project.
We assume you have a working knowledge of git, github and running commands from a terminal.


## Prerequisites

You'll need a recent version of [Node.js](https://nodejs.org) installed, which includes the `npm` command for managing dependencies.
 
If you already have node.js installed, make sure it is a fairly recent version (approx. released less than a year ago).


## Copying assets

#### Buy a copy of the game

In order to be able to play the game locally, you need to have a copy of the original game assets.
For obvious legal reasons we can't include those in the repository.
You can obtain an original copy of the game from [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/).

#### Copy the resource files

Assets are stored in the _*.HQR_, _*.OBL_, _*.ILE_ files in the game installation folder, as well as the _VOX_ folder.
You need to copy all those files to the _www/data_ folder of your local copy of the project repository.

#### Convert the videos and musics

Musics and videos can't be read directly, they have to be converted to mp4 files.
The remake can work without them, but if you want the complete thing you will have to convert them.
At this point, no script is available to perform this task automatically, but the necessary commands are documented in [this issue](https://github.com/agrande/lba2remake/issues/4).

* Musics end up in the _www/data/MUSIC_ folder
* Videos end up in the _www/data/VIDEO_ folder


## Installing the dependencies

Run `npm install` in your local copy's root folder.


## Running the development server

The development server is responsible for monitoring the source file and compiling them as they change.
It acts as a webserver which you point to from your browser to play the remake.

`npm run dev-server`


## Running the game

Just point your browser to the following url: _http://localhost:8080_

The first launch might take some time, but subsequent page refresh will be fast.

You can now start editing the code and refresh the page to see the result (the dev server compiles your changes almost instantaneously).
