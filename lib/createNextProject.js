import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

export default async function createNextProject({ projectName, typescript }) {
  const cmd = typescript
    ? `npx create-next-app@latest ${projectName} --typescript`
    : `npx create-next-app@latest ${projectName}`;
  
  console.log(`Running: ${cmd}`);
  
  try {
    await execPromise(cmd, { stdio: 'inherit' });
    console.log(`Successfully created ${projectName} with Next.js!`);
  } catch (error) {
    console.error(`Error scaffolding Next.js project: ${error.message}`);
  }
}
