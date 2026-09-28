variable "aws_region" {
  description = "AWS region for Amplify deployment"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name of the Amplify application"
  type        = string
  default     = "jenkinstest"
}

variable "repository_url" {
  description = "URL of the GitHub repository to connect to Amplify"
  type        = string
  default     = "https://github.com/bharath-techcitta/jenkinstest"
}

variable "branch_name" {
  description = "Default Git branch to build and deploy"
  type        = string
  default     = "main"
}

variable "environment" {
  description = "Deployment environment name (e.g. production, staging, test)"
  type        = string
  default     = "production"
}

variable "github_token" {
  description = "GitHub Personal Access Token (PAT) with repo scope for AWS Amplify"
  type        = string
  sensitive   = true
}
