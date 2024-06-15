// oldName is template-thing
// newName is new-module-name
import fs from "fs/promises";
import path from "path";

export function replaceStr(content: string, oldName: string, pack: string, newName: string): string {
  const oldNameUpper = oldName.toUpperCase().replace(/-/g, '_');
  const oldNameLower = oldNameUpper.toLowerCase();
  const oldNameCamel = oldName.replace(/-([a-z])/g, g => g[1].toUpperCase());
  const oldNameUpperCamel = oldNameCamel.charAt(0).toUpperCase() + oldNameCamel.slice(1);

  const newNameUpper = newName.toUpperCase().replace(/-/g, '_');
  const newNameLower = newNameUpper.toLowerCase();
  const newNameCamel = newName.replace(/-([a-z])/g, g => g[1].toUpperCase());
  const newNameUpperCamel = newNameCamel.charAt(0).toUpperCase() + newNameCamel.slice(1);

  return content
    .replace('boar-plate', 'boar-pack')
    .replace('/packages/api/', '/packages/' + pack + '-backend/')
    .replace('/packages/ui/', '/packages/' + pack + '-frontend/')
    .replace(new RegExp(oldNameUpper, 'g'), newNameUpper)
    .replace(new RegExp(oldNameLower, 'g'), newNameLower)
    .replace(new RegExp(oldNameCamel, 'g'), newNameCamel)
    .replace(new RegExp(oldNameUpperCamel, 'g'), newNameUpperCamel)
    .replace(new RegExp(oldName, 'gi'), newName)
    .replace('// @ts-nocheck\n', '');
}

export async function copyAndRenameFiles(srcDir: string, oldName: string, pack: string, newName: string): Promise<void> {
  try {
    const destDir = replaceStr(srcDir, oldName, pack, newName);
    await fs.mkdir(destDir, { recursive: true });

    const items = await fs.readdir(srcDir);
    for (const item of items) {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, replaceStr(item, oldName, pack, newName));

      const stat = await fs.lstat(srcPath);
      if (stat.isDirectory()) {
        await copyAndRenameFiles(srcPath, oldName, pack, newName);
      } else {
        let content = await fs.readFile(srcPath, 'utf8');
        content = replaceStr(content, oldName, pack, newName);
        await fs.writeFile(destPath, content, 'utf8');
      }
    }
  } catch (error) {
    console.error(`Error copying and renaming files: ${error.message}`);
  }
}
