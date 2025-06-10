import fs from "fs";

import { writeFile,readFile } from "fs/promises";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import { createWelcomePageHTML, updateAppComponent } from "../utils/utility.js";

export async function setupDaisyUi(projectName) {
  console.log(chalk.blue("Setting up daisyui..."));

  const projectPath = process.cwd();
  try {
    await execa("npm", ["install", "daisyui@latest"], {
      stdio: "inherit",
      shell: true,
    });

    const stylesPath = path.join(projectPath, "src", "styles.css");
    const daisyUiDirectives = `@import "tailwindcss";\n@plugin "daisyui";`.trim();

    await fs.promises.writeFile(stylesPath, daisyUiDirectives);

     await execa("npm",["install","ngx-sonner"],{
      stdio:"inherit",
      shell:true
    })
    console.log(chalk.blue("Creating a welcome page..."));

    const PageHTML = createWelcomePageHTML(true);
    await updateAppComponent(projectPath);
    const htmlPath = path.join(projectPath, "src/app/app.html");
    await writeFile(htmlPath, PageHTML); 
    console.log(chalk.greenBright("\n🎉 daisyui setup complete!."));
    
  } catch (error) {
    console.error(chalk.red("Error setting up daisyui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up daisyui manually after project creation."
      )
    );
  }
}
