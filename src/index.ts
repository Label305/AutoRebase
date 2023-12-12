import {debug, getInput, info, setFailed} from '@actions/core';
import {GitHub, context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import EventPayloads from '../node_modules/@octokit/webhooks';
import {EligiblePullRequestsRetriever} from './EligiblePullRequests/eligiblePullRequestsRetriever';
import {TestableEligiblePullRequestsRetriever} from './EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {GithubGetPullRequestService} from './Github/Api/getPullRequestService';
import {GithubListPullRequestsService} from './Github/Api/listPullRequestsService';
import {GithubLabelPullRequestService} from './Github/githubLabelPullRequestService';
import {GithubOpenPullRequestsProvider} from './Github/githubOpenPullRequestsProvider';
import {GithubPullRequestInfoProvider} from './Github/githubPullRequestInfoProvider';
import {Labeler} from './NonRebaseablePullRequests/labeler';
import {RealGithubRebase} from './Rebaser/githubRebase';
import {Rebaser} from './Rebaser/rebaser';

async function run(): Promise<void> {
    try {
        const github = new GitHub(getInput('github_token'));
        const baseBranch = getInput('base_branch', {required: false});
        const startLimit = (await github.rateLimit.get()).data.rate;
        debug(`Rate limit at start: ${JSON.stringify(startLimit)}`);

        const openPullRequestsProvider = new GithubOpenPullRequestsProvider(
            new GithubListPullRequestsService(github),
            new GithubPullRequestInfoProvider(new GithubGetPullRequestService(github)),
        );
        const eligiblePullRequestsRetriever: EligiblePullRequestsRetriever = new TestableEligiblePullRequestsRetriever(
            openPullRequestsProvider,
        );
        const rebaser = new Rebaser(new RealGithubRebase((github as unknown) as Octokit));
        const labeler = new Labeler(openPullRequestsProvider, new GithubLabelPullRequestService(github));

        const payload = context.payload as EventPayloads.WebhookPayloadPush;

        const ownerName = payload.repository.owner.login;
        const repoName = payload.repository.name;

        info(`Finding eligible pull requests..`);
        const pullRequests = await eligiblePullRequestsRetriever.findEligiblePullRequests(ownerName, repoName);
        debug(JSON.stringify((await github.rateLimit.get()).data.rate));

        info(`Rebasing ${pullRequests.length} pull requests..`);
        await rebaser.rebasePullRequests(pullRequests, baseBranch);

        await labeler.createOptInLabel(ownerName, repoName);
        await labeler.labelNonRebaseablePullRequests(ownerName, repoName);
        const endLimit = (await github.rateLimit.get()).data.rate;

        debug(
            `Rate limit at end: ${JSON.stringify(endLimit)} (~${startLimit.remaining - endLimit.remaining} requests*)`,
        );
    } catch (e) {
        setFailed(JSON.stringify(e));
    }
}

void run();
