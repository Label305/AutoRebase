import {GitHub, context} from '@actions/github';
import {getInput} from '@actions/core';

async function run() {
    const githubToken = getInput('github_token');
    const octokit: GitHub = new GitHub(githubToken);

    const owner = context.repo.owner;
    const repo = context.repo.repo;

    const pullsResult = await octokit.pulls.list({owner, repo});
    const pullsData = pullsResult.data;
    console.log(pullsData);
}

run();
