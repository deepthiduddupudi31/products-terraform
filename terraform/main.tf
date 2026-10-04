resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_mssql_server" "main" {
  name                         = "terraformserver"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
}

resource "azurerm_mssql_database" "main" {
  name      = "terraformdb"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "Basic"
}

resource "azurerm_mssql_firewall_rule" "local" {
  name             = "AllowMyIP"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "27.59.62.165"
  end_ip_address   = "27.59.62.165"
}

resource "azurerm_storage_account" "main" {
  name                     = "deploybolbstorage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version = "TLS1_2"
}

resource "azurerm_storage_container" "products" {
  name                  = "products"
  storage_account_id    = azurerm_storage_account.main.id
  container_access_type = "blob"
}

resource "azurerm_service_plan" "main" {
  name                = "terraformplan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "backend" {
  name                = "terraformbackend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    DB_SERVER                  = "terraformserver.database.windows.net"
    DB_NAME                    = "terraformdb"
    DB_USER                    = var.sql_admin_username
    DB_PASSWORD                = var.sql_admin_password
    AZURE_STORAGE_ACCOUNT_NAME = azurerm_storage_account.main.name
  }
}
resource "azurerm_role_assignment" "backend_storage" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}




resource "azurerm_container_registry" "main" {
  name                = "registryterraformcontainer"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}
