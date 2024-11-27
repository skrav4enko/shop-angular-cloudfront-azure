variable "location" {
  description = "The Azure region to deploy resources"
  default     = "northeurope"
}

variable "sb_topic_or_queue_name" {
  default = "products-import-topic"
}

variable "unique_resource_id_prefix" {
  default = "uniqueprefix001"
}

variable "chatbot_container_name" {
  default = "chatbot_app"
}

variable "chatbot_container_tag_acr" {
  default = "v1"
}
