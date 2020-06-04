import {MergeableState} from '../../pullrequestinfo';

export interface ApiPullRequest {
    mergeableState: MergeableState | undefined;
}
