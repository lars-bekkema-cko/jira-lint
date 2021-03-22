import * as core from '@actions/core';
import * as github from '@actions/github';

const jiraRegex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)\s.+/gm;
const errorMessage = `Please make sure that the PR title follows the standard: OT-XXXX - <title>`;

const ignoreBranch = (branch: string, ignoreBranchTerms: string[]): boolean => {
  for (const branchTerm of ignoreBranchTerms) {
    if (branch.startsWith(branchTerm)) {
      return true;
    }
  }

  return false;
};

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', {required: true});
    const octokit = github.getOctokit(token);

    const ignoreBranchTerms = core.getInput('branch-term-whitelist').split(',');

    const pullRequest = github.context.payload.pull_request;

    if (pullRequest == null) {
      core.setFailed('No pull request found.');
      return;
    }

    const prNumber = pullRequest.number;
    const branch = pullRequest.head.ref.replace('refs/heads/', '');

    core.debug(`branch -> ${branch}`);
    core.debug(`ignoreBranchTerms -> ${ignoreBranchTerms}`);

    if (ignoreBranch(branch, ignoreBranchTerms)) {
      core.debug(
        `branch is in the whitelist -> ${branch} ${ignoreBranchTerms}`
      );
    } else {
      const title = pullRequest.title;
      const body = pullRequest.body;

      core.debug(`title -> ${title} -> ${jiraRegex.test(title)}`);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      core.debug(`body -> ${body} -> ${jiraRegex.test(body!)}`);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!jiraRegex.test(title) && !jiraRegex.test(body!)) {
        core.setFailed(errorMessage);
        await octokit.issues.createComment({
          ...github.context.repo,
          issue_number: prNumber,
          body: errorMessage
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
