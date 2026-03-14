#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const RAW_BASE_URL = "https://raw.githubusercontent.com/NirmataHub/NH-Library/main/";
const componentName = process.argv[2];
const libraryRoot = path.join(__dirname, "..");

// 1. Load Registry
const registryPath = path.join(libraryRoot, "registry", "components.json");
if (!fs.existsSync(registryPath)) {
  console.error("❌ Registry not found.");
  process.exit(1);
}
const registry = require(registryPath);

if (!componentName || !registry[componentName]) {
  console.error(`❌ Component "${componentName || ''}" not found.`);
  console.log("Available:", Object.keys(registry).join(", "));
  process.exit(1);
}

async function downloadComponent() {
  const componentConfig = registry[componentName];
  const projectRoot = process.cwd();
  
  // Smart pathing: if user is in 'src', don't add another 'src'
  const baseFolder = path.basename(projectRoot) === "src" ? "" : "src";
  const destFolder = path.join(projectRoot, baseFolder, "components", "ui", componentName);

  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  console.log(`\n🚀 Installing ${componentName}...`);

  for (const fileRelativePath of componentConfig.files) {
    const url = `${RAW_BASE_URL}${fileRelativePath}`;
    const fileName = path.basename(fileRelativePath);
    const destPath = path.join(destFolder, fileName);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.statusText}`);
      
      const content = await response.text();
      fs.writeFileSync(destPath, content);
      console.log(`  ✅ Downloaded: ${fileName}`);
    } catch (err) {
      console.error(`  ❌ Failed to download ${fileName}: ${err.message}`);
    }
  }

  console.log(`\n✨ Success! ${componentName} is now in /src/components/ui/${componentName}\n`);
}

downloadComponent();