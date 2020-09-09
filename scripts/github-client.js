const axios = require('axios').default;

class MergeError extends Error {
    constructor(...params) {
        super(...params);
  
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MergeError);
        }
    
        this.name = 'MergeError';
    }
}

class GitHubClient {
    constructor(accessToken, repoOwner, repo) {
        this.client = axios.create({
            baseURL: 'https://api.github.com/',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${accessToken}`
            }
        });
        this.repoOwner = repoOwner;
        this.repo = repo;
    }

    getBranchSha(branch) {
        const GET_BRANCHES_URL = `repos/${this.repoOwner}/${this.repo}/branches/${branch}`;
        return this.client.get(GET_BRANCHES_URL);
    }

    createSyncBranch(developSha, syncBranchName) {
        const CREATE_BRANCH_URL = `repos/${this.repoOwner}/${this.repo}/git/refs`;
        const postData = {
            ref: `refs/heads/${syncBranchName}`,
            sha: developSha
        };
        return this.client.post(CREATE_BRANCH_URL, postData);
    }

    mergeBranches(fromBranch, toBranch) {
        const MERGE_BRANCH_URL = `/repos/${this.repoOwner}/${this.repo}/merges`;
        const postData = {
            head: fromBranch,
            base: toBranch,
            commit_message: `Merge ${fromBranch} into ${toBranch}`
          };
        return this.client.post(MERGE_BRANCH_URL, postData);
    }

    createPullRequest(fromBranch, toBranch) {
        const CREATE_PULL_REQUEST_URL = `/repos/${this.repoOwner}/${this.repo}/pulls`;
        const postData = {
            title: `Merge ${fromBranch} into ${toBranch}`,
            body: `Merge ${fromBranch} into ${toBranch}`,
            head: fromBranch,
            base: toBranch
          };
        return this.client.post(CREATE_PULL_REQUEST_URL, postData);
    }
}

module.exports = { GitHubClient, MergeError }