#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 1. Setup Paths
// __dirname is /node_modules/nh-library/cli
// We need to go up one level to reach /node_modules/nh-library/
const libraryRoot = path.join(__dirname, "..");
const projectRoot = process.cwd();

// 2. Get the component name from CLI arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error("\x1b[31m%s\x1b[0m", "Error: Please specify a component name.");
  console.log("Usage: npx nh-library <ComponentName>");
  process.exit(1);
}

// 3. Load the registry
const registryPath = path.join(libraryRoot, "registry", "components.json");

if (!fs.existsSync(registryPath)) {
  console.error("\x1b[31m%s\x1b[0m", "Error: Registry file not found in the library.");
  process.exit(1);
}

const registry = require(registryPath);

const componentConfig = registry[componentName];

if (!componentConfig) {
  console.error("\x1b[31m%s\x1b[0m", `Error: Component "${componentName}" not found in registry.`);
  console.log("Available components:", Object.keys(registry).join(", "));
  process.exit(1);
}

// 4. Define Destination (Standardizing on src/components/ui)
const destFolder = path.join(projectRoot, "src", "components", "ui", componentName);

// 5. Recursive Copy Function
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`  \x1b[32m%s\x1b[0m`, `ADDED: ${path.relative(projectRoot, dest)}`);
  }
}

// 6. Execution
console.log(`\nInstalling ${componentName} into your project...`);

try {
  componentConfig.files.forEach((fileRelativePath) => {
    // Construct the absolute path to the source in node_modules
    const sourcePath = path.join(libraryRoot, fileRelativePath);

    if (fs.existsSync(sourcePath)) {
      copyRecursive(sourcePath, destFolder);
    } else {
      console.warn(`\x1b[33m%s\x1b[0m`, `Warning: Source path not found: ${fileRelativePath}`);
    }
  });

  console.log(`\n\x1b[32m%s\x1b[0m`, `Success! ${componentName} is ready to use.`);
  console.log(`Location: /src/components/ui/${componentName}\n`);
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "An error occurred during installation:");
  console.error(error);
}