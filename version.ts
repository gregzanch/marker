import { parseArgs } from "jsr:@std/cli/parse-args";

type VersionString = `${number}.${number}.${number}`;
type Version = "major" | "minor" | "patch" | VersionString;

const versionRegex = /\d+\.\d+\.\d+/gi;

const paths = {
  README: "./README.md",
  packageJson: "./app/package.json",
};

function getCurrentVersion(): VersionString {
  const fileText = Deno.readTextFileSync(paths.README);
  const lines = fileText.split("\n");
  for (const line of lines) {
    if (line.includes(`id="version"`)) {
      const matches = line.match(versionRegex);
      if (!matches) {
        throw new Error("Could not find the existing version in the readme");
      }
      for (const match of matches) {
        return match as VersionString;
      }
    }
  }
  throw new Error("Could not find the existing version in the readme");
}

function parseVersionString(version: VersionString): [number, number, number] {
  const split = version.split(".").map(Number);
  if (split.length !== 3) {
    throw new Error(`Failed to parse version ${version}`);
  }
  return split as [number, number, number];
}

const transformers = {
  [paths.README]: (version: VersionString): string => {
    const fileText = Deno.readTextFileSync(paths.README);
    const lines = fileText.split("\n");
    for (const lineIndex in lines) {
      if (lines[lineIndex].includes(`id="version"`)) {
        lines[lineIndex] = lines[lineIndex].replace(versionRegex, version);
      }
    }
    return lines.join("\n");
  },
  [paths.packageJson]: (version: VersionString) => {
    const fileText = Deno.readTextFileSync(paths.packageJson);
    const parsed = JSON.parse(fileText);
    parsed.version = version;
    const stringified = JSON.stringify(parsed, undefined, 2);
    return stringified;
  },
};

function getVersionArg(): Version {
  const flags = parseArgs(Deno.args, {
    string: ["version"],
  });
  if (!flags.version) {
    throw new Error("Version was not supplied");
  }
  if (flags.version === "major") return "major";
  if (flags.version === "minor") return "minor";
  if (flags.version === "patch") return "patch";
  const versionRegex = /\d+\.\d+\.\d+/gi;
  if (!versionRegex.test(flags.version)) {
    throw new Error("Version must be of the form #.#.#");
  }
  return flags.version as VersionString;
}

function getModifiedVersion(): VersionString {
  const versionArg = getVersionArg();
  const currentVersion = getCurrentVersion();
  let modifiedVersion = currentVersion;
  switch (versionArg) {
    case "major": {
      const parsed = parseVersionString(currentVersion);
      parsed[0] += 1;
      parsed[1] = 0;
      parsed[2] = 0;
      modifiedVersion = parsed.join(".") as VersionString;
      break;
    }
    case "minor": {
      const parsed = parseVersionString(currentVersion);
      parsed[1] += 1;
      parsed[2] = 0;
      modifiedVersion = parsed.join(".") as VersionString;
      break;
    }
    case "patch": {
      const parsed = parseVersionString(currentVersion);
      parsed[2] += 1;
      modifiedVersion = parsed.join(".") as VersionString;
      break;
    }
    default:
      modifiedVersion = versionArg as VersionString;
      break;
  }
  return modifiedVersion;
}

function main() {
  const newVersion = getModifiedVersion();
  for (const [path, transform] of Object.entries(transformers)) {
    console.log(`Updating ${path} to version ${newVersion}`);
    const transformed = transform(newVersion);
    Deno.writeTextFileSync(path, transformed);
  }
}

main();
