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

const octokit = require('@octokit/rest')({
  debug: true
});

const auth = require('./auth');
const utils = require('./utils');

const { OWNER, REPO } = process.env;
auth.setAccessToken(octokit);

async function getPackages() {
  const {data: commits} = await octokit.repos.getCommits({
    owner: OWNER,
    repo: REPO,
  });

  if (!commits.length) {
    return;
  }

  const commit = commits[0];

  const {data: { tree }} = await octokit.gitdata.getTree({
    owner: OWNER,
    repo: REPO,
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

async function createPackage(name) {
  const message = "New package";
  // Create empty package file
  const path = `${name}/${name}.package`;
  const content = utils.base64encode('');

  await octokit.repos.createFile({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content,
  });

  const packages = await getPackages();

  return packages;
}

async function createFile(path, content) {
  const message = "New change";
  const {data} = await octokit.repos.createFile({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: utils.base64encode(content),
  });

  return data;
}

async function updateFile(path, content, sha) {
  const message = "New change";
  const {data} = await octokit.repos.updateFile({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: utils.base64encode(content),
    sha
  });

  return data;
}

async function getPackageInfo(path) {
  const {data} = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
  });

  return data;
}

async function createNewFileOrUpdate(packageName, path, content) {
  const packageInfo = await getPackageInfo(packageName);
  const file = packageInfo.find(function (p) {
    return p.path === path;
  });

  if (!file) {
    return await createFile(path, content);
  }

  return await updateFile(path, content, file.sha);
}

module.exports = {
  getPackages,
  createPackage,
  createNewFileOrUpdate,
};
