import {debug, getInput, setFailed} from '@actions/core';
import {context, GitHub} from '@actions/github';
import {Octokit} from '@octokit/rest';
import Webhooks from '@octokit/webhooks';
import {rebasePullRequest} from 'github-rebase/lib';

// const github = require('@actions/github');

async function run() {
    try {
        let github = new GitHub(getInput('github_token'));
        const octokit = (github as any) as Octokit;

        let payload = context.payload as Webhooks.WebhookPayloadPush;
        debug(payload.repository.owner.name as any);
        debug(payload.repository.name);

        debug(context.issue.number as any);

        await rebasePullRequest({
            octokit,
            owner: payload.repository.owner.name!,
            pullRequestNumber: 8,
            repo: payload.repository.name,
        });
    } catch (e) {
        // await exec('git status');
        // await exec('git diff');

        setFailed(e);
    }
}

// const example = async () => {
//     const newHeadSha = await rebasePullRequest({
//         // An already authenticated instance of https://www.npmjs.com/package/@octokit/rest.
//         octokit,
//         // The username of the repository owner.
//         owner: "tibdex",
//         // The number of the pull request to rebase.
//         pullRequestNumber: 1337,
//         // The name of the repository.
//         repo: "my-cool-project",
//     });
// };

run();
