# add your delete-note function hereimport boto3
import json


dynamodb_resouce = boto3.resource('dynamodb') # create a resource object for DynamoDB
table = dynamodb_resouce.Table('lotion-30143419') # get a Table object for the "lotion-30143419" table


def handler(event, context):
   # load the request body (which is expected to be JSON) into a Python dictionary
   body = json.loads(event['body'])
  
   # extract the 'email' and 'id' fields from the request body
   email = body['email']
   id = body['id']
  
   try:
       # delete the item with the specified email and id from the DynamoDB table
       response = table.delete_item(
           Key={
               'email': email,
               'id': id
           }
       )
      
       # return a success response
       return {
           'statusCode':200, # set the HTTP status code to 200 (OK)
           'body':json.dumps("Item deleted successfully") # return a JSON object with a success message
       }
   except Exception as e:
       # if an error occurs while deleting the item, return an error response
       return {
           'statusCode': 500, # set the HTTP status code to 500 (Internal Server Error)
           'body' : json.dumps(
               {'message':str(e)} # return a JSON object with an error message containing the exception
           )
       }
