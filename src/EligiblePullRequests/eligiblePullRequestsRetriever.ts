import {PullRequestInfo} from '../pullrequestinfo';

export interface EligiblePullRequestsRetriever {
    findEligiblePullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]>;
}
