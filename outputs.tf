output "amplify_app_id" {
  description = "The ID of the Amplify App"
  value       = aws_amplify_app.app.id
}

output "amplify_app_arn" {
  description = "The ARN of the Amplify App"
  value       = aws_amplify_app.app.arn
}

output "default_domain" {
  description = "Default Amplify domain for the application"
  value       = aws_amplify_app.app.default_domain
}

output "deployed_branch_url" {
  description = "Live URL of the deployed branch"
  value       = "https://${var.branch_name}.${aws_amplify_app.app.default_domain}"
}

output "amplify_webhook_url" {
  description = "Amplify incoming webhook URL to configure in Jenkins credentials ('amplify-webhook-url')"
  value       = aws_amplify_webhook.jenkins_trigger.url
  sensitive   = true
}

