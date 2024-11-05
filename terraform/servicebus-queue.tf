resource "azurerm_resource_group" "servicebus_rg" {
  name     = "rg-servicebus-ne-001"
  location = var.location
}

# For queue, we need to create a namespace first with the basic sku

# resource "azurerm_servicebus_namespace" "servicebus_namespace" {
#   name                = "sb-products-ne-001"
#   resource_group_name = azurerm_resource_group.servicebus_rg.name
#   location            = azurerm_resource_group.servicebus_rg.location

#   sku      = "Basic"
#   capacity = 0

#   public_network_access_enabled = true
#   minimum_tls_version           = "1.2"
# }

resource "azurerm_servicebus_queue" "servicebus_queue" {
  name         = "products-import-queue"
  namespace_id = azurerm_servicebus_namespace.servicebus_namespace.id

  status                                  = "Active"
  lock_duration                           = "PT1M" /* ISO 8601 timespan duration */
  requires_duplicate_detection            = false
  duplicate_detection_history_time_window = "PT10M" /* ISO 8601 timespan duration */
  requires_session                        = false
  dead_lettering_on_message_expiration    = false
}
