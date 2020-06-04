import {GetPullRequestService} from './Api/getPullRequestService';
import {MergeableState, mergeableStates} from '../pullrequestinfo';
import {debug} from '@actions/core';
import promiseRetry from 'promise-retry';

export class GithubMergeableStateProvider {
    constructor(private getPullRequestService: GetPullRequestService) {}

    async mergeableStateFor(ownerName: string, repoName: string, pullRequestNumber: number): Promise<MergeableState> {
        return promiseRetry<MergeableState>(
            async (retry: (error: unknown) => void): Promise<MergeableState> => {
                try {
                    const {mergeableState} = await this.getPullRequestService.getPullRequest(
                        ownerName,
                        repoName,
                        pullRequestNumber,
                    );

                    if (mergeableState === undefined) {
                        throw Error('mergeableState is undefined');
                    }

                    if (mergeableState === 'unknown' || !mergeableStates.includes(mergeableState)) {
                        debug(`mergeableState for pull request #${pullRequestNumber} is 'unknown', retrying.`);
                        throw Error("mergeableState is 'unknown'");
                    }

                    debug(`mergeableState for pull request #${pullRequestNumber}: ${mergeableState}`);
                    return mergeableState;
                } catch (error) {
                    debug(
                        `Fetching mergeableState for pull request #${pullRequestNumber} failed: "${String(
                            error,
                        )}", retrying.`,
                    );
                    retry(error);
                    throw error;
                }
            },
            {minTimeout: 500},
        );
    }
}
