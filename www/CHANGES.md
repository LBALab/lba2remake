# Twinsen's Odyssey
A Little Big Adventure 2 engine remake change log file

---
## Unreleased
### Added
### Fixed

## 0.0.9 - 29.03.2018
### Added
* (Game) Isometric camera now follows Twinsen
#### Editor ergonomics
* (Editor) #168 Keyboard shortcut for renaming (F2)
* (Editor) #170 Toggle actor visibility directly from actor eye icon in scene outliner
* (Editor) #156 Locating objects with right click menu or double click (only in isometric scenes for now)
* (Editor) Visually distinguish main area from dependent areas
#### Other
* (Editor) #3 New metadata (thanks Jeffrey Veenhuis)
### Fixed
* (Editor) #177 Reset free camera position when switching scenes
* (Editor) #175 Broken "Find all references" button
* (Editor) #166 Broken scripting are on Firefox
* (Editor) #167 Broken area resizing on Firefox
* (Editor) Fix for crash in scripting area (React) when switching scenes

## 0.0.8 - 23.03.2018
### Added
* (Game) Voice playing hidden entries when normal entry ends.
* (Game) #94 Disable scene switching in normal game mode (keep it in the editor).
* (Editor) #3 New metadata (thanks Jeffrey Veenhuis)
### Fixed
* (Game) #162 Parsing HQR hidden entries.
* (Game) Scene 55 throwing exception with unavailable threejs object.
* (Game) #160 Fix game sometimes being paused when swithcing scenes.
* (Game) #159 Display custom error message when WebGL is not supported.
* (Game) #158 Crash when loading scene 120.
* (Editor) #163 Directly navigating to another scene while in the menu now works.
* (Editor) Trailing parentheses in some locator nodes.

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
