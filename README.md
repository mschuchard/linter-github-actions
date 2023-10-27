### Linter-Github-Actions

Linter-Github-Actions aims to provide functional and robust `actionlint` linting functionality within Pulsar.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
The ActionLint CLI binary executable is required to be installed before using this package. The Atom-IDE-UI and Language-YAML packages are also required.

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

### Usage
- All YAML files located in a directory named `workflows` with a `jobs` key will be linted with this linter. Be aware of this in case you have a non-Actions YAML file with this characteristic. Also be aware of this in case you have a typo for the `jobs` key, since this linter will then not trigger.
