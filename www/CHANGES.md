# Twinsen's Odyssey
A Little Big Adventure 2 engine remake change log file

---

## Unreleased
### Added
* (Game) Voice playing hidden entries when normal entry ends.
### Fixed
* (Game) #162 Parsing HQR hidden entries.
* (Game) Scene 55 throwing exception with unavailable threejs object.

## 0.0.7 - 15.03.2018
### Added
* (Misc) #150 Improved metadata saving system

## 0.0.6 - 15.03.2018
### Added
* (Game) #65 Basic support for fan translations
* (Misc) Add crash reporting system
### Fixed
* (Game) #147 Issue introduced on move wait commands.
* (Game) #153 Interjection messages running the command multiple times.

## 0.0.5 - 11.03.2018
### Added
* (Game) #60 Multi-language support
* (Editor) #150 Allow editing metadata from the editor and save it server side.
### Fixed
* (Game) #147 Fixed incorrect move wait command being parsed. (Tim stuck at the Tavern)

## 0.0.4 - 26.02.2018
### Fixed
* (Game) Voice samples playing while displaying in-game menu
* (Game) Hide text dialog while displaying in-game menu
* (Game) Make menu clickable
* (Game) Fix warning in params parsing

## 0.0.3 - 13.02.2018
### Added
* (Game) Raw sprites from SPRIRAW.HQR file (eg. Magicball Twinsen's Secret Room)
* (Game) Updated font to match original game (thanks Jesiek)
* (Game) Main Menu - resume and new game
* (Game) In-Game Menu - Pause and resume game with in-game menu (Esc key)
* (Game) LBA2 Intro sequence on New Game
* (Game) Version code (toggle using V key)

### Fixed
* (Game) Color pallete of the dialogues frame (thanks Jesiek)
* (Game) Delay dialogue character appearance to sync better with voices (thanks Knappen)
* (Game) Multiple Music playing simultaneous

## 0.0.2 - 07.02.2018
### Added
* (Editor) Change log file.
* (Editor) Change log area in the editor (allow you to view this file)

### Fixed
* (Game) Key events cancelled on focus lose (eg. Windows Alt+Tab)
* (Game) Collision system to allow jump on cliffs
* (Game) Fixed Spider animation exception in Citadel Caves
* (Editor) Allow single area in editor, with no child areas

## 0.0.1 - 01.02.2018
* First public release
