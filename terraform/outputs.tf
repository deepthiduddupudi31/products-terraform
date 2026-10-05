output "frontend_url" {
  value = azurerm_static_web_app.frontend.default_host_name
}