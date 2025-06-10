import { execa } from "execa";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { setupAngularMaterial } from "./ui/angularmaterialui.js";
import { setupPrimeNg } from "./ui/primeNg.js";
import { setupDaisyUi } from "./ui/daisyui.js";
import { setupDefault } from "./ui/default.js";

async function createAngularProject({ projectName: initialProjectName }) {
  const projectName = initialProjectName || "my-angular-app";
  const { stylingChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "stylingChoice",
      message: "Choose your styling approach:",
      choices: [
        {
          name: "Tailwind CSS ",
          value: "tailwind",
        },
        { name: "Plain CSS (no Tailwind)", value: "plain" },
      ],
    },
  ]);
  const useTailwind = stylingChoice === "tailwind";

  const tailwindLibraries = [
    {name:"daisyUI (Tailwind plugin)",value:'daisyui'},
    {
      name: "Tailwind CSS only (no component library)",
      value: "tailwind-only",
    },
  ];

  const nonTailwindLibraries = [
    { name: "Angular Material", value: "angular-material" },
    { name: "PrimeNG", value: "primeng" },
    { name: 'None (plain CSS)', value: 'none' }
  ];

  const { uiLibraryChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "uiLibraryChoice",
      message: "Choose a UI library:",
      choices: [...tailwindLibraries, ...nonTailwindLibraries],
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
  console.log(`- Language: ${chalk.green("TypeScript")}`);
  console.log(
    `- Styling: ${chalk.green(useTailwind ? "Tailwind CSS" : "Plain CSS")}`
  );
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)}`);

  const { confirmSetup } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSetup",
      message: "Ready to create your Angular project with these settings?",
      default: true,
    },
  ]);

  if (!confirmSetup) {
    console.log(chalk.yellow("Project setup cancelled."));
    return;
  }

  try {
    console.log(chalk.blue("Installing Angular CLI..."));
    try {
      // Try to check if Angular CLI is already installed
      await execa("ng", ["version"], { stdio: "ignore" });
      console.log(chalk.yellow("Angular CLI is already installed."));
    } catch (error) {
      const cmd = "npm install -g @angular/cli";
      try {
        await execa(cmd, { stdio: "inherit", shell: true });
        console.log(chalk.green("Successfully installed the angular CLI."));
      } catch (error) {
        console.error(chalk.red("Failed to create Next.js project:"), error);
        process.exit(1);
      }
    }

    console.log(chalk.blue(`\nCreating Angular project: ${projectName}`));

    const arg = `ng new ${projectName} --routing --style=css --defaults  `;
    await execa(arg, { stdio: "inherit", shell: true });

    console.log(
      chalk.green(`🎉Angular project '${projectName}' created successfully!`)
    );

    process.chdir(projectName);

    if (useTailwind) {
      console.log(chalk.blue("Setting up Tailwind CSS..."));
      const projectPath = process.cwd();
      console.log(
        chalk.blue("Installing Tailwind CSS, PostCSS, and Autoprefixer...")
      );

      await execa(
        "npm",
        [
          "install",
          "tailwindcss@latest",
          "@tailwindcss/postcss@latest",
          "postcss@latest",
          "--force",
        ],
        { stdio: "inherit" }
      );

      const config = {
        plugins: {
          "@tailwindcss/postcss": {},
        },
      };

      fs.writeFileSync(".postcssrc.json", JSON.stringify(config, null, 2));
      console.log(
        chalk.green(".postcssrc.json created with @tailwindcss/postcss plugin.")
      );

      const stylesPath = path.join(projectPath, "src", "styles.css");
      const tailwindDirectives = `
        @import "tailwindcss";
        `.trim();

      await fs.promises.writeFile(stylesPath, tailwindDirectives);

      console.log(
        chalk.green("✅ Injected Tailwind directives into styles.css")
      );

      console.log(
        chalk.greenBright(
          "\n🎉 Tailwind CSS setup complete!."
        )
      );
    }

    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "angular-material":
          await setupAngularMaterial({ projectName, useTailwind });
          break;
        case "primeng":
          await setupPrimeNg(projectName);
          break;
        case "daisyui":
          await setupDaisyUi(projectName);
          break;
        default:
          console.log(
            chalk.yellow(
              `Support for ${uiLibraryChoice} is not implemented yet.`
            )
          );
      }
    }else{
      await setupDefault(projectName, useTailwind)
    }
    await execa("ng",["serve"],{
      stdio:"inherit",
      shell:true
    })
  } catch (error) {
    console.error(chalk.red("Failed to create Angular project:"), error);
    process.exit(1);
  }
}

export default createAngularProject;
