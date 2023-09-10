terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
  access_key = !!!!!!
  secret_key = !!!!!!
}

#local variables
locals {
  func_save  = "save-note-30143419"
  func_get = "get-notes-30143419"
  func_del = "delete-note-30143419"
  handler_name = "main.handler"
  artifact_name_save = "artifact_save.zip"
  artifact_name_get= "artifact_getzip"
  artifact_name_delete= "artifact_delete.zip"
}

#create dynamodb table
resource "aws_dynamodb_table" "lotion-30143419" {
  name           = "lotion-30143419"
  hash_key       = "email"
  range_key      = "id"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "email"
    type = "S"
  }
  attribute {
    name = "id"
    type = "S"
  }
}

# create a role for the Lambda function to assume
resource "aws_iam_role" "lambda" {
  name               = "iam-for-lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# create a policy for publishing logs to CloudWatch
resource "aws_iam_policy" "logs" {
  name        = "lambda-logging"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource":["arn:aws:dynamodb:::table/","arn:aws:logs:::","arn:aws:dynamodb:ca-central-1:!!!!!!!!:table/lotion-30143419"],
      "Effect": "Allow"
    }
  ]
}
EOF
}

# attach the above policy to the function role
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

# create Lambda functions
resource "aws_lambda_function" "lambda" {
  role             = aws_iam_role.lambda.arn
  function_name    = local.func_save
  handler          = local.handler_name
  filename         = local.artifact_name_save
  source_code_hash = data.archive_file.data_save_zip.output_base64sha256
  runtime = "python3.9"
}
resource "aws_lambda_function" "lambda-delete" {
  role             = aws_iam_role.lambda.arn
  function_name    = local.func_del
  handler          = local.handler_name
  filename         = local.artifact_name_delete
  source_code_hash = data.archive_file.data_delete_zip.output_base64sha256
  runtime = "python3.9"
}
resource "aws_lambda_function" "lambda-get" {
  role             = aws_iam_role.lambda.arn
  function_name    = local.func_get
  handler          = local.handler_name
  filename         = local.artifact_name_get
  source_code_hash = data.archive_file.data_get_zip.output_base64sha256
  runtime = "python3.9"
}

# create a Function URL for Lambda 
resource "aws_lambda_function_url" "url" {
  function_name      = aws_lambda_function.lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}
resource "aws_lambda_function_url" "url-get" {
  function_name      = aws_lambda_function.lambda-get.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}
resource "aws_lambda_function_url" "url-delete" {
  function_name      = aws_lambda_function.lambda-delete.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create archive files from main.py
data "archive_file" "data_delete_zip" {
  type = "zip"
  source_file = "../functions/delete-note/main.py"
  output_path = local.artifact_name_delete

}
data "archive_file" "data_save_zip" {
  type = "zip"
  source_file = "../functions/save-note/main.py"
  output_path = local.artifact_name_save
}
data "archive_file" "data_get_zip" {
  type = "zip"
  source_file = "../functions/get-notes/main.py"
  output_path = local.artifact_name_get

}

output "lambda_url_delete" {
  value = aws_lambda_function_url.url-delete.function_url
}
output "lambda_url_save" {
  value = aws_lambda_function_url.url.function_url
}
output "lambda_url_get" {
  value = aws_lambda_function_url.url-get.function_url
}