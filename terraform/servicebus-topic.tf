# Duplicated with queue, but with topic and subscription

# resource "azurerm_resource_group" "servicebus_rg" {
#   name     = "rg-servicebus-ne-001"
#   location = var.location
# }

resource "azurerm_servicebus_namespace" "servicebus_namespace" {
  name                = "sb-products-import"
  location            = azurerm_resource_group.servicebus_rg.location
  resource_group_name = azurerm_resource_group.servicebus_rg.name

  sku      = "Standard" // only standard sku supports topics
  capacity = 0

  public_network_access_enabled = true /* can be changed to false for premium */
  minimum_tls_version           = "1.2"
}

resource "azurerm_servicebus_topic" "servicebus_topic" {
  name         = "products-import-topic"
  namespace_id = azurerm_servicebus_namespace.servicebus_namespace.id
  status       = "Active"
}

resource "azurerm_servicebus_subscription" "product_sub" {
  name               = "sb_product_subscription"
  topic_id           = azurerm_servicebus_topic.servicebus_topic.id
  max_delivery_count = 1
}

resource "azurerm_servicebus_subscription_rule" "type_product" {
  name            = "tfex_servicebus_rule"
  subscription_id = azurerm_servicebus_subscription.product_sub.id
  filter_type     = "SqlFilter"

  # sql_filter = "type = 'product'"
  sql_filter = "index % 2 = 0" # Simulate Even numbers filter
}

resource "azurerm_servicebus_subscription" "stock_sub" {
  name               = "sb_stock_subscription"
  topic_id           = azurerm_servicebus_topic.servicebus_topic.id
  max_delivery_count = 1
}

resource "azurerm_servicebus_subscription_rule" "type_stock" {
  name            = "tfex_servicebus_rule"
  subscription_id = azurerm_servicebus_subscription.stock_sub.id
  filter_type     = "SqlFilter"

  # sql_filter = "type = 'stock'"
  sql_filter = "index % 2 != 0" # Simulate Odd numbers filter
}
