# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.92.0"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}


resource "azurerm_resource_group" "front_end_rg" {
  name     = "rg-frontend-sand-ne-001"
  location = var.location
}

resource "azurerm_storage_account" "front_end_storage_account" {
  name     = "stgfrontendsandne001"
  location = var.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.front_end_rg.name

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}
