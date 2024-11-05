variable "location" {
  description = "The Azure region to deploy resources"
  default     = "northeurope"
}

variable "sb_topic_queue_name" {
  default = "products-import-queue"
}
