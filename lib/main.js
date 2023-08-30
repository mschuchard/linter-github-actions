'use babel';

export default {
  config: {
    actionsExecutablePath: {
      title: 'Actions Executable Path',
      type: 'string',
      description: 'Path to Actions executable (e.g. /usr/local/bin/actionlint) if not in shell env path.',
      default: 'actionlint',
    },
    configFile: {
      title: 'Config File',
      type: 'string',
      description: 'Path to config file',
      default: '',
    },
    errorIgnores: {
      title: 'Error Ignores',
      type: 'array',
      description: 'List of regular expressions matching to error messages you want to ignore.',
      default: [],
      items: {
        type: 'string'
      },
    },
    pyflakesPath: {
      title: 'Pyflakes Command Path',
      type: 'string',
      description: 'Command name or file path of "pyflakes" external command (default "pyflakes").',
      default: '',
    },
    shellcheckPath: {
      title: 'Shellcheck Command Path',
      type: 'string',
      description: 'Command name or file path of "shellcheck" external command (default "shellcheck").',
      default: '',
    },
  },

  // activate linter
  activate() { },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Actions',
      grammarScopes: ['source.yaml', 'source.ansible'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // establish const vars
        const helpers = require('atom-linter');
        const content = textEditor.getText();
        const file = textEditor.getPath();
        const dir = require('path').dirname(file);

        // bail out if this is not a github actions config
        if (!(/workflows$/.exec(dir)) || !(/jobs:/.exec(content))) return [];

        // initialize standard arguments
        const args = ['-no-color', '-format', "'{{json .}}'"];

        // add error ignores arguments
        atom.config.get('linter-github-actions.errorIgnores').forEach((ignore) => {
          args.push(...['-ignore', ignore]);
        });
        // add command path arguments
        if (atom.config.get('linter-github-actions.pyflakesPath') !== '')
          args.push(...['-pyflakes', atom.config.get('linter-github-actions.pyflakesPath')]);
        if (atom.config.get('linter-github-actions.shellcheckPath') !== '')
          args.push(...['-shellcheck', atom.config.get('linter-github-actions.shellcheckPath')]);
        // config file
        if (atom.config.get('linter-github-actions.configFile') !== '')
          args.push(...['-config-file', atom.config.get('linter-github-actions.configFile')]);

        // finalize arguments
        args.push('-');

        // execute the linting
        return helpers.exec(atom.config.get('linter-github-actions.actionsExecutablePath'), args, { stdin: content, ignoreExitCode: true }).then(output => {
          const toReturn = [];

          // parse json output
          try {
            // for some ridiculous reason JS is transforming the structure into a nested literal string, so remove the outer single quotes
            const info = JSON.parse(output.slice(1, -1));

            // valid json (else caught by now), so iterate through array destructured object entries representing issue(s)
            info.forEach((issue) => {
              // defaults if no information provided
              const lineStart = issue.line == null ? 0 : issue.line - 1;
              const lineEnd = issue.line == null ? 0 : issue.line - 1;
              const colStart = issue.column == null ? 0 : issue.column - 1;
              const colEnd = issue.column == null ? 1 : issue.column;
              const theFile = issue.filepath === '<stdin>' ? file : issue.filepath;

              toReturn.push({
                severity: 'error',
                excerpt: issue.message,
                location: {
                  file: theFile,
                  position: [[lineStart, colStart], [lineEnd, colEnd]],
                },
              });
            });
          }
          catch (SyntaxError) {
            // if invalid json then the file is clean
          }

          return toReturn;
        });
      }
    };
  }
};
