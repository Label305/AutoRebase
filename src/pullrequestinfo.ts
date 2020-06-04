export type PullRequestInfo = {
    ownerName: string;
    repoName: string;
    number: number;
    rebaseable: boolean;
    mergeableState: MergeableState;
    labels: string[];
};

/**
 * See https://developer.github.com/v4/enum/mergestatestatus/
 */
export type MergeableState = 'behind' | 'blocked' | 'clean' | 'dirty' | 'unknown' | 'unstable';

export const mergeableStates: MergeableState[] = ['behind', 'blocked', 'clean', 'dirty', 'unknown', 'unstable'];
