# LBA2 Remake
![CircleCI](https://circleci.com/gh/LBALab/lba2remake.png?style=shield&circle-token=:circle-token)
![LatestTag](https://badgen.net/github/tag/LBALab/lba2remake)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/LBALab/lba2remake.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/LBALab/lba2remake/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/LBALab/lba2remake.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/LBALab/lba2remake/context:javascript)

A Little Big Adventure 2 / Twinsen's Odyssey reimplementation in Typescript / Three.js / React

#### [Live demo](https://www.lba2remake.net) (or [Editor mode](https://www.lba2remake.net/#editor=true))

## Videos

* [Presenting the v0.5 update (2021)](https://www.youtube.com/watch?v=Ifa4C_R9pQc)
* [Presenting the v0.4 update (2020)](https://www.youtube.com/watch?v=cZDVVcCLeY0)
* [Introducing the project (2020)](https://www.youtube.com/watch?v=6bAzSgZ0nD0)

## Vision / goals

#### Phase 1: Reimplement the LBA2 game engine
  * Should look and play like the original
  * Full re-engineering instead of dissassembly-based approach
  * Focus on code quality, make it easy to read and modify

#### Phase 2: Make a HD version of the game
  * Improve graphics and gameplay in a way that preserves the original look & feel
  * More of a remastered version than a remake
  * Support more platforms and ways of playing (ex: VR & Mobile)

#### Phase 3: Become a platform for modding and action/adventure game development
  * Progressively add tools to the editor to support mods
  * Have all tools grouped in a single integrated platform


## Status

Currently you can walk around every island and buildings of the original game.
Most of the graphic elements are implemented and part of the gameplay. It is not however completable at this point.

![Game screenshot](doc/images/screenshot_game.jpeg)

The editor mode allows navigating around the game scenes, inspecting scene content and variables, inspecting the game engine internal variables and debugging scripts (you can set breakpoints on actor scripts).

![Editor screenshot](doc/images/screenshot_editor.jpeg)

For more information, check the [FAQ](doc/FAQ.md).

## Contributing

Any help is very much appreciated!
Check the [How to Contribute](CONTRIBUTING.md) guide to know how to do that.
A list of current and past contributors can be found [here](AUTHORS.md).

## Getting started

(**[more details here](doc/getting_started.md)**)

* Make sure you own a copy of the original game: [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/)
* Download [Node.js LTS](https://nodejs.org) (if you already have node.js installed, make sure it is a recent version: `>= 9.x.x`)
* Clone the Git project and go to the root project folder in PowerShell on Windows or Terminal on Mac for the next commands.
* Run `npm install`
* Run `npm run import:win "<original game folder>"` on Windows or `npm run import "<original game folder>"` on Mac OS
  * Example Windows: `npm run import:win "c:\Games\Little Big Adventure 2"`
  * Example Mac OS: `npm run import /Applications/Little\ Big\ Adventure\ 2\ \(Twinsen\'s\ Odyssey\).app/`
* Run `npm run dev`
* Fire up your browser at page http://localhost:8080
* Enjoy!


## Community

* [Slack](https://join.slack.com/t/lba2remake/shared_invite/zt-4497ew6p-NxlmHoAWtG6lXDG9lW0NMA) - For development related discussions
* [Discord](https://discord.gg/cDmFTWq)
* [MBN forum](https://forum.magicball.net/showthread.php?t=18208)
* Reddit: [r/linux_gaming](https://www.reddit.com/r/linux_gaming/comments/8049mn/a_little_big_adventure_2_twinsens_odyssey/) or [r/gamedev](https://www.reddit.com/r/gamedev/comments/80cn9u/open_source_reimplementation_of_little_big/)
* [Facebook](https://www.facebook.com/groups/twinsen/permalink/1565479966839300/)


## License

While the original Little Big Adventure 2 game executable, assets and intellectual property belong to Didier Chanfray SARL, the code within this project is released under the [MIT License](LICENSE).
That being said, if you do anything interesting with this code, please let us know, we'd love to see it!
