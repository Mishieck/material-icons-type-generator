import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
const owner = 'google';
const repo = 'material-design-icons';
const categoriesPath = '/src';

type Entry = { type: 'file' | 'dir'; name: string };

type Result = {
  data: Array<Entry>;
};

const toNames = (entries: Array<Entry>) => entries
  .filter(({ type }) => type === 'dir')
  .map(({ name }) => name);

const getDirNames = async (path: string) => {
  const result = (await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  })) as Result;

  return toNames(result.data);
};

console.info('Getting categories');
const categories = await getDirNames(categoriesPath);
const directories: Array<string> = [];

for (const category of categories) {
  const page = `${(categories.indexOf(category)) + 1} / ${categories.length}`;
  console.info(`Getting icons in category '${category}' (${page})`);
  const names = await getDirNames(`${categoriesPath}/${category}`);
  console.info(`Got ${names.length} icons`);
  directories.push(...names);
  console.info('Total number of icons: ', directories.length);
}

directories.sort();

const code = `export type MdIconName = \n| ${directories
  .map(name => `'${name}'`)
  .join('\n| ')};`;

const filePath = 'material-icons-types.ts';
await Bun.write(filePath, code);

