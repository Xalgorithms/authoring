# Summary
Back-end for the Xalgo Authoring application.

# Deployment

* Navigate to https://console.cloud.google.com/home/dashboard
* Select Xalgo Authoring UI project
* Open the shell from top right

~~~~
git clone -b env https://github.com/Xalgorithms/service-author-github.git
cd service-author-github
touch app.yaml
gcloud app deploy
~~~~

* Populate app.yaml

~~~~
runtime: nodejs
env: flex

# This sample incurs costs to run on the App Engine flexible environment.
# The settings below are to reduce costs during testing and are not appropriate
# for production use. For more information, see:
# https://cloud.google.com/appengine/docs/flexible/nodejs/configuring-your-app-with-app-yaml
manual_scaling:
  instances: 1
resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10
env_variables:
  APP_ID: 13982
  OWNER: "hpilosyan"
  REPO: "libgit2-test"
  GITHUB_PRIVATE_KEY: ""
  FIREBASE_PRIVATE_KEY: ''
~~~~
