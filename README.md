# LBA1 & LBA2 Remake
A Little Big Adventure 1 & 2 / Twinsen's Adveneture / Twinsen's Odyssey reimplementation in Typescript / Three.js / React

#### [Live demo](https://www.lba2remake.net) (or [Editor mode](https://www.lba2remake.net/#editor=true))


### Support Original Game Series
Studio [2.21] is creating a Remastered version of Twinsen's Little Big Adventure. It is important for us to support them and you can do it so by buying the original games on [itch.io](https://itch.io/s/61876/adeline-software-collection), [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/) and wishlist the Remastered version on [Steam](https://store.steampowered.com/app/2318070/Twinsens_Little_Big_Adventure_Remastered/).

## Videos

* [Presenting the v0.5 update (2021)](https://www.youtube.com/watch?v=Ifa4C_R9pQc)
* [DXDeus Playthrough v0.5 (2021)](https://youtu.be/NvR5dS7ywdk)
* [Presenting the v0.4 update (2020)](https://www.youtube.com/watch?v=cZDVVcCLeY0)
* [Introducing the project (2020)](https://www.youtube.com/watch?v=6bAzSgZ0nD0)

## Vision / Goals

#### Phase 1: Reimplement the LBA1 and LBA2 game engine
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

![LBA1 Game Screenshot](doc/images/screenshot_game_lba1.png)
![LBA2 Game Screenshot](doc/images/screenshot_game.jpeg)

The editor mode allows navigating around the game scenes, inspecting scene content and variables, inspecting the game engine internal variables and debugging scripts (you can set breakpoints on actor scripts).

![Editor screenshot](doc/images/screenshot_editor.jpeg)

For more information, check the [FAQ](doc/FAQ.md).

## Contributing

Any help is very much appreciated!
Check the [How to Contribute](CONTRIBUTING.md) guide to know how to do that.
A list of current and past contributors can be found [here](AUTHORS.md).
There is a compreensive list of things [TODO](TODO.md) so feel free to pick one you like and start working on it.

## Getting started

(**[more details here](doc/getting_started.md)**)

* Make sure you own a copy of the original game: [itch.io](https://itch.io/s/61876/adeline-software-collection), [GOG](https://www.gog.com/game/little_big_adventure_2) or [Steam](http://store.steampowered.com/app/398000/Little_Big_Adventure_2/)
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

* [Discord](https://discord.gg/jsTPWYXHsh)
* [Discord 2.21](https://discord.gg/2xCu5Wag)
* [Discord Speedrun](https://discord.gg/PdKVPbPF)
* [MBN forum](https://forum.magicball.net/showthread.php?t=18208)
* Reddit: [r/linux_gaming](https://www.reddit.com/r/linux_gaming/comments/8049mn/a_little_big_adventure_2_twinsens_odyssey/) or [r/gamedev](https://www.reddit.com/r/gamedev/comments/80cn9u/open_source_reimplementation_of_little_big/)
* [Facebook](https://www.facebook.com/groups/twinsen/permalink/1565479966839300/)


## License

While the original Little Big Adventure 2 game executable, assets and intellectual property belong to [2.21], the code within this project is released under the [MIT License](LICENSE).
That being said, if you do anything interesting with this code, please let us know, we'd love to see it!
