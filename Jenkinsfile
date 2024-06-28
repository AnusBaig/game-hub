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
    stage('Build Project') {
      steps {
        script {
          echo "Checking out source code from ${gitRepoUrl}..."
          checkout([$class: 'GitSCM', 
                    branches: [[name: '*/dockerize']], 
                    userRemoteConfigs: [[url: gitRepoUrl, 
                                         credentialsId: githubCredential]]])
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
            } catch (Exception e) {
              currentBuild.result = 'FAILURE'
              error "Failed to push Image to Docker Hub: ${e.message}"
            }
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          try {
            echo "Deploying to Kubernetes..."
            // kubernetesDeploy(
            //   configs: 'deployment.yaml,service.yaml', 
            //   kubeConfig: [path: '/path/to/kubeconfig']
            // )
            bat 'kubectl apply -f deployment.yaml'
            bat 'kubectl apply -f service.yaml'
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
