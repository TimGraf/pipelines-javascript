const { GitHubClient, MergeError } = require('./github-client');
const shortUUID = require('short-uuid');

const args = process.argv.slice(2);
const ACCESS_TOKEN = args[0];
const REPO_OWNER = 'timgraf';
const REPO = 'pipelines-javascript';

const client = new GitHubClient(ACCESS_TOKEN, REPO_OWNER, REPO);

const handleMergeError = (error) => {
    const message = '';

    console.log(message);
    console.log(error);
};

const main = async () => {
    try {
        const syncBranchName = `sync-${shortUUID.generate()}`;
        const getBranchResponse = await client.getBranchSha('development');
        const developSha = getBranchResponse.data.commit.sha;

        const createBranchResponse = await client.createSyncBranch(developSha, syncBranchName);
        const mergeResponse = await client.mergeBranches('master', syncBranchName);
        const pullRequestResponse = await client.createPullRequest(syncBranchName, 'development');
    } catch (error) {
        if (error instanceof MergeError) {
            handleMergeError(error);
        } else {
            console.log(error);
        }
    }
};

main();
