resource "azurerm_resource_group" "product-services-rg" {
  name     = "rg-product-services-ne-001"
  location = var.location
}

resource "azurerm_storage_account" "product_services_storage_account" {
  name     = "stgproductsne002"
  location = var.location

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
  location = var.location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_application_insights" "product_services_application_insights" {
  name             = "appins-fa-product-services-ne-001"
  location         = var.location
  application_type = "web"

  resource_group_name = azurerm_resource_group.product-services-rg.name
}

resource "azurerm_windows_function_app" "product_services" {
  name     = "fa-product-services-ne-001"
  location = var.location

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
      node_version = "~18"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.product_services_storage_account.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.product_services_storage_share.name
    DOTNET_USE_POLLING_FILE_WATCHER          = 1
    WEBSITE_RUN_FROM_PACKAGE                 = 1
    FUNCTIONS_WORKER_RUNTIME                 = "node"
    DB_URI                                   = azurerm_cosmosdb_account.products_db_account.endpoint
    DB_NAME                                  = azurerm_cosmosdb_sql_database.products_db.name
    SB_CONNECTION_STRING                     = azurerm_servicebus_namespace.servicebus_namespace.default_primary_connection_string
    SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE_NAME   = var.sb_topic_or_queue_name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      # app_settings,
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"],
    ]
  }
}

# Create an App Configuration
resource "azurerm_app_configuration" "product_services_config" {
  name     = "appconfig-product-services-ne-001"
  location = var.location

  resource_group_name = azurerm_resource_group.product-services-rg.name

  sku = "free"
}

# Create an API Management
resource "azurerm_api_management" "product_services_apim" {
  name            = "apim-product-services-ne-001"
  location        = var.location
  publisher_email = "serhii_kravchenko1@epam.com"
  publisher_name  = "Serhii Kravchenko"

  resource_group_name = azurerm_resource_group.product-services-rg.name
  sku_name            = "Consumption_0"
}

# Create an API Management API
resource "azurerm_api_management_api" "product_services_api" {
  name                = "products-service-api"
  api_management_name = azurerm_api_management.product_services_apim.name
  revision            = "1"

  resource_group_name = azurerm_resource_group.product-services-rg.name

  display_name = "Products Service API"

  protocols = ["https"]
}


data "azurerm_function_app_host_keys" "products_keys" {
  name                = azurerm_windows_function_app.product_services.name
  resource_group_name = azurerm_resource_group.product-services-rg.name
}

# Create an API Management Backend
resource "azurerm_api_management_backend" "products_fa" {
  name                = "products-service-backend"
  resource_group_name = azurerm_resource_group.product-services-rg.name
  api_management_name = azurerm_api_management.product_services_apim.name
  protocol            = "http"
  url                 = "https://${azurerm_windows_function_app.product_services.name}.azurewebsites.net/api"
  description         = "Products API"

  credentials {
    certificate = []
    query       = {}

    header = {
      "x-functions-key" = data.azurerm_function_app_host_keys.products_keys.default_function_key
    }
  }
}

# Create an API Policy
resource "azurerm_api_management_api_policy" "api_policy" {
  api_management_name = azurerm_api_management.product_services_apim.name
  api_name            = azurerm_api_management_api.product_services_api.name
  resource_group_name = azurerm_resource_group.product-services-rg.name

  xml_content = <<XML
  <policies>
      <inbound>
          <set-backend-service backend-id="${azurerm_api_management_backend.products_fa.name}"/>
          <base/>
      </inbound>
      <backend>
          <base/>
      </backend>
      <outbound>
          <base/>
      </outbound>
      <on-error>
          <base/>
      </on-error>
  </policies>
  XML
}

resource "azurerm_api_management_api_operation" "get_products" {
  api_management_name = azurerm_api_management.product_services_apim.name
  api_name            = azurerm_api_management_api.product_services_api.name
  display_name        = "Get Products"
  method              = "GET"
  operation_id        = "get-products"
  resource_group_name = azurerm_resource_group.product-services-rg.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation" "get_product_by_id" {
  api_management_name = azurerm_api_management.product_services_apim.name
  api_name            = azurerm_api_management_api.product_services_api.name
  display_name        = "Get Product By Id"
  method              = "GET"
  operation_id        = "get-product-by-id"
  resource_group_name = azurerm_resource_group.product-services-rg.name
  url_template        = "/products/{productId}"

  template_parameter {
    name     = "productId"
    type     = "number"
    required = true
  }
}

resource "azurerm_api_management_api_operation" "create_product" {
  api_management_name = azurerm_api_management.product_services_apim.name
  api_name            = azurerm_api_management_api.product_services_api.name
  display_name        = "Create Product"
  method              = "POST"
  operation_id        = "post-product"
  resource_group_name = azurerm_resource_group.product-services-rg.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation" "get_products_total" {
  api_management_name = azurerm_api_management.product_services_apim.name
  api_name            = azurerm_api_management_api.product_services_api.name
  display_name        = "Get Products Total"
  method              = "GET"
  operation_id        = "get-products-total"
  resource_group_name = azurerm_resource_group.product-services-rg.name
  url_template        = "/products/total"
}
