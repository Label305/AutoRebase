import {getInput, setFailed} from '@actions/core';
import {context, GitHub} from '@actions/github';
import Webhooks from '@octokit/webhooks';
import {EligiblePullRequestsRetriever} from './EligiblePullRequests/eligiblePullRequestsRetriever';
import {Rebaser} from './rebaser';
import {TestableEligiblePullRequestsRetriever} from './EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {GithubOpenPullRequestsProvider} from './Github/githubOpenPullRequestsProvider';
import {GithubMergeableStateProvider} from './Github/githubMergeableStateProvider';
import {GithubGetPullRequestService} from './Github/Api/getPullRequestService';

async function run(): Promise<void> {
    try {
        const github = new GitHub(getInput('github_token'));
        const eligiblePullRequestsRetriever: EligiblePullRequestsRetriever = new TestableEligiblePullRequestsRetriever(
            new GithubOpenPullRequestsProvider(
                github,
                new GithubMergeableStateProvider(new GithubGetPullRequestService(github)),
            ),
        );
        const rebaser = new Rebaser(github);

        const payload = context.payload as Webhooks.WebhookPayloadPush;

        const ownerName = payload.repository.owner.name!;
        const repoName = payload.repository.name;

        const pullRequests = await eligiblePullRequestsRetriever.findEligiblePullRequests(ownerName, repoName);

        await rebaser.rebasePullRequests(pullRequests);
    } catch (e) {
        setFailed(e);
    }
}

void run();
