const fs = require('fs');
const path = require('path');

const GITHUB_PACKAGES_TOKEN = process.env.GITHUB_PACKAGES_TOKEN;

function createNpmrcFile() {
  const GITHUB_USERNAME = 'matthewlongpre';

  const npmrcContent = `
@${GITHUB_USERNAME}:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
`;

  const npmrcPath = path.join(__dirname, '.npmrc');
  fs.writeFileSync(npmrcPath, npmrcContent);
}

if (GITHUB_PACKAGES_TOKEN) {
  createNpmrcFile();
} else {
  console.log(
    `GITHUB_PACKAGES_TOKEN is not set. Skipping creating .npmrc file`
  );
}
