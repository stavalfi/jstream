# Bob - Intellij compatible unified build package

### Supported liberaries:

1. React
2. React Hot Loader
3. Webpack
4. Jest
5. eslint
6. Typescript
7. Prettier
8. Husky
9. Lint Staged
10. Lerna
11. Yarn (Workspaces)

#### Properties:

1. Tests in Typescript
2. Type check everywhere
3. Aliases paths everywhere
4. Unified build

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Libraries Configurations](#libraries-configurations)
3. [Env Variables](#env-variables)
4. [Adding New Project](#adding-new-project)
5. [Removing Project](#removing-project)

### Project Structure

```
mui
    - js
        - builder
        ...other packages
    - .gitignore
    - .huskyrc
    - .prettierignore
    - .prettierrc
    - lerna.json
    - package.json
    - tsconfig.json
    - yarn.lock
```

The `/package.json`contains:

- All the dependencies and devDependencies of all the packages and the main package.
  - It avoids multiple problems and hard-to-find-bugs, such as: resolving the wrong
    dependency-version or in the wrong node_modules ([read here for additonal
    information](https://github.com/stavalfi/mono-resolver-webpack-plugin),
    )
  - forgetting upgrating/adding dependencies in packages where other are depending on.
- pupular commands to run in all/specific packages. You can find more info on the syntax in Lerna/Yarn docs.

The `builder` runs all the commands for all the other packages. A package.json in each package contains
commands that run other commands in the `builder` package. For example:

```bash
"start": "API_PROXY=ui-proxy yarn run exec b:start",
"exec": "FOLDER=client WEB_APP=true yarn workspace @ui/builder"
```

Equals to:

```bash
"exec": "API_PROXY=ui-proxy FOLDER=client WEB_APP=true yarn workspace @ui/builder b:start"
```

### Libraries Configurations

##### Typescript

TS doesn't support JS configurations files; it supports json files only: `tsconfig.json`. To support
auto completion in the IDE, we have `tsconfig.json` in every package under `/js`: `/js/*/tsconfig.json`.
Those files contains the minimal resolving rules that will be used by the IDE to suggest the currect aliases as imports.

`ForkTsCheckerWebpackPlugin` will run fast type-check during webpack build. it will need resolving rules for every package
because it doesn't know which package dependes on which so the best solution
is to use the main `tsconfig.json` to type-check all the packages in the start of evry build. then, only the changed
ts files will be re-compiled for type-checks.

- Jest ts-jest also uses the main `tsconfig.json` to do the same as `ForkTsCheckerWebpackPlugin`, but only when running tests.

`js/builder/.config/lib-tsconfig.json` is used to compile libraries that won't produce website and it will be used to auto-generate
`*.d.ts` files for an entire package. [more info can be found here](https://github.com/stavalfi/babel-plugin-module-resolver-loader)

Over all, there are `2 + x` `tsconfig` files (`x` === amount of packages that uses `builder` to build/test).

##### Lerna + Yarn workspaces

Some libraries that support mono-repo, will try to search the list of all the projects using lerna commands or by reading the main package.json in `workspaces` key.

### Env Variables

| Env Variable      | Who sets it                                      | Required | Where to set (Only in Package.json)  | Description                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------ | -------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PWD`             | IDE                                              | Yes      | you don't set it                     | is used when you run tests from the ide directly by clicking the green rectangle button in test file. when you do that, the builder need to know what package executes the tests                                                                      |
| `CI`              | CI Servers: CircleCI/Azure Pipeline/TravisCI/... | No       | you don't set it                     | is used to print less in the logs of the CI servers                                                                                                                                                                                                   |
| `FOLDER`          | Developer                                        | Yes      | in all the packages expect `builder` | the `builder` use it to know which package to run the command on                                                                                                                                                                                      |
| `DEV_SERVER`      | Developer                                        | Yes      | `builder`                            | activate react-hot-loader even when running webpack-dev-server on production                                                                                                                                                                          |
| `MEASURE_WEBPACK` | Developer                                        | No       | anywhere you want                    | log how much time every plugin and loader takes in milliseconds. some plugins doesn't support it so the app won't load but it can still be used to knwo how much the initial build/rebuild takes after changes in the code perfectly                  |
| `WEB_APP`         | Developer                                        | Yes      | in all the packages expect `builder` | `builder` use it to know if the build should produce a website or a library                                                                                                                                                                           |
| `DEV`             | Developer                                        | Yes      | `builder`                            | is it development build/test or production. this is stronger then `--mode development/production` because we use this info in tests also and other config files                                                                                       |
| `TEST`            | Developer                                        | Yes      | `builder`                            | is used to enable some plugins in babel that are used only in tests and those plugins may break non-tests builds                                                                                                                                      |
| `NOT_IDE`         | Developer                                        | Yes      | `builder`                            | is it the IDE running the configs to give you eslint/jest/.. support or you running those configs. if it's the ide, I don't know from which package the command is running on so i will give much less info so there won't be any errors for the ide. |
| `BUILD_INFO`      | Developer                                        | No       | anywhere you want                    | print alot of debug info in every test and build                                                                                                                                                                                                      |

### Adding New Project

1. Is it at the same level of existing packages?
   a. copy an exiting package (any package from any level)
   b. go to package.json
   c. modify `FOLDER=modify-this-text` to the name of your **_folder_**
   d. modify the name key of the package.json
2. if not:
   a. modify `/package.json` worksapces key (use lerna workspaces docs).
   go to step (1)
3. Does it have a special build/test configurations? modify `builder`. search for examples like `client` or `installer` on how to do it.

### Removing Project

1. remove the project
2. search the name of the package in the `builder` to see if there are special configurations for it and refactor them.
