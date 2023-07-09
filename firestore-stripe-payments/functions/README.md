# Deploying Extension

- Extension should be deployed via `music-bingo-api` project, not this one. See `README.md` in `music-bingo-api` for instructions.
- For private packages, `.npmrc` must exist locally in this folder and will be uploaded to Firebase as part of the `deploy` action. This is not checked to source control and will need to be created manually when cloning the repo.

```
  @matthewlongpre:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=GITHUB_PACKAGES_TOKEN_HERE
```