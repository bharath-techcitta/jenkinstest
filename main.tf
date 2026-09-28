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

resource "aws_amplify_app" "app" {
  name       = var.app_name
  repository = var.repository_url

  # GitHub Personal Access Token for webhook and repo cloning
  access_token = var.github_token

  # Build specification for Vite + React (npm)
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

  # SPA Rewrite Rule: redirects non-static file routes to index.html with 200
  custom_rule {
    source = "/<*>"
    status = "200"
    target = "/index.html"
  }

  environment_variables = {
    ENV = var.environment
  }

  tags = {
    Project     = var.app_name
    ManagedBy   = "Terraform"
    Environment = var.environment
  }
}

resource "aws_amplify_branch" "branch" {
  app_id      = aws_amplify_app.app.id
  branch_name = var.branch_name

  framework = "React"
  stage     = upper(var.environment)

  # Disabled auto-build so builds are controlled solely by Jenkins
  enable_auto_build = false

  environment_variables = {
    VITE_APP_ENV = var.environment
  }
}

# Incoming Webhook for Jenkins to trigger deployments after verification
resource "aws_amplify_webhook" "jenkins_trigger" {
  app_id      = aws_amplify_app.app.id
  branch_name = aws_amplify_branch.branch.branch_name
  description = "Triggered by Jenkins pipeline upon verified build"
}

