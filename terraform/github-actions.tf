resource "azuread_application_federated_identity_credential" "github_actions" {
  application_id = azuread_application.github_actions.id

  display_name = "github-actions"
  description  = "GitHub Actions deployment identity"

  audiences = [
    "api://AzureADTokenExchange"
  ]

  issuer  = "https://token.actions.githubusercontent.com"
  subject = "repo:deepthiduddupudi31/products-terraform:ref:refs/heads/main"
}

resource "azurerm_role_assignment" "github_acr_push" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPush"
  principal_id         = azuread_service_principal.github_actions.object_id
}

resource "azurerm_role_assignment" "github_resource_group_contributor" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}