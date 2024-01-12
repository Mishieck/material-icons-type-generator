import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
const owner = 'google';
const repo = 'material-design-icons';
const path = '/symbols/web';
const fullPath = '/repos/{owner}/{repo}/contents/{path}';

const { data } = (await octokit.request(fullPath, { owner, repo, path })) as {
  data: Array<{ type: 'file' | 'dir'; name: string }>;
};

const dirNames = data
  .filter(({ type }) => type === 'dir')
  .map(({ name }) => name);

const code = `export type MdIconName = \n| ${dirNames
  .map(name => `'${name}'`)
  .join('\n| ')};`;

const filePath = 'material-icons-types.ts';
await Bun.write(filePath, code);
console.log(dirNames);
