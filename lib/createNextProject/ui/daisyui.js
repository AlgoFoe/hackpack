import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupDaisyUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up daisyUI...'));
  
  // Change to project directory
  process.chdir(projectName);
  
  console.log(chalk.blue(`Setting up daisyUI with ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}...`));
  
  try {
    // Step 1: Install Tailwind CSS dependencies
    console.log(chalk.blue('Installing Tailwind CSS and dependencies...'));
    await execa('npm', ['install', '-D', 'tailwindcss@3', 'postcss', 'autoprefixer'], {
      stdio: 'inherit'
    });
    
    // Step 2: Initialize Tailwind CSS config
    console.log(chalk.blue('Initializing Tailwind CSS configuration...'));
    await execa('npx', ['tailwindcss', 'init', '-p'], {
      stdio: 'inherit'
    });
    
    // Step 2.5: Update PostCSS config according to daisyUI documentation
    console.log(chalk.blue('Updating PostCSS configuration...'));
    const postcssConfigPath = path.join(process.cwd(), 'postcss.config.js');
    try {
      // Try to read existing postcss.config.js
      const postcssConfig = `/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
      await fs.writeFile(postcssConfigPath, postcssConfig, 'utf8');
    } catch (error) {
      console.error(chalk.yellow('Note: Could not update PostCSS config. Using defaults.'));
    }
    
    // Step 3: Install daisyUI
    console.log(chalk.blue('Installing daisyUI...'));
    await execa('npm', ['install', 'daisyui@latest'], { 
      stdio: 'inherit'
    });
    
    // Step 4: Install sonner for toast notifications
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });      // Step 5: Create global CSS file with Tailwind and daisyUI directives
    const globalCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    // Only using Tailwind 3 directives
    const tailwindDirectives = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
    
    try {
      const existingCss = await fs.readFile(globalCssPath, 'utf8');
      
      // Remove Tailwind 4 directive if present, while keeping Tailwind 3 directives
      let updatedCss = existingCss;
      
      // Remove the Tailwind 4 directive
      if (updatedCss.includes('@import "tailwindcss";')) {
        updatedCss = updatedCss.replace('@import "tailwindcss";', '');
        console.log(chalk.green('Removed Tailwind 4 directive (@import "tailwindcss")'));
      }
      
      // Ensure Tailwind 3 directives exist
      if (!updatedCss.includes('@tailwind base;')) {
        updatedCss = tailwindDirectives + updatedCss;
        console.log(chalk.green('Added Tailwind 3 directives (@tailwind base/components/utilities)'));
      }
      
      await fs.writeFile(globalCssPath, updatedCss, 'utf8');
      
    } catch (error) {
      // If file doesn't exist, create it with Tailwind 3 directives
      await fs.writeFile(globalCssPath, tailwindDirectives, 'utf8');
      console.log(chalk.green('Created globals.css with Tailwind 3 directives'));
    }
    
    // Step 6: Update tailwind.config.js to include daisyUI and content paths
    console.log(chalk.blue('Configuring Tailwind CSS for daisyUI...'));
      // Path to the tailwind config file
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    
    try {      // Create a proper tailwind.config.js with Next.js paths and daisyUI
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light --default", "dark --prefersdark", "corporate"],
  },
  plugins: [require("daisyui")],
}
`;
      
      // Write the complete tailwind config
      await fs.writeFile(tailwindConfigPath, tailwindConfig, 'utf8');
    } catch (error) {
      console.error(chalk.red('Error updating tailwind.config.js:'), error.message);
      
      // Fallback to modifying existing file if complete replacement fails
      try {
        let tailwindConfig = await fs.readFile(tailwindConfigPath, 'utf8');
        
        // Make sure content paths include Next.js app router paths
        if (!tailwindConfig.includes('./src/app/**/*.{js')) {
          tailwindConfig = tailwindConfig.replace(
            'content: [',
            `content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',`
          );
        }
        
        // Add daisyUI to plugins if not already added
        if (!tailwindConfig.includes('daisyui')) {
          tailwindConfig = tailwindConfig.replace(
            'plugins: [',
            'plugins: [require("daisyui"),'
          );
          
          // Add daisyUI theme configuration
          if (tailwindConfig.includes('module.exports')) {            tailwindConfig = tailwindConfig.replace(
              'module.exports = {',
              `module.exports = {
  daisyui: {
    themes: ["light --default", "dark --prefersdark", "corporate"],
  },`
            );
          }
        }
        
        await fs.writeFile(tailwindConfigPath, tailwindConfig, 'utf8');
      } catch (fallbackError) {
        console.error(chalk.red('Failed to update tailwind.config.js using fallback method:'), fallbackError.message);
      }
    }
      // Step 4: Create components directory if it doesn't exist
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    try {
      await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Components directory already exists or could not be created.'));
    }
    
    const toastComponentDir = path.join(componentsDir, 'ui');
    try {
      await fs.mkdir(toastComponentDir, { recursive: true });
    } catch (error) {
    } 
    console.log(chalk.blue('Creating toast component...'));
    const toasterExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const toasterComponentPath = path.join(toastComponentDir, `toaster.${toasterExt}`);
    await fs.writeFile(toasterComponentPath, 
      `"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right" 
      richColors 
      closeButton
      className="z-50"
    />
  );
}
`, 'utf8');
    console.log(chalk.blue('Creating a welcome page...'));

    const fileExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const layoutPath = `src/app/layout.${fileExt}`;
    const pagePath = `src/app/page.${fileExt}`;
    
    console.log(chalk.blue(`Using file extension: .${fileExt} for ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}`));
    
    // Read current layout file
    const layoutContent = await fs.readFile(layoutPath, 'utf8');
    
    // Step 5: Update layout to include the theme data attribute for daisyUI
    if (layoutContent) {
      // Add Toaster component
      let updatedLayoutContent = addToasterToLayout(layoutContent, fileExt);
      
      // Update page title
      updatedLayoutContent = updatePageTitle(updatedLayoutContent);
      
      // Add daisyUI theme data attribute to HTML element
      updatedLayoutContent = updatedLayoutContent.replace(
        '<html lang="en">',
        '<html lang="en" data-theme="corporate">'
      );
      
      await fs.writeFile(layoutPath, updatedLayoutContent);
    }
    
    const pageContent = createWelcomePage(fileExt);
    await fs.writeFile(pagePath, pageContent);
      console.log(chalk.green('daisyUI setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up daisyUI:'), error.message);
    console.log(chalk.yellow('You may need to set up daisyUI manually after project creation.'));
  }
  
  process.chdir('..');
}

