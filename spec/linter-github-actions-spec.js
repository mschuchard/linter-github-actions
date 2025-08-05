'use babel';

import * as path from 'path';

describe('The Actions provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-github-actions');
      return atom.packages.activatePackage('language-yaml').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures\/.github\/workflows', 'clean.yaml'))
      );
    });
  });

  describe('checks a file with actions syntax issues', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures\/.github\/workflows', 'errors.yaml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the messages', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(3);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('"on" section is missing in workflow');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+.github\/workflows\/errors\.yaml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('"runs-on" section is missing in job "the_job"');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+.github\/workflows\/errors\.yaml$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[4, 2], [4, 3]]);
          expect(messages[2].severity).toBeDefined();
          expect(messages[2].severity).toEqual('error');
          expect(messages[2].excerpt).toBeDefined();
          expect(messages[2].excerpt).toEqual('unexpected key "runs_on" for "job" section. expected one of "concurrency", "container", "continue-on-error", "defaults", "env", "environment", "if", "name", "needs", "outputs", "permissions", "runs-on", "secrets", "services", "steps", "strategy", "timeout-minutes", "uses", "with"');
          expect(messages[2].location.file).toBeDefined();
          expect(messages[2].location.file).toMatch(/.+.github\/workflows\/errors\.yaml$/);
          expect(messages[2].location.position).toBeDefined();
          expect(messages[2].location.position).toEqual([[5, 4], [5, 5]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures\/.github\/workflows', 'clean.yaml');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  it('ignores a not github actions yaml file', (done) => {
    const ignoreFile = path.join(__dirname, 'fixtures\/.github\/workflows', 'non-gha.yaml');
    return atom.workspace.open(ignoreFile).then(editor =>
      lint(editor).then(messages => {
      }, () => {
        done();
      })
    );
  });
});
