export function dropTrailZeroes(str: string | undefined) {
  if (typeof str === 'string' && str.includes(".")) {
    return str.replace(/\.?0*$/, "");
  }
  return str;
}
