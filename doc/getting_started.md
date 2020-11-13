# Getting Started

These instructions describe how to setup a local copy of the source code if you'd like to contribute or modify the project.
We assume you have a working knowledge of git, github and running commands from a terminal.


## Prerequisites

You'll need to install [Node.js](https://nodejs.org), which includes the `npm` command for managing dependencies.
If you already have `node.js` installed, make sure it is a recent version (`>= 9.x.x`). LTS versions are preferred.


## Copying assets

#### Buy a copy of the game

In order to be able to play the game locally, you need to have a copy of the original game assets.
For obvious legal reasons we can't include those in the repository.
You can obtain an original copy of the game from [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/).
If you own it already, make sure you updated your game installation to the latest.

#### Get a copy of the project
- [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) the [project](https://github.com/agrande/lba2remake) on github
- `git clone` your forked version of the project to get the code on your computer

#### Open the command shell
- Next commands are performed from your local copy's root folder.
- Use PowerShell in Windows, or Terminal in Mac

#### Installing the dependencies
- Run `npm install`

#### Import the game assets
- If you have _GoG_ or _Steam_ version of LBA 2, run the following import command to import game assets. If you have other version, or if you are on Linux, see [Manual Import](#manual-import) below.
- On Windows run `npm run import:win "<path to installed game>"`
Example: `npm run import:win "C:\games\Little Big Adventure 2"`
- On Mac run `npm run import "<path to installed GOG game>"`
Example: `npm run import "/Applications/Little Big Adventure 2 (Twinsen's Odyssey).app"`

If you are using the standalone GoG version on MacOS, you need to provide the path to an installed version of dosbox.
Example: `npm run import "/Applications/Little Big Adventure 2 (Twinsen's Odyssey).app" /Applications/dosbox.app`

## Running the development server

The development server is responsible for monitoring the source file and compiling them as they change.
It acts as a webserver which you point to from your browser to play the remake.

`npm run dev`

- If you have any troubles with `npm install` or with `npm run dev` try removing the package-lock.json and possible yarn.lock file as well as your node_module folder. Then run `npm install` and `npm run dev` again.

## Running the game

Just point your browser to the following url: _http://localhost:8080_
The first launch might take some time, but subsequent page refresh will be fast.

You can now start editing the code and refresh the page to see the result (the dev server compiles your changes almost instantly).

## What next?

Once your development environment is up and running, you can check the [architecture](architecture.md) guide to learn more about how the project is organized.

If you want to contribute to the project as an artist, you can check the [art workflow](art_workflow.md) document to learn about the art workflow.

## Manual Import

Only do this step if the import script failed (that means you have some other version than Steam or GoG. But if you have Steam or GoG version, make sure to update it to the latest before runing the import script, as it usually helps)

#### Copy the resource files

Musics, voices, sound samples and videos can't be read directly, they have to be converted to mp4 and aac files. We have a convert script, but before you need to copy the original files manually to the _www/data_

* Copy the *.HQR, *.OBL, *.ILE files and the VOX, MUSIC, VIDEO folders from the original game install folder to _www/data_
All those files can be inside an ISO image that comes with your game, so you need to extract them. But they all must be there.
* Music ends up in the _www/data/MUSIC_ folder
* Video hqr file ends up in the _www/data/VIDEO_ folder
* Voices (*.vox) end up in the _www/data/VOX_ folder
* The rest of the files end up in _www/data_ folder

#### Convert the videos and musics

Run convert scripts from the root game folder. On Windows run the scripts from PowerShell, on Mac use Terminal.
```
npm run convert music 128 32
npm run convert video
npm run convert voice 64
npm run convert samples 32
```

