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
