#Need to install requests package for python
#easy_install requests
import requests

# Set the request parameters
#url = 'https://redbrickhealthdev.service-now.com/api/now/import/x_rebhr_fulfillmnt_document_processing_w'
url = 'https://docs.redbrickhealth.net/confluence/rest/api/content/'

url = 'https://docs.redbrickhealth.net/pages/recentlyupdated.action?key=ClinicRsrc'
url = 'http://localhost:8080/confluence/rest/api/content/'


# Eg. User name="admin", Password="admin" for this code sample.
user = 'admin'
pwd = 'admin'

# Set proper headers
headers = {"Content-Type":"application/json","Accept":"application/json"}

# Do the HTTP request
response = requests.post(url, auth=(user, pwd), headers=headers)

# Check for HTTP codes other than 200
if response.status_code != 200:
    print('Status:', response.status_code, 'Headers:', response.headers, 'Error Response:',response.json())
    exit()

# Decode the JSON response into a dictionary and use the data
data = response.json()
print(data)