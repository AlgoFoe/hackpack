import { execa } from 'execa';
import chalk from 'chalk';

async function createViteProject({ projectName, typescript }) {
  console.log(chalk.blue(`\nCreating Vite+React project: ${projectName}`));

  const template = typescript ? 'react-ts' : 'react';
  const createCmd = `npm create vite@latest ${projectName} -- --template ${template}`;

  try {
    await execa(createCmd, { stdio: 'ignore', shell: true });

    console.log(chalk.blue(`\nInstalling dependencies in ${projectName}...`));
    await execa('npm', ['install'], {
      cwd: projectName,
      stdio: 'inherit'
    });

    console.log(chalk.green(`\nVite+React project '${projectName}' created and dependencies installed successfully!`));
  } catch (error) {
    console.error(chalk.red(`\nError setting up project: ${error.message}`));
  }
}

export default createViteProject;
