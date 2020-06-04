import {getInput, setFailed} from '@actions/core';
import {context, GitHub} from '@actions/github';
import Webhooks from '@octokit/webhooks';
import {EligiblePullRequestsRetriever} from './EligiblePullRequests/eligiblePullRequestsRetriever';
import {Rebaser} from './rebaser';
import {TestableEligiblePullRequestsRetriever} from './EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {GithubPullRequestInfoProvider} from './Github/githubPullRequestInfoProvider';
import {GithubGetPullRequestService} from './Github/Api/getPullRequestService';
import {GithubListPullRequestsService} from './Github/Api/listPullRequestsService';
import {GithubLabelPullRequestService} from './Github/githubLabelPullRequestService';
import {GithubOpenPullRequestsProvider} from './Github/githubOpenPullRequestsProvider';
import {Labeler} from './NonRebaseablePullRequests/labeler';

async function run(): Promise<void> {
    try {
        const github = new GitHub(getInput('github_token'));
        const openPullRequestsProvider = new GithubOpenPullRequestsProvider(
            new GithubListPullRequestsService(github),
            new GithubPullRequestInfoProvider(new GithubGetPullRequestService(github)),
        );
        const eligiblePullRequestsRetriever: EligiblePullRequestsRetriever = new TestableEligiblePullRequestsRetriever(
            openPullRequestsProvider,
        );
        const rebaser = new Rebaser(github);
        const labeler = new Labeler(openPullRequestsProvider, new GithubLabelPullRequestService(github));

        const payload = context.payload as Webhooks.WebhookPayloadPush;

        const ownerName = payload.repository.owner.login;
        const repoName = payload.repository.name;

        const pullRequests = await eligiblePullRequestsRetriever.findEligiblePullRequests(ownerName, repoName);

        await rebaser.rebasePullRequests(pullRequests);
        await labeler.labelNonRebaseablePullRequests(ownerName, repoName);
    } catch (e) {
        setFailed(e);
    }
}

void run();
