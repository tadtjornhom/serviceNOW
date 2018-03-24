#Need to install requests package for python
#easy_install requests
import requests

# Set the request parameters
url = 'https://redbrickhealthdev.service-now.com/api/now/import/x_rebhr_fulfillmnt_document_processing_w'

# Eg. User name="admin", Password="admin" for this code sample.
user = 'admin'
pwd = 'admin'

# Set proper headers
headers = {"Content-Type":"application/json","Accept":"application/json"}

# Do the HTTP request
response = requests.post(url, auth=(user, pwd), headers=headers ,data="{\"active\":\"true\",\"short_description\":\"Imported from Directory\",\"u_form_location\":\"Location of the file\",\"company\":\"123123\",\"state\":\"0\",\"assignment_group\":\"Fulfillment Services Assignment\",\"business_service\":\"Forms Fulfillment\"}")

# Check for HTTP codes other than 200
if response.status_code != 200:
    print('Status:', response.status_code, 'Headers:', response.headers, 'Error Response:',response.json())
    exit()

# Decode the JSON response into a dictionary and use the data
data = response.json()
print(data)