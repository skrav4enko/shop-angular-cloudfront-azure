data "azurerm_client_config" "current" {}

resource "azurerm_cosmosdb_sql_role_definition" "products_db_role" {
  name = "custom-sql-role"

  type = "CustomRole"

  account_name        = azurerm_cosmosdb_account.products_db_account.name
  resource_group_name = azurerm_resource_group.product-services-rg.name

  assignable_scopes = [azurerm_cosmosdb_account.products_db_account.id]

  permissions {
    data_actions = [
      "Microsoft.DocumentDB/databaseAccounts/readMetadata",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*",
      "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*"
    ]
  }
}

resource "azurerm_cosmosdb_sql_role_assignment" "products_db_role_assigment" {
  resource_group_name = azurerm_resource_group.product-services-rg.name
  account_name        = azurerm_cosmosdb_account.products_db_account.name
  role_definition_id  = azurerm_cosmosdb_sql_role_definition.products_db_role.id
  principal_id        = data.azurerm_client_config.current.object_id
  scope               = azurerm_cosmosdb_account.products_db_account.id
}

resource "azurerm_cosmosdb_sql_role_assignment" "products_db_role_assigment_function_app" {
  resource_group_name = azurerm_resource_group.product-services-rg.name
  account_name        = azurerm_cosmosdb_account.products_db_account.name
  role_definition_id  = azurerm_cosmosdb_sql_role_definition.products_db_role.id
  principal_id        = azurerm_windows_function_app.product_services.identity.0.principal_id
  scope               = azurerm_cosmosdb_account.products_db_account.id
}
