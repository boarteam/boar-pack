import * as fs from 'fs';
import * as path from 'path';
import { copyAndRenameFiles } from "./tools";

// Directory containing the template module
const templateDir = path.join(__dirname, '../../boar-plate/packages/api/src/modules/template-things');

if (!fs.existsSync(templateDir)) {
  console.error(
    'Templates not found. This generator is maintainer-only: it requires a checkout of the private\n' +
    'boarteam/boar-plate repository next to this one (../boar-plate). See CONTRIBUTION.md.'
  );
  process.exit(1);
}

const pack = process.argv[2];
if (!pack) {
  console.error('Please provide a package name.');
  process.exit(1);
}

// Get the module name from the command line arguments
const newModuleName = process.argv[3];
if (!newModuleName) {
  console.error('Please provide a new module name.');
  process.exit(1);
}

copyAndRenameFiles(templateDir, 'template-thing', pack, newModuleName)
  .then(() => console.log(`Module ${newModuleName} created successfully.`))
  .catch(error => console.error(`Failed to create module ${newModuleName}: ${error.message}`));
