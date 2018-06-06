// Copyright 2018 Hayk Pilosyan <hayk.pilos@gmail.com>
// This file is part of Interlibr, a functional component of an
// Internet of Rules (IoR).
// ACKNOWLEDGEMENTS
// Funds: Xalgorithms Foundation
// Collaborators: Don Kelly, Joseph Potvin and Bill Olders.
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License. You may
// obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

const octokit = require('@octokit/rest')();
const axios = require('axios');

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

async function getContents(path) {
  const {data} = await octokit.repos.getContent({
    owner: config.OWNER,
    repo: config.REPO,
    path
  });

  const res = await axios.get(data.download_url);

  return Object.assign({file_content: res.data}, data);
}

async function storeContents(payload) {
  const {path, file_content: content, sha} = payload;
  const message = "New change";
  const {data} = await octokit.repos.updateFile({
    owner: config.OWNER,
    repo: config.REPO,
    path,
    message,
    content,
    sha
  });

  return data;
}

module.exports = {
  getPackages,
  getContents,
  storeContents,
};