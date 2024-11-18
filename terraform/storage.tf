resource "azurerm_resource_group" "import-service-rg" {
  name     = "rg-import-service-ne-001"
  location = var.location
}

resource "azurerm_storage_account" "import_service_storage_account" {
  name     = "stgimportne002"
  location = var.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  access_tier = "Cool"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT", "OPTIONS"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  resource_group_name = azurerm_resource_group.import-service-rg.name
}

resource "azurerm_storage_container" "uploaded" {
  name                  = "uploaded"
  storage_account_name  = azurerm_storage_account.import_service_storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "parsed" {
  name                  = "parsed"
  storage_account_name  = azurerm_storage_account.import_service_storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_share" "import_service_storage_share" {
  name  = "fa-import-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.import_service_storage_account.name
}

resource "azurerm_service_plan" "import_service_service_plan" {
  name     = "asp-import-service-ne-001"
  location = var.location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import-service-rg.name
}

resource "azurerm_application_insights" "import_service_application_insights" {
  name             = "appins-fa-import-service-ne-001"
  location         = var.location
  application_type = "web"

  resource_group_name = azurerm_resource_group.import-service-rg.name
}

resource "azurerm_windows_function_app" "import_service" {
  name     = "fa-import-service-ne-001"
  location = var.location

  service_plan_id     = azurerm_service_plan.import_service_service_plan.id
  resource_group_name = azurerm_resource_group.import-service-rg.name

  storage_account_name       = azurerm_storage_account.import_service_storage_account.name
  storage_account_access_key = azurerm_storage_account.import_service_storage_account.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on                              = false
    application_insights_key               = azurerm_application_insights.import_service_application_insights.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_application_insights.connection_string

    # For production systems set this to false, but consumption plan supports only 32bit workers
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~18"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_storage_account.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_storage_share.name
    DOTNET_USE_POLLING_FILE_WATCHER          = 1
    WEBSITE_RUN_FROM_PACKAGE                 = 1
    FUNCTIONS_WORKER_RUNTIME                 = "node"
    AZURE_STORAGE_ACCOUNT_NAME               = azurerm_storage_account.import_service_storage_account.name
    AZURE_STORAGE_KEY                        = azurerm_storage_account.import_service_storage_account.primary_access_key
    SB_CONNECTION_STRING                     = azurerm_servicebus_namespace.servicebus_namespace.default_primary_connection_string
    SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE_NAME   = var.sb_topic_or_queue_name
  }

  lifecycle {
    ignore_changes = [
      # app_settings,                     // TODO: check how it works with changes of AZURE_STORAGE_* values
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"],
    ]
  }
}
