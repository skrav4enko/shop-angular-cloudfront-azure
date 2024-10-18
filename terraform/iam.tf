resource "azurerm_role_definition" "custom_role" {
  name        = "custom-db-role"
  description = "Custom role to manage Cosmos DB"

  scope = azurerm_cosmosdb_account.products_db_account.id

  assignable_scopes = [azurerm_cosmosdb_account.products_db_account.id]

  permissions {
    actions     = ["Microsoft.DocumentDB/databaseAccounts/sqlDatabases/*"]
    not_actions = []
  }
}

resource "azurerm_role_assignment" "cosmosdb_access" {
  scope                = azurerm_cosmosdb_account.products_db_account.id
  role_definition_name = azurerm_role_definition.custom_role.name
  principal_id         = azurerm_windows_function_app.product_services.identity[0].principal_id

}
