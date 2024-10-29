resource "azurerm_cosmosdb_account" "products_db_account" {
  name                = "cos-products-service-ne-001"
  location            = var.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  resource_group_name = azurerm_resource_group.product-services-rg.name

  consistency_policy {
    consistency_level = "Eventual"
  }

  capabilities {
    name = "EnableServerless"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_cosmosdb_sql_database" "products_db" {
  name                = "products-db"
  account_name        = azurerm_cosmosdb_account.products_db_account.name
  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_cosmosdb_sql_container" "products_container" {
  name                = "products"
  account_name        = azurerm_cosmosdb_account.products_db_account.name
  database_name       = azurerm_cosmosdb_sql_database.products_db.name
  resource_group_name = azurerm_resource_group.product-services-rg.name

  partition_key_path = "/id"

  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "stocks_container" {
  name                = "stocks"
  account_name        = azurerm_cosmosdb_account.products_db_account.name
  database_name       = azurerm_cosmosdb_sql_database.products_db.name
  resource_group_name = azurerm_resource_group.product-services-rg.name

  partition_key_path = "/product_id"

  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

output "db_uri" {
  value = azurerm_cosmosdb_account.products_db_account.endpoint
}

output "db_name" {
  value = azurerm_cosmosdb_sql_database.products_db.name
}
