import {execa} from 'execa';

export default async function createViteProject({ projectName, typescript }) {
  const template = typescript ? 'react-ts' : 'react';
  const cmd = 'npm';
  const args = ['create', 'vite@latest', projectName, '--', '--template', template];

  console.log(`Running: ${cmd} ${args.join(' ')}`);

  try {
    await execa(cmd, args, { stdio: 'inherit' });
    console.log(`Successfully created ${projectName} with Vite!`);
  } catch (error) {
    console.error(`Error scaffolding Vite project: ${error.message}`);
  }
}
