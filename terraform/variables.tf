variable "location" {
  description = "Azure region"
  type        = string
  default     = "Central India"
}

variable "resource_group_name" {
  description = "Azure Resource Group name"
  type        = string
  default     = "terraformdeploy"
}

variable "sql_admin_username" {
  description = "Azure SQL administrator username"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "Azure SQL administrator password"
  type        = string
  sensitive   = true
}