pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        IMAGE_NAME = 'adkm/preflow-app'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/AKM-2004/PreFlow', branch: 'master'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:latest")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        docker.image("${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        stage('Deploy with Docker Swarm') {
            steps {
                sh '''

                docker stack deploy -c docker-compose.yml mystack
                '''
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed!"
        }
    }
}
