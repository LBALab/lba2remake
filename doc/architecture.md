# Architecture

This document describes the technologies used, design principles and code architecture of the LBA2 remake project.


## Technologies

The project runs in a browser and relies on modern web technologies, in particular [JavaScript](https://developer.mozilla.org/bm/docs/Web/JavaScript), [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (through [three.js](https://threejs.org/)) and [React](https://reactjs.org/).

Using JavaScript does not limit us to run the game in a traditional web browser. We have plans to make standalone versions for the desktop, mobile and console platforms.

There are prototypes of mobile apps for Android, iOS and Windows 10 in the apps folder.

### JavaScript

[JavaScript](https://developer.mozilla.org/bm/docs/Web/JavaScript) is an evolving language, and new features are added every year.

We use next generation JavaScript, along with some language extensions ([JSX](https://reactjs.org/docs/introducing-jsx.html), [Flow](https://flow.org/)) that provide important features which are not (yet) available in most browsers.

We also use the [NPM](https://www.npmjs.com/) package manager to easily take advantage of various libraries that boost our development process (check our `package.json` to see these).

For these reasons, we rely on a compiler that transforms our variant of JavaScript into something that all browsers can understand.

This is the role of the dev server.

#### Dev Server

When running the `npm run dev` command, you are launching a web server that uses [webpack](https://webpack.js.org/) to take the various source files that constitute the project, transform them, and bundle them into a single `bundle.js` file to be used by the web browser.

Webpack watches all the project source files, so that if you change any of them, it will be instantly recompiled and error-checked (using [ESLint](https://eslint.org/)). Simply refreshing the web page will automatically fetch the newly compiled bundle.

Beyond just JS, webpack also transforms other types of source files for us, like shaders ([GLSL](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)) and configuration files ([JSON](https://www.json.org/) and [YAML](http://yaml.org/)). This is done using webpack loaders (check `webpack.config.js` to see which loaders we use).

The actual job of transpiling JavaScript (compiling into an older version of the language) is handled by [babel](https://babeljs.io/) under the hood, and the configuration for this is done in `.babelrc`.

#### Flow & ESLint

JavaScript by default is a _permissible_, _dynamically typed_ language. This is great when prototyping new features. It helps us going from an idea to a working prototype much faster than if we had to use a language like _C++_, _Java_ or _C#_.

However, this comes at a cost: as the project grows, [dynamic typing](https://developer.mozilla.org/en-US/docs/Glossary/Dynamic_typing) and lack of compile-time error checking means more bugs and regressions. It also means that the code quickly becomes hard to read and maintain.

To avoid this, we use 2 different tools:

* [Flow](https://flow.org/) is a language extension that allows using a static type system. Compared to its rival [TypeScript](https://www.typescriptlang.org/), Flow uses a type system that is closer to what can be found in [functional programming](https://www.quora.com/What-is-functional-programming) languages. We can also use it selectively, no need to convert the whole project, only certain files can use Flow (look for `// @flow` annotations).
* [ESLint](https://eslint.org/) checks for common errors at compile-time, and makes sure we use a consistent style, making our code easier to read and understand. We rely on a set of rules provided by the widely used [AirBnB config](https://github.com/airbnb/javascript) that we've adapted to our needs.

As it is important for us to preserve our ability to try things out and prototype new features quickly, we intend to use Flow only on stabilized parts of the code where we expect slower changes (at this point we're not using it where we should).

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

(...)


## Design Principles

(...)


## Code architecture

(...)