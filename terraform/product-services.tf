resource "azurerm_resource_group" "product-services-rg" {
  name     = "rg-product-services-ne-001"
  location = "northeurope"
}

resource "azurerm_storage_account" "product_services_storage_account" {
  name     = "stgproductsne002"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_storage_share" "product_services_storage_share" {
  name  = "fa-product-services-share"
  quota = 2

  storage_account_name = azurerm_storage_account.product_services_storage_account.name
}

resource "azurerm_service_plan" "product_services_service_plan" {
  name     = "asp-product-services-ne-001"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_application_insights" "product_services_application_insights" {
  name             = "appins-fa-product-services-ne-001"
  location         = "northeurope"
  application_type = "web"

  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_windows_function_app" "product_services" {
  name     = "fa-product-services-ne-001"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.product_services_service_plan.id
  resource_group_name = azurerm_resource_group.product-services-rg.name

  storage_account_name       = azurerm_storage_account.product_services_storage_account.name
  storage_account_access_key = azurerm_storage_account.product_services_storage_account.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on                              = false
    application_insights_key               = azurerm_application_insights.product_services_application_insights.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.product_services_application_insights.connection_string

    # For production systems set this to false, but consumption plan supports only 32bit workers
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.product_services_storage_account.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.product_services_storage_share.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"],
    ]
  }
}