function addToasterToLayout(layoutContent, fileExt) {
  if (!layoutContent.includes("import { Toaster }")) {
    const importRegex = /^import .+?;/gm;
    let match;
    let lastImportIndex = 0;
    
    // Find the position of the last import
    while ((match = importRegex.exec(layoutContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const toasterComponent = 'import { Toaster } from "@/components/ui/toaster";';
    
    if (lastImportIndex > 0) {
      layoutContent = 
        layoutContent.substring(0, lastImportIndex) + 
        '\n' + toasterComponent + 
        layoutContent.substring(lastImportIndex);
    } else {
      layoutContent = toasterComponent + '\n' + layoutContent;
    }
  }
  
  if (!layoutContent.includes("<Toaster />")) {
    if (layoutContent.includes("{children}")) {
      layoutContent = layoutContent.replace(
        "{children}",
        "{children}\n        <Toaster />"
      );
    } else {
      layoutContent = layoutContent.replace(
        "</body>",
        "        <Toaster />\n      </body>"
      );
    }
  }
  
  return layoutContent;
}

function updatePageTitle(layoutContent) {
  if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
    layoutContent = layoutContent.replace("title: 'Create Next App'", 'title: "HackPack Turbo — Build Fast, Ship Faster"');
    
    if (layoutContent.includes('description:')) {
      layoutContent = layoutContent.replace("description: 'Generated by create next app'", 'description: "Web application created with HackPack"');
    }
  }
  
  return layoutContent;
}

function createWelcomePage(fileExt) {  // For JavaScript
  if (fileExt === 'js' || fileExt === 'jsx') {
    return `"use client"

import { toast } from "sonner";

export default function Home() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed daisyUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="hero min-h-screen bg-gradient-to-b from-primary to-secondary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary-content">Welcome to <span className="text-accent">HackPack</span></h1>
          <p className="py-6 text-primary-content">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Next.js and daisyUI.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <button 
              onClick={handleClick}
              className="btn btn-primary"
            >
              Click me for a toast notification
            </button>
            
            <div className="mt-8 flex gap-4">
              <div className="badge badge-primary">daisyUI</div>
              <div className="badge badge-secondary">Next.js</div>
              <div className="badge badge-accent">HackPack</div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <p className="text-sm opacity-70">
            Edit <code className="bg-base-300 px-1 rounded">src/app/page.js</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
  } 
  // For TypeScript
  else {
    return `"use client"

import { toast } from "sonner";

export default function Home() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed daisyUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="hero min-h-screen bg-gradient-to-b from-primary to-secondary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary-content">Welcome to <span className="text-accent">HackPack</span></h1>
          <p className="py-6 text-primary-content">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Next.js and daisyUI.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <button 
              onClick={handleClick}
              className="btn btn-primary"
            >
              Click me for a toast notification
            </button>
            
            <div className="mt-8 flex gap-4">
              <div className="badge badge-primary">daisyUI</div>
              <div className="badge badge-secondary">Next.js</div>
              <div className="badge badge-accent">HackPack</div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <p className="text-sm opacity-70">
            Edit <code className="bg-base-300 px-1 rounded">src/app/page.tsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
  }
}
