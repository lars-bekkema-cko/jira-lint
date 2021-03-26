import * as core from '@actions/core';
import * as github from '@actions/github';

const jiraRegex = /[A-Za-z]{1,10}-\d+/;
const errorMessage = `Please make sure that the PR title follows the standard: OT-XXXX <title>`;

const skipBranch = (branch: string, branchesToSkip: string[]): boolean => {
  for (const branchName of branchesToSkip) {
    if (branch.startsWith(branchName)) {
      return true;
    }
  }

  return false;
};

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', {required: true});
    const octokit = github.getOctokit(token);

    const branchesToSkip = core.getInput('skip-branches').split(',');

    const pullRequest = github.context.payload.pull_request;

    if (pullRequest == null) {
      core.setFailed('No pull request found.');
      return;
    }

    const prNumber = pullRequest.number;
    const branch = pullRequest.head.ref.replace('refs/heads/', '');

    core.debug(`branch -> ${branch}`);
    core.debug(`branchesToSkip -> ${branchesToSkip}`);

    if (skipBranch(branch, branchesToSkip)) {
      core.debug(`skipped branch: ${branch} (${branchesToSkip})`);
    } else {
      const title = pullRequest.title;

      core.debug(`title -> ${title} -> ${jiraRegex.test(title)}`);

      if (!jiraRegex.test(title)) {
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
