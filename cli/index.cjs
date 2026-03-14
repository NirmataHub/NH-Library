#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Get the component name from CLI arguments
const componentName = process.argv[2]

if (!componentName) {
  console.log("Please specify a component. Example: NH-Library ComponentTest")
  process.exit(1)
}

// Load the registry
const registry = require("../registry/components.json")

if (!registry[componentName]) {
  console.log(`Component "${componentName}" not found in registry.`)
  process.exit(1)
}

// Destination folder in the target project
const destFolder = path.join(process.cwd(), "src/components/ui", componentName)

// Ensure destination folder exists
fs.mkdirSync(destFolder, { recursive: true })

// Function to copy a folder recursively
function copyFolderRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true })
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyFolderRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copied ${entry.name} → ${destPath}`)
    }
  })
}

// Copy all files/folders listed in the registry
registry[componentName].files.forEach((file) => {
  const source = path.join(__dirname, "..", file)
  copyFolderRecursive(source, destFolder)
})

console.log(`Component "${componentName}" installed successfully!`)