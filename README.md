# JIRA lint action

Consistency check between pull requests and JIRA issues

## Inputs

### `github-token`

**Required** Github token of the repository (automatically created by Github).

### `skip-branches`

List of terms to look for to whitelist the branch (ignore JIRA ticket check)

## Example usage

```yml
uses: lars-bekkema-cko/jira-lint-action@v1
with:
  github-token: ${{secrets.GITHUB_TOKEN}}
  skip-branches: 'dependabot,no-jira'
```

## Contribution

### Code in Main

Install the dependencies  
```bash
$ yarn install
```

Build the typescript and package it for distribution
```bash
$ yarn build
```

### Publish to a distribution branch

Then [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ yarn package
$ git add dist
$ git commit -m "<commit message>"
$ git tag -am  "<commit message>" v1
$ git push --follow-tags
```

Your action is now published! :rocket:
