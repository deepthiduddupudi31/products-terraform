resource "azurerm_static_web_app" "frontend" {
  name                = "producthub-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = "East Asia"
  sku_tier            = "Free"
  sku_size            = "Free"
}