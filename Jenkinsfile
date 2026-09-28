pipeline {
    agent any

    // Optional: If you use the Jenkins NodeJS plugin, uncomment the tools block below:
    // tools {
    //     nodejs 'NodeJS' // Name must match your Global Tool Configuration in Jenkins
    // }

    environment {
        // Automatically injects credentials from Jenkins (Secret Text)
        VERCEL_TOKEN      = credentials('vercel-token')
        VERCEL_ORG_ID     = credentials('vercel-org-id')
        VERCEL_PROJECT_ID = credentials('vercel-project-id')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies with npm ci...'
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Build & Deploy to Vercel via CLI') {
            steps {
                echo 'Building and deploying to Vercel Production via Vercel CLI...'
                script {
                    if (isUnix()) {
                        sh 'npx --yes vercel --prod --token="${VERCEL_TOKEN}" --yes'
                    } else {
                        bat 'npx --yes vercel --prod --token="%VERCEL_TOKEN%" --yes'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' SUCCESS: Deployment to Vercel via CLI succeeded!'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' FAILURE: Pipeline failed. Deployment aborted.'
            echo '=================================================='
        }
    }
}
