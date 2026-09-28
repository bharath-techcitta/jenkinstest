pipeline {
    agent any

    // Optional: If you use the Jenkins NodeJS plugin, uncomment the tools block below:
    // tools {
    //     nodejs 'NodeJS' // Name must match your Global Tool Configuration in Jenkins
    // }

    environment {
        // Injected automatically from Jenkins Global Credentials (Secret Text)
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
                echo 'Installing project dependencies with npm ci...'
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Pull Vercel Environment') {
            steps {
                echo 'Pulling Vercel production project settings and environment...'
                script {
                    if (isUnix()) {
                        sh 'npx --yes vercel pull --yes --environment=production --token="${VERCEL_TOKEN}"'
                    } else {
                        bat 'npx --yes vercel pull --yes --environment=production --token="%VERCEL_TOKEN%"'
                    }
                }
            }
        }

        stage('Build Vercel Artifacts') {
            steps {
                echo 'Building production bundle using Vercel build...'
                script {
                    if (isUnix()) {
                        sh 'npx --yes vercel build --prod --token="${VERCEL_TOKEN}"'
                    } else {
                        bat 'npx --yes vercel build --prod --token="%VERCEL_TOKEN%"'
                    }
                }
            }
        }

        stage('Deploy to Vercel Production') {
            steps {
                echo 'Deploying prebuilt production bundle to Vercel...'
                script {
                    if (isUnix()) {
                        sh 'npx --yes vercel deploy --prebuilt --prod --token="${VERCEL_TOKEN}"'
                    } else {
                        bat 'npx --yes vercel deploy --prebuilt --prod --token="%VERCEL_TOKEN%"'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' SUCCESS: Project deployed to Vercel Production!'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' FAILURE: Pipeline failed. Check console log above.'
            echo '=================================================='
        }
    }
}
