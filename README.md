# LBA2 Remake
A LBA2 / Twinsen's Odyssey reimplementation in JavaScript / Three.js / React

#### [Live demo](http://lba2remake.xesf.net) (or [Editor mode](http://lba2remake.xesf.net/#editor=true))

## Vision / goals

### Phase 1: Reimplement the LBA2 game engine
  * Should look and play like the original
  * Full re-engineering instead of dissassembly-based approach
  * Focus on code quality, make it easy to read and modify
  * __Milestones: [Gameplay 1](https://github.com/agrande/lba2remake/milestone/3), [Gameplay 2](https://github.com/agrande/lba2remake/milestone/5), [Gameplay 3](https://github.com/agrande/lba2remake/milestone/1), [Gameplay 4](https://github.com/agrande/lba2remake/milestone/4)__

### Phase 2: Make a HD version of the game
  * Improve graphics and gameplay in a way that preserves the original look & feel
  * More of a remastered version than a remake
  * Support more platforms and ways of playing
  * __Milestone: [HD Version](https://github.com/agrande/lba2remake/milestone/9), [Social gaming](https://github.com/agrande/lba2remake/milestone/12), [Virtual Reality](https://github.com/agrande/lba2remake/milestone/7), [Alternative versions](https://github.com/agrande/lba2remake/milestone/8)__

### Phase 3: Become a platform for modding and action/adventure game development
  * Progressively add tools to the editor to support mods
  * Have all tools grouped in a single integrated platform
  * __Milestones: [Modding 1](https://github.com/agrande/lba2remake/milestone/6), [Modding 2](https://github.com/agrande/lba2remake/milestone/11), [Modding 3](https://github.com/agrande/lba2remake/milestone/10)__


## Setup

* Make sure you own a copy of the original game: [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/)
* Copy the _*.HQR_, _*.OBL_, _*.ILE_ files and the _VOX_ folder from the original game install folder to _www/data_
* (TODO) Import the musics and videos as mp4 (no script available for that at this time)
* Download [Node.js](https://nodejs.org)
* Run _npm install_
* Run _npm run dev-server_
* Fire up your browser at page http://localhost:8080
* Enjoy!

## Community

* [Discord](https://discordapp.com/channels/152581994621042688/411620979719143425)
* [MBN forum](https://forum.magicball.net/showthread.php?t=18208)
