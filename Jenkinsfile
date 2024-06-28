pipeline {
  environment {
    gitRepoUrl = 'https://github.com/AnusBaig/game-hub.git'
    gitBranchName = '*/dockerize'
    gitHubCredential = 'github-talha'

    dockerRegistryUrl = 'https://registry.hub.docker.com'
    dockerHubCredential = 'dockerhub-talha'
    dockerImageName = "talhabaig/game-hub"
    dockerImage = ""
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
          sh 'npm install && npm run build'
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

    stage('Deploy to Kubernetes') {
      steps {
        script {
          try {
            echo "Deploying to Kubernetes..."
            sh 'kubectl apply -f deployment.yaml'
            sh 'kubectl apply -f service.yaml'
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
        echo "Cleaning up Docker images..."
        dockerImage.remove()
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
