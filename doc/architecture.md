# Architecture

This document describes the [technologies](#Technologies) used, [design principles](#design-principles) and [code architecture](#code-architecture) of the LBA2 remake project.


## Technologies

The project runs in a browser and relies on modern web technologies, in particular the [JavaScript](https://developer.mozilla.org/bm/docs/Web/JavaScript) language ecosystem, [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (through [three.js](https://threejs.org/)) for 3D rendering, and [React](https://reactjs.org/) for user interfaces.

Using JavaScript does not limit us to run the game in a traditional web browser. We have plans to make standalone versions for the desktop, mobile and console platforms.

There are prototypes of mobile apps for Android, iOS and Windows 10 in the apps folder.

### JavaScript

[JavaScript](https://developer.mozilla.org/bm/docs/Web/JavaScript) is an evolving language, and new features are added every year.

We use next generation JavaScript, along with some language extensions like ([JSX](https://reactjs.org/docs/introducing-jsx.html) that provide important features which are not (yet) available in most browsers.

We also use the [NPM](https://www.npmjs.com/) package manager to easily take advantage of various libraries that boost our development process (check our `package.json` to see these).

For these reasons, we rely on a compiler that transforms our variant of JavaScript into something that all browsers can understand.

This is the role of the dev server.

#### Dev Server

When running the `npm run dev` command, you are launching a web server that uses [webpack](https://webpack.js.org/) to take the various source files that constitute the project, transform them, and bundle them into a single `bundle.js` file to be used by the web browser.

Webpack watches all the project source files, so that if you change any of them, it will be instantly recompiled and error-checked (using [ESLint](https://eslint.org/)). Simply refreshing the web page will automatically fetch the newly compiled bundle.

Beyond just JS, webpack also transforms other types of source files for us, like shaders ([GLSL](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)) and configuration files ([JSON](https://www.json.org/) and [YAML](http://yaml.org/)). This is done using webpack loaders (check `webpack.config.js` to see which loaders we use).

The actual job of transpiling JavaScript (compiling into an older version of the language) is handled by [babel](https://babeljs.io/) under the hood, and the configuration for this is done in `.babelrc`.

#### Typescript & ESLint

JavaScript by default is a _permissible_, _dynamically typed_ language. This is great when prototyping new features. It helps us going from an idea to a working prototype much faster than if we had to use a language like _C++_, _Java_ or _C#_.

However, this comes at a cost: as the project grows, [dynamic typing](https://developer.mozilla.org/en-US/docs/Glossary/Dynamic_typing) and lack of compile-time error checking means more bugs and regressions. It also means that the code quickly becomes hard to read and maintain.

To avoid this, we use 2 different tools:

* [[TypeScript](https://www.typescriptlang.org/)
* [ESLint](https://eslint.org/) checks for common errors at compile-time, and makes sure we use a consistent style, making our code easier to read and understand. We rely on a set of rules provided by the widely used [AirBnB config](https://github.com/airbnb/javascript) that we've adapted to our needs.

As it is important for us to preserve our ability to try things out and prototype new features quickly, we intend to use Typescript only on stabilized parts of the code where we expect slower changes (at this point we're not using it where we should).

ESLint errors and warnings don't prevent the code from compiling and there are no git hooks to prevent you from committing when there are errors. We don't want to discourage you from contributing!

This is all meant to be a gradual code quality process.

### WebGL & three.js

A game engine requires a graphics library to perform its rendering. LBA2 Remake's main graphics library is [three.js](https://threejs.org/), which is the most widely used, battle-tested 3D library on the web platform.

Three.js uses [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) under the hood to talk directly to your computer or phone's GPU.

We are actually not using _three.js_ extensively, in particular, we are implementing our own custom shaders, bypassing _three.js_' built-in shaders entirely.
Also, we are not taking much advantage of its [scene graph](https://en.wikipedia.org/wiki/Scene_graph).

This means we could - at this point - relatively easily get rid of it, and replace it by our own custom 3D engine. This could make portability to devices like the _Nintendo Switch_ (which doesn't support WebGL) more feasible.

There are some advantages to keep using it though, like readily available **vector** and **matrix** operations, easier support for Virtual Reality, common 3D formats, well-known shading techniques, post-processing effects, (etc).

### React

[React](https://reactjs.org/) is a great library for building user interfaces. It relies on a declarative paradigm which makes our code more predictable and easier to debug. This is particularly useful when building the **editor**.


## Design Principles

(...)


## Code Architecture

(...)

## Project Structure

The project follows a conventional structure of a modern web application with small nuances.

The `www` folder is the root of the web application, and you can find all the project assets. It includes the original game assets under a `data` folder, the editor icons, the engine metadata, our remake binaries like 3D models and textures, configuration files and other assets like fonts and stylesheets.

The `assetsSource` contains the remake source files for our 3D models and textures. You can find more details in the [art workflow](art_workflow.md).

The `utils/convert` holds a sets of scripts we used to dump the game original files from GOG and Steam versions of the games. Instructions on how to dump the files can be found under [getting started](getting_started.md) guide.

The `src` folder is where the engine code is located and we will describe a bit more in details below.

If you are a developer or just interesting of learning a bit more about this project, a good place to start would be understanding how the Little Big Adventure High Quality Resources (HQR) file format works.

### Resources
The specification of the HQR file format can be found [here](http://lbafileinfo.kazekr.net/index.php?title=High_quality_resource) and our  reader implementation in the [hqr.ts](../src/hqr.ts) file.

HQR is a container with multiple other file formats inside. We have created a set of parsers which can deal with each file type. The parsers can be found in the [resources/parsers](../src/resources/parsers) folder.

Not every file type has been documented yet, but you can find the majority them at [lbafileinfo](http://lbafileinfo.kazekr.net/index.php?title=File_formats_by_purpose).

Since the engine works for both LBA1 and LBA2 games and we want to keep both games compatible and avoid introducing exceptions, we have created a resource configuration where all the resource types are configured. You can find them in the [www/resources](../www/resources) folder. These configurations are loaded at start of the game, depending which game you are playing (lba2 as default) and link each resource type to its parser (file type) and content location. Through out the whole engine we only reference the resources via the type and never the parser or the file itself.


### Game and Editor UI

Our User Interface leverages [React](https://reactjs.org/), and it is composed by various components.

We can focus initially by understanding the [GameUI.tsx](../src/ui/GameUI.tsx) and [Editor.tsx](../src/ui/Editor.tsx) components.

GameUI is responsible with the gameplay interactions and holds the game state. It's componsed with various other components that enhaced the interaction with the game like the [Menu](../src/ui/Menu.tsx), [Behaviour Menu](../src/ui/BehaviourMenu.tsx), the [Text Interjections](../src/ui/TextInterjections.tsx) and [others](../src/ui/game).

Editor wraps a GameUI component and adds the capability to support Areas,
sections of the editor where we can add additional content with the purpose of debugging or modifying the game's state and content. The editor aims to be fully capable of allowing users to modify the entire game and create their own expiriences, and we hope we can reach this goal some stage in future.

### Renderer

(...)

### Game

(...)

### Controls

(...)

### Cameras

(...)

### Scripting

(...)

### Models and Animations

(...)

### Audio

The `audio` folder is where you can find the implementation of our audio routines for music, voice acting and sound effects.

We have implemented experimental 3D positional audio and you can activated under the *Options* menu. It still not a perfect implementation but already has some good results.
