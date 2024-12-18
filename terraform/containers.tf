resource "azurerm_resource_group" "chatbot_rg" {
  name     = "rg-chatbot-sand-ne-001"
  location = var.location
}

resource "azurerm_container_registry" "chatbot_cr" {
  name                = "${var.unique_resource_id_prefix}chatbotcr"
  resource_group_name = azurerm_resource_group.chatbot_rg.name
  location            = azurerm_resource_group.chatbot_rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_log_analytics_workspace" "chatbot_law" {
  name                = "${var.unique_resource_id_prefix}-chatbot-law"
  resource_group_name = azurerm_resource_group.chatbot_rg.name
  location            = azurerm_resource_group.chatbot_rg.location
}

resource "azurerm_container_app_environment" "chatbot_cae" {
  name                       = "${var.unique_resource_id_prefix}-chatbot-cae"
  location                   = azurerm_resource_group.chatbot_rg.location
  resource_group_name        = azurerm_resource_group.chatbot_rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.chatbot_law.id
}

# resource "azurerm_container_app" "hello-world_ca_docker_acr" {
#   name                         = "${var.unique_resource_id_prefix}-hello-world-ca-acr"
#   container_app_environment_id = azurerm_container_app_environment.chatbot_cae.id
#   resource_group_name          = azurerm_resource_group.chatbot_rg.name
#   revision_mode                = "Single"

#   registry {
#     server               = azurerm_container_registry.chatbot_acr.login_server
#     username             = azurerm_container_registry.chatbot_acr.admin_username
#     password_secret_name = "acr-password"
#   }

#   ingress {
#     allow_insecure_connections = false
#     external_enabled           = true
#     target_port                = 3000

#     traffic_weight {
#       percentage      = 100
#       latest_revision = true
#     }

#   }

#   template {
#     container {
#       name   = "hello-world-container-acr"
#       image  = "${azurerm_container_registry.chatbot_acr.login_server}/${var.hello_world_container_name}:${var.chatbot_container_tag_acr}"
#       cpu    = 0.25
#       memory = "0.5Gi"

#       env {
#         name  = "CONTAINER_REGISTRY_NAME"
#         value = "Azure Container Registry"
#       }
#     }
#   }

#   secret {
#     name  = "acr-password"
#     value = azurerm_container_registry.chatbot_acr.admin_password
#   }
# }
