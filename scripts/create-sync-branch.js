const { GitHubClient, MergeError } = require('./github-client');

const args = process.argv.slice(2);
const ACCESS_TOKEN = args[0];
const REPO_OWNER = 'timgraf';
const REPO = 'pipelines-javascript';

const client = new GitHubClient(ACCESS_TOKEN, REPO_OWNER, REPO);

const handleMergeError = (error, branchName) => {
    const message = `Merge from master into ${branchName} branch failed.
        In order to correct this manual intervention is required.
        Manually pull the ${branchName} branch and perform a merge from
        master and correct any possible merge conflicts.`;

    console.log(message);
    console.log(error);
};

const main = async () => {
    const dateString = new Date().toISOString().replace(/\./g, '-').replace(/\:/g, '-');
    const syncBranchName = `sync-master-to-develop-${dateString}`;

    try {
        const getDevelopBranchResponse = await client.getBranchInfo('development');
        const developSha = getDevelopBranchResponse.data.commit.sha;

        const createBranchResponse = await client.createSyncBranch(developSha, syncBranchName);
        const mergeResponse = await client.mergeBranches('master', syncBranchName);
        const pullRequestResponse = await client.createPullRequest(syncBranchName, 'development');

        process.exit(0);
    } catch (error) {
        if (error instanceof MergeError) {
            handleMergeError(error, syncBranchName);
            process.exit(1);
        } else {
            console.log(error);
            process.exit(1);
        }
    }
};

main();
