export type PullRequestInfo = {
    ownerName: string;
    repoName: string;
    number: number;
    mergeableState: MergeableState;
};

/**
 * See https://developer.github.com/v4/enum/mergestatestatus/
 */
export type MergeableState = 'behind' | 'blocked' | 'clean' | 'dirty' | 'unknown' | 'unstable';
