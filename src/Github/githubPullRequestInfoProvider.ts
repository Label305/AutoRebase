import {GetPullRequestService} from './Api/getPullRequestService';
import {mergeableStates, PullRequestInfo} from '../pullrequestinfo';
import {debug} from '@actions/core';
import {promiseRetry} from '../Util/promiseRetry';

export class GithubPullRequestInfoProvider {
    constructor(private getPullRequestService: GetPullRequestService) {}

    public pullRequestInfoFor(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<PullRequestInfo> {
        return promiseRetry<PullRequestInfo>(
            async (): Promise<PullRequestInfo> => {
                try {
                    const {rebaseable, mergeableState, labels} = await this.getPullRequestService.getPullRequest(
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

                    debug(`rebaseable value for pull request #${pullRequestNumber}: ${String(rebaseable)}`);
                    debug(`mergeableState for pull request #${pullRequestNumber}: ${mergeableState}`);

                    return {
                        ownerName: ownerName,
                        repoName: repoName,
                        number: pullRequestNumber,
                        rebaseable: rebaseable,
                        mergeableState: mergeableState,
                        labels: labels,
                    };
                } catch (error) {
                    debug(
                        `Fetching mergeableState for pull request #${pullRequestNumber} failed: "${String(
                            error,
                        )}", retrying.`,
                    );
                    throw error;
                }
            },
        );
    }
}
