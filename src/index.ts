import {getInput, setFailed} from '@actions/core';
import {context, GitHub} from '@actions/github';
import Webhooks from '@octokit/webhooks';
import {EligiblePullRequestsRetriever} from './EligiblePullRequests/eligiblePullRequestsRetriever';
import {Rebaser} from './rebaser';
import {TestableEligiblePullRequestsRetriever} from './EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {GithubOpenPullRequestsProvider} from './EligiblePullRequests/githubOpenPullRequestsProvider';

async function run() {
    try {
        let github = new GitHub(getInput('github_token'));
        let eligiblePullRequestsRetriever: EligiblePullRequestsRetriever = new TestableEligiblePullRequestsRetriever(
            new GithubOpenPullRequestsProvider(github),
        );
        let rebaser = new Rebaser(github);

        let payload = context.payload as Webhooks.WebhookPayloadPush;

        const ownerName = payload.repository.owner.name!;
        const repoName = payload.repository.name;

        const pullRequests = await eligiblePullRequestsRetriever.findEligiblePullRequests(ownerName, repoName);

        await rebaser.rebasePullRequests(pullRequests);
    } catch (e) {
        setFailed(e);
    }
}

run();
