# How to Contribute : Metadata

Metadata are additional names given to different elements of the game, that are not present in the original game's data files.

![Metadata](images/example_metadata.png)

We need metadata because:
 * It makes understanding the game's scripts easier
 * It helps us implement script commands better
 * It's an important step towards scripts _modding_

## How to edit metadata

 1. Get a local copy of the game on your computer [here is how!](./getting_started.md)
 2. Fire up the [editor](http://localhost:8080/#editor=true) and start a game.
 3. Close the editor areas you don't need (`Scripts` and `Debug HUD`):
 ![Close areas you don't need](images/close_areas.png)
 4. Browse the scenes with the `Locator` area:
 ![Browse the scenes](images/locator_area.png)
 5. Right click an actor or zone in the `Scene` area to rename it:
 ![Rename an element](images/rename.png)
 6. Rename the element and press `Enter`.
 7. Commit your changes on git and send us a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)

## Other metadata

You can also edit the model and animation names in the model editor.
Keep a watch as we'll be adding new elements of the game to be renamed.
