terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region to deploy Amplify in"
  type        = string
  default     = "us-east-1"
}

variable "github_token" {
  description = "GitHub Personal Access Token (classic with repo scope or fine-grained) for AWS Amplify to access repository"
  type        = string
  sensitive   = true
}

resource "aws_amplify_app" "pulse_count" {
  name       = "jenkinstest"
  repository = "https://github.com/bharath-techcitta/jenkinstest"

  # GitHub Personal Access Token for webhook and repository cloning
  access_token = var.github_token

  # Vite + React (npm) build specification
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  # SPA Redirect/Rewrite rule: routes client-side routes to index.html
  custom_rule {
    source = "/<*>"
    status = "200"
    target = "/index.html"
  }

  environment_variables = {
    ENV = "production"
  }

  tags = {
    Project     = "jenkinstest"
    ManagedBy   = "Terraform"
    Environment = "production"
  }
}

# Connects and auto-builds the 'main' branch on push
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.pulse_count.id
  branch_name = "main"

  framework = "React"
  stage     = "PRODUCTION"

  enable_auto_build = true

  environment_variables = {
    VITE_APP_ENV = "production"
  }
}

output "amplify_app_id" {
  description = "The ID of the Amplify App"
  value       = aws_amplify_app.pulse_count.id
}

output "default_domain" {
  description = "Default Amplify domain for the app"
  value       = aws_amplify_app.pulse_count.default_domain
}

output "main_branch_url" {
  description = "Live URL of the main branch deployment"
  value       = "https://main.${aws_amplify_app.pulse_count.default_domain}"
}
