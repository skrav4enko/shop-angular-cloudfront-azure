resource "azurerm_cosmosdb_account" "products_db_account" {
  name                = "cos-products-ne-001"
  location            = var.location
  resource_group_name = azurerm_resource_group.product-services-rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

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

  enable_automatic_failover       = false
  enable_multiple_write_locations = false
}

resource "azurerm_cosmosdb_sql_database" "products_db" {
  name                = "db-products-ne-001"
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
