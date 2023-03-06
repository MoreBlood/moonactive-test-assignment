![Windows build](https://github.com/MoreBlood/moonactive-test-assignment/workflows/Windows%20build/badge.svg?branch=master) ![Linux build](https://github.com/MoreBlood/moonactive-test-assignment/workflows/Linux%20build/badge.svg) ![MacOs build](https://github.com/MoreBlood/moonactive-test-assignment/workflows/MacOs%20build/badge.svg) ![GithubPages build](https://github.com/MoreBlood/moonactive-test-assignment/workflows/GitHub%20Pages/badge.svg)

# Moonactive test assigment based on pixi-typescript-boilerplate

- [Credits to yordan-kanchelov](https://github.com/yordan-kanchelov/pixi-typescript-boilerplate)
- Beginner friendly template for pixi.js with [Webpack](https://webpack.js.org/)

## Changes in boilerplate comparing to [pixi-typescript-boilerplate](https://github.com/yordan-kanchelov/pixi-typescript-boilerplate)

- Inline `assets` with `webpack`
- Inline `css/js` with `webpack`
- Treeshaked `@pixi`
- Added Github Pages `workflow`
- Some `Eslit` config tweaks

# Demo

[![preview](assets/preview.png)](https://moreblood.github.io/moonactive-test-assignment/)

# Highlights

- 🔰 - Beginner friendly.
- 🚀 - Blazing fast bundle times ( by using [swc](https://github.com/swc-project/swc) for transpiling )
- 🛠 - Typescript + swc
- ✈️ - Live reload.
- 📝 - Consistent code style using Prettier and Eslint
- 📝 - Unit test support with [Jest](https://jestjs.io/), generating code coverage.

# Commands

- `npm run build` - starts build procedure
- `npm run start` - start watching for files and open's server on localhost:8080
- `npm run test` - run tests
- `npm run code-coverage` - generate code coverage report
- `npm run code-style-check` - run's eslint and prettier check on your code

For vscode users - ctrl ( or ⌘ ) + shift + b will run the watch build as its set as default vscode task

# Actions

- Addded publish to Github Pages action
- Build available at [moreblood.github.io/moonactive-test-assignment](https://moreblood.github.io/moonactive-test-assignment/)
