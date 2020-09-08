const axios = require('axios').default;
const shortUUID = require('short-uuid');

const args = process.argv.slice(2);
const ACCESS_TOKEN = args[0];
const REPO_OWNER = 'timgraf';
const REPO = 'pipelines-javascript';

const client = axios.create({
    baseURL: 'https://api.github.com/',
    headers: {
        'Accept': 'application/vnd.github.mister-fantastic-preview+json',
        'Content-Type': 'application/json',
        'Authorization': `token ${ACCESS_TOKEN}`
    }
})

const main = async () => {
    try {
        const syncBranchName = `sync-${shortUUID.generate()}`;
        const getBranchResponse = await getBranchSha('development');
        const developSha = getBranchResponse.data.commit.sha;

        const createBranchResponse = await createSyncBranch(developSha, syncBranchName);
        const mergeResponse = await mergeBranches('master', syncBranchName);
        const pullRequestResponse = await createPullRequest(syncBranchName, 'development');
    } catch (error) {
        console.log(error);
    }
};

const getBranchSha = async (branch) => {
    const GET_BRANCHES_URL = `repos/${REPO_OWNER}/${REPO}/branches/${branch}`;
    return client.get(GET_BRANCHES_URL);
}

const createSyncBranch = async (developSha, syncBranchName) => {
    const CREATE_BRANCH_URL = `repos/${REPO_OWNER}/${REPO}/git/refs`;
    const postData = {
        ref: `refs/heads/${syncBranchName}`,
        sha: developSha
    };
    return client.post(CREATE_BRANCH_URL, postData);
};

const mergeBranches = async (fromBranch, toBranch) => {
    const MERGE_BRANCH_URL = `/repos/${REPO_OWNER}/${REPO}/merges`;
    const postData = {
        head: fromBranch,
        base: toBranch,
        commit_message: `Merge ${fromBranch} into ${toBranch}`
      };
    return client.post(MERGE_BRANCH_URL, postData);
};

const createPullRequest = (fromBranch, toBranch) => {
    const CREATE_PULL_REQUEST_URL = `/repos/${REPO_OWNER}/${REPO}/pulls`;
    const postData = {
        title: `Merge ${fromBranch} into ${toBranch}`,
        body: `Merge ${fromBranch} into ${toBranch}`,
        head: fromBranch,
        base: toBranch
      };
    return client.post(CREATE_PULL_REQUEST_URL, postData);
};

main();
