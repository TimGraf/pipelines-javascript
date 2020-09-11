const { GitHubClient, MergeError } = require('./github-client');

const ACCESS_TOKEN = process.env.PAT;
const SYNC_BRANCH_NAME = process.env.SYNC_BRANCH_NAME;
const REPO_OWNER = 'timgraf';
const REPO = 'pipelines-javascript';

const client = new GitHubClient(ACCESS_TOKEN, REPO_OWNER, REPO);

const handleMergeError = (error, branchName) => {
    const message = `
    Merge from master into ${branchName} branch failed.

    In order to correct this manual intervention is required.

    Manually pull the ${branchName} branch and perform a merge from
    master and correct any possible merge conflicts.
    `;

    console.log(error);
    console.log(message);
};

(async () => {
    try {
        const getDevelopBranchResponse = await client.getBranchInfo('development');
        const developSha = getDevelopBranchResponse.data.commit.sha;

        const createBranchResponse = await client.createSyncBranch(developSha, SYNC_BRANCH_NAME);
        const mergeResponse = await client.mergeBranches('master', SYNC_BRANCH_NAME);
        const pullRequestResponse = await client.createPullRequest(SYNC_BRANCH_NAME, 'development');

        process.exit(0);
    } catch (error) {
        if (error instanceof MergeError) {
            handleMergeError(error, SYNC_BRANCH_NAME);
            process.exit(1);
        } else {
            console.log(error);
            process.exit(1);
        }
    }
})();
