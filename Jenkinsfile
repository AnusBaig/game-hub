pipeline {

  environment {
    dockerimagename = "talhabaig/game-hub"
    dockerImage = ""
  }

  agent {
    node label: "win-agent"
  }

  stages {

    stage('Checkout Source') {
      environment {
               registryCredential = 'github-talha'
           }
      steps {
        script {
                    checkout([$class: 'GitSCM', 
                        branches: [[name: '*/dockerize']], 
                        doGenerateSubmoduleConfigurations: false, 
                        extensions: [], 
                        userRemoteConfigs: [[url: 'https://github.com/AnusBaig/game-hub.git', 
                                            credentialsId: registryCredential]]])
                }
      }
    }

    stage('Build image') {
      steps{
        script {
          dockerImage = docker.build dockerimagename
        }
      }
    }

    stage('Pushing Image') {
      environment {
               registryCredential = 'dockerhub-talha'
           }
      steps{
        script {
          docker.withRegistry( 'https://registry.hub.docker.com', registryCredential ) {
            dockerImage.push("latest")
          }
        }
      }
    }

    stage('Deploying React.js container to Kubernetes') {
      steps {
        script {
          kubernetesDeploy(configs: "deployment.yaml", "service.yaml")
        }
      }
    }

  }

}