import { execa } from 'execa';
import chalk from 'chalk';

async function createNextProject({ projectName, typescript }) {
  console.log(chalk.blue(`\nCreating Next.js project: ${projectName}`));

  const cmd = `npx create-next-app@latest ${projectName} ${typescript ? '--typescript' : ''}`;

  await execa(cmd, { stdio: 'inherit', shell: true });

  console.log(chalk.green(`Next.js project '${projectName}' created successfully!`));
}

export default createNextProject;
