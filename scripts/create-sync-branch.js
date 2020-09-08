const axios = require('axios').default;

const args = process.argv.slice(2);
const ACCESS_TOKEN = args[0];
const SYNC_NUMBER = args[1];
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
        const devBranchResponse = await getBranchSha('development');
        const developSha = devBranchResponse.data.commit.sha;

        const syncBranchResponse = await createSyncBranch(developSha);
        const syncSha = syncBranchResponse.data.object.sha;

        const pullRequestResponse = await createPullRequest('master', `sync-${SYNC_NUMBER}`);


    } catch (error) {
        console.log(error);
    }
};

const getBranchSha = async (branch) => {
    const GET_BRANCHES_URL = `repos/${REPO_OWNER}/${REPO}/branches/${branch}`;
    return client.get(GET_BRANCHES_URL);
}

const createSyncBranch = async (developSha) => {
    const CREATE_BRANCH_URL = `repos/${REPO_OWNER}/${REPO}/git/refs`;
    const postData = {
        ref: `refs/heads/sync-${SYNC_NUMBER}`,
        sha: developSha
    };
    return client.post(CREATE_BRANCH_URL, postData);
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
