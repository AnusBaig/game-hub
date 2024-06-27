pipeline {
  environment {
    gitRepoUrl = 'https://github.com/AnusBaig/game-hub.git'
    dockerRegistryUrl = 'https://registry.hub.docker.com'
    githubCredential = 'github-talha'
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
    stage('Checkout Source') {
      steps {
        script {
          echo "Checking out source code from ${gitRepoUrl}..."
          checkout([$class: 'GitSCM', 
                    branches: [[name: '*/dockerize']], 
                    userRemoteConfigs: [[url: gitRepoUrl, 
                                         credentialsId: githubCredential]]])
          echo "Source code checked out successfully."
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

    stage('Push Image to Docker Hub') {
      steps {
        script {
          echo "Pushing Docker image to ${dockerRegistryUrl}..."
          docker.withRegistry(dockerRegistryUrl, dockerHubCredential) {
            dockerImage.tag("latest")
            dockerImage.push()
            echo "Docker image pushed successfully to Docker Hub."
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          echo "Deploying to Kubernetes..."
          kubernetesDeploy(configs: "deployment.yaml", "service.yaml")
          echo "Deployment to Kubernetes successful."
        }
      }
    }
  }

  post {
    always {
      echo "Cleaning up Docker images..."
      dockerImage.remove() // Clean up Docker image after pipeline execution
    }
    success {
      echo "Pipeline executed successfully."
    }
    failure {
      echo "Pipeline execution failed."
    }
  }
}
