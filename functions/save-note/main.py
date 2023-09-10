# add your save-note function here
# add your save-note function here
import boto3
import json


dynamodb_resource = boto3.resource("dynamodb") # create a resource object for DynamoDB
table = dynamodb_resource.Table("lotion-30143419") # get a Table object for the "lotion-30143419" table


def handler(event, context):
   # load the request body (which is expected to be JSON) into a Python dictionary
   body = json.loads(event["body"])
  
   try:
       # save the note to the DynamoDB table
       table.put_item(Item=body)
      
       # return a success response
       return {
           "isBased64Encoded":"false", # indicate that the response body is not Base64-encoded
           "statusCode":200, # set the HTTP status code to 200 (OK)
           "body": json.dumps(
               {"message":"success"} # return a JSON object with a success message
           )
       }
   except Exception as e:
       # if an error occurs while saving the note, return an error response
       return {
           "statusCode":500, # set the HTTP status code to 500 (Internal Server Error)
           "body": json.dumps(
               { "message":str(e) } # return a JSON object with an error message containing the exception
           )
       }


