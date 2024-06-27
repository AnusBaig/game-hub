pipeline {

  environment {
    dockerImageName = "talhabaig/game-hub"
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
          try {
                        echo "Building Docker image: ${env.dockerImageName}"
                        dockerImage = docker.build(env.dockerImageName)
                        echo "Docker image built successfully: ${dockerImage.id}"
                    } catch (Exception e) {
                        currentBuild.result = 'FAILURE'
                        error "Failed to build Docker image: ${e.message}"
                    }
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

    stage('Deploying game-hub container to Kubernetes') {
      steps {
        script {
          kubernetesDeploy(configs: "deployment.yaml", "service.yaml")
        }
      }
    }

  }

}