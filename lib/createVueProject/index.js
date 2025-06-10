import { execa } from "execa";
import inquirer from "inquirer";
import chalk from "chalk";
// import { setupVuetify } from "./ui/vuetify.js";
// import { setupElementPlus } from "./ui/elementplus.js";
// import { setupNaiveUI } from "./ui/naiveui.js";
// import { setupUnoCSS } from "./ui/unoCss.js";

async function createVueProject({ projectName: initialProjectName }) {
  const projectName = initialProjectName || "my-vue-app";

  const { languageChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "languageChoice",
      message: "Do you want to use JavaScript or TypeScript?",
      choices: [
        { name: "TypeScript", value: "ts" },
        { name: "JavaScript", value: "js" },
      ],
    },
  ]);

  const { stylingChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "stylingChoice",
      message: "Choose your styling approach:",
      choices: [
        {
          name: "Tailwind CSS (recommended for most UI libraries)",
          value: "tailwind",
        },
        { name: "Plain CSS (no Tailwind)", value: "plain" },
      ],
    },
  ]);
  const useTailwind = stylingChoice === "tailwind";

  const tailwindLibraries = [
    { name: "DaisyUi", value: "daisyui" },
    {
      name: "Tailwind CSS only (no component library)",
      value: "tailwind-only",
    },
  ];

  const nonTailwindLibraries = [
    { name: "Vuetify", value: "vuetify" },
    { name: "Element Plus", value: "elementplus" },
    { name: "Naive UI", value: "naiveui" },
    { name: "PrimeVue", value: "primevue" },
    { name: "Quasar", value: "quasar" },
    { name: "UnoCSS", value: "unocss" },
    { name: "None (plain CSS)", value: "none" },
  ];

  const { uiLibraryChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "uiLibraryChoice",
      message: "Choose a UI library:",
      choices: useTailwind
        ? [...tailwindLibraries, ...nonTailwindLibraries]
        : nonTailwindLibraries,
    },
  ]);

  if (!useTailwind && ["daisyui"].includes(uiLibraryChoice)) {
    console.log(
      chalk.yellow(`\nWarning: ${uiLibraryChoice} requires Tailwind CSS!`)
    );
    const { confirmTailwind } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmTailwind",
        message:
          "Would you like to enable Tailwind CSS to use this UI library?",
        default: true,
      },
    ]);

    if (confirmTailwind) {
      console.log(
        chalk.blue("Enabling Tailwind CSS to support your UI library choice.")
      );
      useTailwind = true;
    } else {
      console.log(
        chalk.blue(
          "Please select a different UI library that does not require Tailwind."
        )
      );
      const { newUiLibraryChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "newUiLibraryChoice",
          message: "Choose a UI library compatible with plain CSS:",
          choices: nonTailwindLibraries,
        },
      ]);
      uiLibraryChoice = newUiLibraryChoice;
    }
  }

  console.log(chalk.blue("\nProject configuration:"));
  console.log(`- Project name: ${chalk.green(projectName)}`);
  console.log(
    `- Language: ${chalk.green(
      languageChoice === "ts" ? "TypeScript" : "JavaScript"
    )}`
  );
  console.log(
    `- Styling: ${chalk.green(
      useTailwind ? "Utility CSS (Tailwind/UnoCSS)" : "Plain CSS"
    )}`
  );
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)}`);

  const { confirmSetup } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSetup",
      message: "Ready to create your Vue project with these settings?",
      default: true,
    },
  ]);

  if (!confirmSetup) {
    console.log(chalk.yellow("Project setup cancelled."));
    return;
  }

  const createVueAppFlags = ['--','--template'];

  const env = { ...process.env, CI: "true" };

  try {
    console.log(chalk.blue(`\nCreating Vue project: ${projectName}`));
    console.log(
      languageChoice === "ts"
        ? chalk.blue("Using TypeScript")
        : chalk.blue("Using JavaScript")
    );

    if (languageChoice === "ts") {
      createVueAppFlags.push("vue-ts");
      console.log(chalk.blue("TypeScript selected: Adding vue-ts template"));
    } else {
      createVueAppFlags.push("vue");
      console.log(chalk.blue("JavaScript selected: Adding vue template"));
    }
    const { confirmVueRouter } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmVueRouter",
        message:
          "Want to Add Vue Router for Single Page Application development?",
        default: false,
      },
    ]);
    const { confirmPinia } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmPinia",
        message: "Want to Add Pinia for state management?",
        default: false,
      },
    ]);
    const { confirmEslint } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmESLint",
        message: "Want to Add ESLint for code quality?",
        default: true,
      },
    ]);
    const { confirmPrettier } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmPrettier",
        message: "Want to Add Prettier for code formatting?",
        default: false,
      },
    ]);
    if (confirmVueRouter) {
      createVueAppFlags.push("vue-router");
    }
    if (confirmPinia) {
      createVueAppFlags.push("pinia");
    }
    if (confirmEslint) {
      createVueAppFlags.push("eslint");
    }
    if (confirmPrettier) {
      createVueAppFlags.push("prettier");
    }
    console.log(chalk.cyanBright(...createVueAppFlags));
    await execa("npm", ['init', 'vue@latest', projectName,...createVueAppFlags], {
      stdio: "inherit",
      env,
    });

    console.log(
      chalk.green(`\nVue project '${projectName}' created successfully!`)
    );

    // Setup selected UI Library
    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "vuetify":
          //   await setupVuetify(projectName, languageChoice);
          console.log(chalk.yellow(`Vuetify setup requires`));
          break;
        case "elementplus":
          //   await setupElementPlus(projectName, languageChoice);
          break;
        case "naiveui":
          //   await setupNaiveUI(projectName, languageChoice);
          break;
        case "unocss":
          //   await setupUnoCSS(projectName, languageChoice);
          break;
        default:
          console.log(
            chalk.yellow(
              `Support for ${uiLibraryChoice} is not implemented yet.`
            )
          );
      }
    }
  } catch (error) {
    console.error(chalk.red("Failed to create Vue project:"), error);
    process.exit(1);
  }
}

export default createVueProject;
