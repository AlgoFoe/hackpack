#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';

import createNextProject from '../lib/createNextProject.js';
import createViteProject from '../lib/createViteProject.js';
// import createVueProject from '../lib/createVueProject.js';
// import createAngularProject from '../lib/createAngularProject.js';
// import createSvelteProject from '../lib/createSvelteProject.js';
// import createAstroProject from '../lib/createAstroProject.js';
// import createNuxtProject from '../lib/createNuxtProject.js';

async function runCli() {
  console.log(chalk.green.bold('\nWelcome to hackpack!'));

  const { frameworkChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'frameworkChoice',
      message: 'Which framework would you like to use?',
      choices: [
        { name: 'Next.js', value: 'next' },
        { name: 'Vite (React)', value: 'vite-react' },
        { name: 'Remix', value: 'remix' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Angular (TS only)', value: 'angular' },
        { name: 'Svelte', value: 'svelte' },
        { name: 'Astro', value: 'astro' },
        { name: 'Nuxt.js', value: 'nuxt' },
      ]
    }
  ]);

  let useTypeScript = false;

  if (frameworkChoice !== 'angular' && frameworkChoice !== 'remix') {
    const { languageChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'languageChoice',
        message: 'Do you want to use JavaScript or TypeScript?',
        choices: [
          { name: 'TypeScript', value: 'ts' },
          { name: 'JavaScript', value: 'js' }
        ]
      }
    ]);

    useTypeScript = languageChoice === 'ts';
  }

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the name of your project:',
      default: 'myapp'
    }
  ]);

  try {
    switch (frameworkChoice) {
      case 'next':
        await createNextProject({
          projectName,
          typescript: useTypeScript,
        });
        break;

      case 'vite-react':
        await createViteProject({
          projectName,
          typescript: useTypeScript,
        });
        break;

      case 'remix':
        console.log(`Scaffolding a Remix project for ${projectName}...`);
        // await createRemixProject({ projectName, typescript: ? });
        break;

      case 'vue':
        console.log(
          `Scaffolding a Vue project for ${projectName} using ${
            useTypeScript ? 'TypeScript' : 'JavaScript'
          }...`
        );
        // await createVueProject({ projectName, typescript: useTypeScript });
        break;

      case 'angular':
        console.log(`Scaffolding an Angular (TypeScript) project for ${projectName}...`);
        // await createAngularProject({ projectName });
        break;

      case 'svelte':
        console.log(
          `Scaffolding a Svelte project for ${projectName} using ${
            useTypeScript ? 'TypeScript' : 'JavaScript'
          }...`
        );
        // await createSvelteProject({ projectName, typescript: useTypeScript });
        break;

      case 'astro':
        console.log(
          `Scaffolding an Astro project for ${projectName} using ${
            useTypeScript ? 'TypeScript' : 'JavaScript'
          }...`
        );
        // await createAstroProject({ projectName, typescript: useTypeScript });
        break;

      case 'nuxt':
        console.log(
          `Scaffolding a Nuxt.js project for ${projectName} using ${
            useTypeScript ? 'TypeScript' : 'JavaScript'
          }...`
        );
        // await createNuxtProject({ projectName, typescript: useTypeScript });
        break;

      default:
        console.log(chalk.red('Invalid choice.'));
        process.exit(1);
    }

    console.log(chalk.green('All done! Your project has been created.\n'));
  } catch (error) {
    console.error(chalk.red('Error scaffolding project:'), error);
    process.exit(1);
  }
}

runCli().catch(err => {
  console.error(err);
  process.exit(1);
});
