# add your get-notes function here
import json
import boto3
from boto3.dynamodb.conditions import Key
dynamodb = boto3.resource("dynamodb") # create a resource object for DynamoDB
table = dynamodb.Table("lotion-30143419") # get a Table object for the "lotion-30143419" table

def handler(event, context):
    try:
        email = event['queryStringParameters']['email'] # get the value of the 'email' query parameter from the event object
        response = table.query(KeyConditionExpression=Key('email').eq(email)) # query the DynamoDB table for items with the specified email address
        
        # check if the query returned any items
        if response['Count'] == 0:
            # if no items were found, return a success response with an empty list of data
            response = {
                "statusCode": 200,
                "body": json.dumps({
                    'message': "Success",
                    'data': []
                })
            }
            return response
        
        # if items were found, return a success response with the data
        response = {
            "statusCode": 200,
            "body": json.dumps({
                'message': "Success",
                'data': response['Items']
            })
        }
        return response
    except Exception:
        # if an exception occurs, return an error response
        response={
            "statusCode":404, # set the HTTP status code to 404 (Not Found)
            "body":json.dumps(
                { 'message':"Its not working" } # return a JSON object with an error message
            )
        }
        return response
