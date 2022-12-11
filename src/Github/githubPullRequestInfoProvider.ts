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
            async (attemptNumber): Promise<PullRequestInfo> => {
                try {
                    const {draft, rebaseable, mergeableState, labels} = await this.getPullRequestService.getPullRequest(
                        ownerName,
                        repoName,
                        pullRequestNumber,
                    );

                    if (attemptNumber < 10 && !draft) {
                        if (mergeableState === 'unknown' || !mergeableStates.includes(mergeableState)) {
                            debug(`mergeableState for pull request #${pullRequestNumber} is 'unknown', retrying.`);
                            throw Error("mergeableState is 'unknown'");
                        }
                    }

                    const {approved} = await this.getPullRequestService.getPullRequestReviews(
                        ownerName,
                        repoName,
                        pullRequestNumber,
                    );

                    debug(`rebaseable value for pull request #${pullRequestNumber}: ${String(rebaseable)}`);
                    debug(`mergeableState for pull request #${pullRequestNumber}: ${mergeableState}`);
                    debug(`approved for pull request #${pullRequestNumber}: ${String(approved)}`);

                    return {
                        ownerName: ownerName,
                        repoName: repoName,
                        number: pullRequestNumber,
                        draft: draft,
                        rebaseable: rebaseable,
                        mergeableState: mergeableState,
                        labels: labels,
                        approved: approved,
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
