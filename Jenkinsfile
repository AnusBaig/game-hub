pipeline {
  environment {
    gitRepoUrl = 'https://github.com/AnusBaig/game-hub.git'
    gitBranchName = '*/dockerize'
    gitHubCredential = 'github-talha'

    dockerRegistryUrl = 'https://registry.hub.docker.com'
    dockerHubCredential = 'dockerhub-talha'
    dockerImageName = "talhabaig/game-hub"
    dockerImage = ""

    kubeConfigPath = "${env.USERPROFILE}\\.kube\\config"
  }

  agent {
    node {
      label "win-agent"
    }
  }

  stages {
    stage('Build Project') {
      steps {
        script {
          echo "Checking out source code from ${gitRepoUrl}..."
          checkout([$class: 'GitSCM', 
                    branches: [[name: gitBranchName]], 
                    userRemoteConfigs: [[url: gitRepoUrl, 
                                         credentialsId: gitHubCredential]]])
          echo "Source code checked out successfully."
          echo "Installing dependencies and building the project..."
          bat 'npm install && npm run build'
          echo "Dependencies installed and project built successfully."
        }
      }
    }

    stage('Build Image') {
      steps {
        script {
          try {
            echo "Building Docker image: ${dockerImageName}"
            dockerImage = docker.build(dockerImageName)
            echo "Docker image built successfully: ${dockerImage.id}"
          } catch (Exception e) {
            currentBuild.result = 'FAILURE'
            error "Failed to build Docker image: ${e.message}"
          }
        }
      }
    }

    stage('Push Image') {
      steps {
        script {
          try {
            echo "Pushing Docker image to ${dockerRegistryUrl}..."
            docker.withRegistry(dockerRegistryUrl, dockerHubCredential) {
              dockerImage.tag("latest")
              dockerImage.push()
              echo "Docker image pushed successfully to Docker Hub."
            } 
          } catch (Exception e) {
            currentBuild.result = 'FAILURE'
            error "Failed to push Image to Docker Hub: ${e.message}"
          }
        }
      }
    }

    stage('Deploy to K8s') {
      steps {
        script {
          try {
            echo "Deploying to Kubernetes..."
            bat "kubectl apply --kubeconfig=\"${kubeConfigPath}\" -f deployment.yml"
            bat "kubectl apply --kubeconfig=\"${kubeConfigPath}\" -f service.yml"
            echo "Deployment to Kubernetes successful."
          } catch (Exception e) {
            currentBuild.result = 'FAILURE'
            error "Failed to deploy to Kubernetes: ${e.message}"
          }
        }
      }
    }
  }

  post {
    always {
      script {
        try {
          echo "Cleaning up Docker images..."
          docker.withRegistry(dockerRegistryUrl, dockerhubCredential) {
            docker.image(dockerImageName).inside {
              bat 'docker rmi ${dockerImage.id}'
            }
          }
          echo "Docker images cleaned up successfully."
        } catch (Exception e) {
          echo "Failed to clean up Docker images: ${e.message}"
        }
      }
    }
    success {
      echo "Pipeline executed successfully."
    }
    failure {
      echo "Pipeline execution failed."
    }
  }
}
