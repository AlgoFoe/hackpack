import path from "path";
import { execa } from "execa";
import chalk from "chalk";
import fs, { unlink } from "fs/promises";
import { createToastMessage, createWelcomePageHTML } from "../utils/utility.js";

export async function setupShadcnUI(projectName, isTypeScript, useTailwind) {
  if (useTailwind) {
    try {
      console.log(chalk.blue("\nInitialising Tailwind CSS..."));

      await execa("npx", ["astro", "add", "tailwind"], {
        stdio: "inherit",
        shell: true,
      });

      console.log(chalk.yellow("\nTailwind CSS is successfully set up."));
    } catch (tailwindError) {
      console.error(
        chalk.red("Failed to add Tailwind CSS to Astro project:"),
        tailwindError
      );
      process.exit(1);
    }
  }

  console.log(chalk.blue("Setting up shadcn/ui..."));
  const projectPath = process.cwd();

  try {
    await execa("npx", ["astro", "add", "react"], {
      stdio: "inherit",
      shell: true,
    });

    const tsconfigPath = path.join(projectPath, "tsconfig.json");

    try {
      
      console.log(chalk.blue("Updating tsconfig.json file..."));
      const raw = await fs.readFile(tsconfigPath, "utf-8");
      const tsconfig = JSON.parse(raw);

      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }

      tsconfig.compilerOptions.baseUrl = ".";
      tsconfig.compilerOptions.paths = {
        "@/*": ["./src/*"],
      };

      await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      console.log(chalk.yellow("Successfully updated tsconfig.json with import alias."));
    } catch (error) {
      console.error("Failed to update tsconfig.json:", error.message);
    }

    await execa("npx", ["shadcn@latest", "init"], {
      stdio: "inherit",
      shell: true,
    });

    console.log(chalk.greenBright("\n🎉 shadcn setup completed!."));

    console.log(chalk.blue("Creating a welcome page..."));

    await execa("npm",["install","sonner"],{
      stdio:"inherit",
      shell:true
    });

    const toastComponent = createToastMessage(useTailwind);
    await fs.writeFile(
      `src/components/ToastDemo.${isTypeScript ? "tsx" : "jsx"}`,
      toastComponent
    );

    const PageHTML = createWelcomePageHTML(useTailwind);
    const htmlPath = path.join(projectPath, "src", "pages", "index.astro");
    await fs.writeFile(htmlPath, PageHTML);

    const defaultWelcomePagePath = path.join(
      projectPath,
      "src",
      "components",
      "Welcome.astro"
    );

    try {
      await unlink(defaultWelcomePagePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    console.log(chalk.greenBright("\n🎉 Project setup completed!."));
  } catch (error) {
    console.error(chalk.red("Error setting up shadcn/ui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up shadcn/ui manually after project creation."
      )
    );
  }
}
