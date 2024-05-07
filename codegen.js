const fs = require("fs");
const path = require("path");

const BASE_PATH = path.resolve(__dirname, "./components");
const TOTAL_CHARACTERS = 2 ** 32;
const FILES_COUNT = 20000;
const CHARACTERS_PER_FILE = TOTAL_CHARACTERS / (FILES_COUNT * 2);
const CHARACTERS_PER_STRING = 2 ** 8;

const generateFiles = () => {
  for (let i = 1; i <= FILES_COUNT; i++) {
    fs.writeFileSync(
      path.resolve(BASE_PATH, `./Component${i}.jsx`),
      `const Component${i} = () => <div>${Array(
        Math.floor(CHARACTERS_PER_FILE / CHARACTERS_PER_STRING)
      )
        .fill(0)
        .map(() => "r".repeat(CHARACTERS_PER_STRING))
        .map((str) => `<p>${str}</p>`)
        .join("\n")}</div>;\nexport default Component${i};\n`
    );
  }
};

const generateIndexFile = () => {
  const indexPath = path.resolve(BASE_PATH, `./index.jsx`);
  let imports_code = "";
  let mount_code = "";

  for (let i = 1; i <= FILES_COUNT; i++) {
    imports_code += `const Component${i} = dynamic(() => import("./Component${i}"));\n`;
    mount_code += `<Component${i} />\n`;
  }

  fs.writeFileSync(
    indexPath,
    `${imports_code}\n\nexport const Component = () => <div>${mount_code}</div>;`
  );
};

generateFiles();
generateIndexFile();
