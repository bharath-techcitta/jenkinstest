pipeline {
    agent any

    // Optional: If you use the Jenkins NodeJS plugin, uncomment the tools block below:
    // tools {
    //     nodejs 'NodeJS' // Name must match your Global Tool Configuration in Jenkins
    // }

    environment {
        // Securely retrieve your Vercel Deploy Hook URL from Jenkins Credentials (Secret Text)
        // Jenkins Credential ID: 'vercel-deploy-hook'
        VERCEL_DEPLOY_HOOK = credentials('vercel-deploy-hook')
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

        stage('Verify & Build') {
            steps {
                echo 'Building and validating Vite production bundle...'
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                echo 'Build verified successfully! Triggering deployment to Vercel...'
                script {
                    // Option 1: Vercel Deploy Hook (Recommended - zero setup, reliable)
                    if (isUnix()) {
                        sh '''
                            response=$(curl -s -o response.txt -w "%{http_code}" -X POST "${VERCEL_DEPLOY_HOOK}")
                            echo "Vercel Deploy Hook HTTP Response: ${response}"
                            cat response.txt
                            if [ "$response" -lt 200 ] || [ "$response" -ge 300 ]; then
                                echo "ERROR: Vercel deploy hook failed with status ${response}"
                                exit 1
                            fi
                        '''
                    } else {
                        bat '''
                            curl.exe -s -o response.txt -w "%%{http_code}" -X POST "%VERCEL_DEPLOY_HOOK%"
                            type response.txt
                        '''
                    }

                    // Option 2 (Alternative): If you prefer Vercel CLI instead of Deploy Hook,
                    // comment out the curl above, add VERCEL_TOKEN credentials, and use:
                    // if (isUnix()) {
                    //     sh 'npx --yes vercel --prod --token="${VERCEL_TOKEN}" --yes'
                    // } else {
                    //     bat 'npx --yes vercel --prod --token="%VERCEL_TOKEN%" --yes'
                    // }
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' SUCCESS: Pipeline completed!'
            echo ' Vercel deployment triggered and is now going live.'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' FAILURE: Build or verification failed.'
            echo ' Vercel deployment was blocked.'
            echo '=================================================='
        }
    }
}
