import {GetPullRequestService} from './Api/getPullRequestService';
import {MergeableState, mergeableStates} from '../pullrequestinfo';
import {debug} from '@actions/core';

// tslint:disable-next-line:no-var-requires (otherwise we get the error TS2497).
const promiseRetry = require('promise-retry');

export class GithubMergeableStateProvider {
    private getPullRequestService: GetPullRequestService;

    constructor(getPullRequestService: GetPullRequestService) {
        this.getPullRequestService = getPullRequestService;
    }

    async mergeableStateFor(ownerName: string, repoName: string, pullRequestNumber: number): Promise<MergeableState> {
        return promiseRetry(
            async (retry: (error: any) => void) => {
                try {
                    const {mergeable_state: mergeable_state} = await this.getPullRequestService.getPullRequest(
                        ownerName,
                        repoName,
                        pullRequestNumber,
                    );

                    if (mergeable_state == 'unknown' || !mergeableStates.includes(mergeable_state as MergeableState)) {
                        debug(`mergeable_state for pull request #${pullRequestNumber} is 'unknown', retrying.`);
                        return retry(Error("mergeable_state is 'unknown'"));
                    }

                    debug(`mergeable_state for pull request #${pullRequestNumber}: ${mergeable_state}`);
                    return mergeable_state;
                } catch (error) {
                    debug(
                        `Fetching mergeable_state for pull request #${pullRequestNumber} failed: "${error}", retrying.`,
                    );
                    return retry(error);
                }
            },
            {minTimeout: 500},
        );
    }
}
