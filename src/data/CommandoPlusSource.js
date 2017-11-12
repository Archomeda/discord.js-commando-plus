/**
 * Added by Archomeda to support documentation for Archomeda/discord.js-commando-plus.
 */

import DocsSource from './DocsSource';

const branchBlacklist = new Set(['gh-pages', 'gh-pages-src', 'docs']);
export default new DocsSource({
  id: 'commando-plus',
  name: 'Commando-Plus',
  global: 'Commando-Plus',
  repo: 'Archomeda/discord.js-commando-plus',
  defaultTag: 'master',
  branchFilter: branch => !branchBlacklist.has(branch),
});
