const octokit = require('@octokit/rest')();

const config = require('../config');

async function getPackages() {
  const {data: commits} = await octokit.repos.getCommits({
    owner: config.OWNER,
    repo: config.REPO,
  });

  if (!commits.length) {
    return;
  }

  const commit = commits[0];

  const {data: { tree }} = await octokit.gitdata.getTree({
    owner: config.OWNER,
    repo: config.REPO,
    tree_sha: commit.sha,
    recursive: 1
  });

  return tree.reduce((acc, v) => {
    const { path } = v;

    if (v.type === 'tree') {
      if (!acc[path]) {
        acc[path] = Object.assign({}, v, {
          files: []
        });
      }
    } else {
      const package_name = path.split('/')[0];

      if (acc[package_name]) {
        acc[package_name].files.push(v);
      }
    }

    return acc;
  }, {});
}

module.exports = {
  getPackages,
};