pipeline {
    agent any

    // Optional: If you use the Jenkins NodeJS plugin, uncomment the tools block below:
    // tools {
    //     nodejs 'NodeJS' // Name must match your Global Tool Configuration in Jenkins
    // }

    environment {
        // Securely retrieve the Amplify Webhook URL from Jenkins Credentials (Secret Text)
        // ID: 'amplify-webhook-url'
        AMPLIFY_WEBHOOK = credentials('amplify-webhook-url')
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies with clean install...'
                // sh for Linux/macOS agents, bat for Windows agents
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Verify & Build') {
            steps {
                echo 'Building and validating production bundle with Vite...'
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Deploy to AWS Amplify') {
            steps {
                echo 'Build verified successfully! Triggering AWS Amplify deployment via incoming webhook...'
                script {
                    if (isUnix()) {
                        sh '''
                            curl -s -X POST -d "{}" "${AMPLIFY_WEBHOOK}" -H "Content-Type: application/json"
                        '''
                    } else {
                        bat '''
                            curl.exe -s -X POST -d "{}" "%AMPLIFY_WEBHOOK%" -H "Content-Type: application/json"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' SUCCESS: Pipeline passed all checks!'
            echo ' AWS Amplify has been notified and is now deploying.'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' FAILURE: Pipeline checks failed.'
            echo ' Deployment was blocked to keep live site safe.'
            echo '=================================================='
        }
    }
}
