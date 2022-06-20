### Linter-Github-Actions

Linter-Github-Actions aims to provide functional and robust `actionlint` linting functionality within Atom.

**Maintenance Mode**

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented. However, active development on this package has ceased.

### Installation
The ActionLint CLI binary executable is required to be installed before using this package. The Linter and Language-YAML Atom packages are also required.

### Usage
- All YAML files located in a directory named `workflows` with a `jobs` key will be linted with this linter. Be aware of this in case you have a non-Actions YAML file with this characteristic. Also be aware of this in case you have a typo for the `jobs` key, since this linter will then not trigger.
