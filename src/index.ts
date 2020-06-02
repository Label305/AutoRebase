const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const githubToken = core.getInput('github_token');
    const octokit: GitHub = new github.GitHub(githubToken);

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    const pullsResult = await octokit.pulls.list({owner, repo})
    const pullsData = pullsResult.data
    console.log(pullsData);
}

run();