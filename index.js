const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const githubToken = core.getInput('github_token');

    const octokit = new github.GitHub(githubToken);

    const { data: pullRequest } = await octokit.pulls.get({
        owner: 'octokit',
        repo: 'rest.js',
        pull_number: 123,
        mediaType: {
            format: 'diff'
        }
    });

    console.log(pullRequest);
}

run();