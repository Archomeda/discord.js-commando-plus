/*
 Original author: Archomeda
 */

import DocsSource from './DocsSource';

const branchBlacklist = new Set(['gh-pages', 'gh-pages-src', 'docs']);
export default new DocsSource({
  id: 'commando-plus',
  name: 'Commando-Plus',
  global: 'Commando',
  repo: 'Archomeda/discord.js-commando-plus',
  defaultTag: 'master',
  branchFilter: branch => !branchBlacklist.has(branch),
});
