// var date = new GlideDateTime();
// var emailAddress = current.u_caller.u_consumer_email.getDisplayValue();
// var firstName = current.u_caller.u_first_name.getDisplayValue();
//This business rule is used to add a watermark to the email sent by webservices from 3rd party software
//If the body doesn't contain a watermark for a message send-ready, it's necessary to add it
//Create a new watermark with the information of the email created by the webservice


var gl = new GSLog("UNKOWN", "u_service_ticket:service_tickets_events_ws");

var watermark = new GlideRecord('sys_watermark');
watermark.source_table = "u_service_tickets";
watermark.source_id = current.instance;
watermark.email = current.sys_id;

//Store the number of the watermark and save it
var waterMarkNumber = watermark.number;
var sysID = watermark.insert();

//Add the watermark to the body
current.body += "<p><div style='display:inline'>Ref:" + number + "</div></p>";

var lm = '\\$&';

var comm1 = current.comments.getJournalEntry(1);
// added via story STRY0010338 - Remove leading text  -- v2
// Need to remove the Journey Entry beginning text
comm1 =  comm1.substr(comm1.indexOf(')') + 1)  ;

// This is the area the had an encodedURIComponent
//var comm = encodeURIComponent(comm1);
var comm = comm1.replace(/["]/g, lm).replace(/'/g, "'")  ;



var legalese = 'Please be aware that e-mail and other electronic communication can be intercepted in transmission or misdirected. Please consider communicating any sensitive information by telephone or via your password-protected online account.<br><br>This message and its attachments may contain privileged and confidential information and/or protected health information (PHI) intended solely for the use of RedBrick Health and the recipient(s) named above. If you are not the recipient, or the employee or agent responsible for delivering this message to the intended recipient, you are hereby notified that any review, dissemination, distribution, printing or copying of this email message and/or any attachments is strictly prohibited. If you have received this transmission in error, please notify the sender immediately at security@redbrickhealth.com and permanently delete this message and any attachments.';
var HTMLheader = '<!DOCTYPE html><html><body><br>';
var HTMLtrailer = '</body></html>';
var number = current.number.getDisplayValue();

var updateComments = HTMLheader + current.u_caller.u_orgid.u_salutation + '<br><br>We wanted to let you know this update regarding the Service Ticket you submitted:' + '<br><br><i> ' + comm + '</i><br><br><br><br>' + current.u_caller.u_orgid.u_signature + '<br><br><br><br>' + legalese + '<br><br>' + waterMarkNumber + HTMLtrailer;

var newComments = HTMLheader + current.u_caller.u_orgid.u_salutation + '<br><br>Thanks for contacting us with your question or comment. Our team typically replies to questions within two business days. Your support request number is ' + number + '. If you have any update on the question or problem you have described, you can reply to this email.<br><br>If you have provided feedback that does not require a reply, thanks for taking the time to share your experience!<br><br><br>Have a healthy day,<br><br>Your Support Team<br><br><br>' + current.u_caller.u_orgid.u_signature + '<br><br><br><br>' + legalese + '<br><br>' + waterMarkNumber + HTMLtrailer;

var u_message1 = current.u_message_to_consumer;



var u_message = u_message1.replace(/["]/g, lm).replace(/'/g, "'")  ;

var resolveComments = HTMLheader + current.u_caller.u_orgid.u_salutation + '<br><br>' + u_message + '<br><br>Thanks for working with us on your Service Ticket. Your case has been resolved. If you have additional needs, or if your problem has not been resolved, please let us know—we want to help.<br><br><br>Have a healthy day,<br><br>Your Support Team<br><br><br>' + current.u_caller.u_orgid.u_signature + '<br><br><br><br>' + legalese + '<br><br>' + waterMarkNumber + HTMLtrailer;

if(current.comments.changes()) {
    //gs.eventQueue("serviceticket.commented", current, emailAddress, firstName);
    var r = new RESTMessage('RB5 Messaging', 'post');
    r.setStringParameter('subject', 'Updates to Service Ticket ' + number);
    r.setStringParameter('to', current.u_caller.u_consumer_id);
//	r.setStringParameter('messageHtml', updateComments);
    r.setXMLParameter('messageHtml', updateComments);
    r.setStringParameter('appID', '1016');
    r.setStringParameter('replyTo', 'redbrickhealth@service-now.com');

    var response = r.execute();
    if (response.getStatusCode() == 202) {
        gl.loginfo("-->> service ticket outbound email successful. Under Changes");
        gs.addInfoMessage('service ticket outbound email successful. Under Changes');
    } else {

        gl.logErr('Response Code : ' + response.getStatusCode() + 'received from server. UnderChanges');
        gl.logErr("Response Body : " +response.getBody());
        gs.addInfoMessage('Error Occurred Accessing email service: Contact Admin');
    }


}

//new
if ((current.operation() == 'insert') && (current.state == 1)) {
    //gs.eventQueue("serviceticket.opened", current, emailAddress, firstName);
    var r = new RESTMessage('RB5 Messaging', 'post');
    r.setStringParameter('subject', 'Your Support Ticket ' + number +' has been Opened');
    r.setStringParameter('to', current.u_caller.u_consumer_id);
    r.setXMLParameter('messageHtml', newComments);
    r.setStringParameter('appID', '1016');
    r.setStringParameter('replyTo', 'redbrickhealth@service-now.com');

    var response = r.execute();
    if (response.getStatusCode() == 202) { gl.log("-->> service ticket outbound successful. Under NEW Ticket");
        gs.addInfoMessage('service ticket outbound email successful. On create New Ticket');

    } else {

        gl.logErr("Response Code : " + response.getStatusCode() + "  received from server:  UnderNEW");
        gl.logErr("Response Body : " +response.getBody());
        gs.addInfoMessage('ERROR: Service ticket outbound email failed on Insert contact your Admin');
    }

}

//if (current.state.changesTo(7)) {
if (current.state == 7 && previous.state != current.state) {

//gs.eventQueue("serviceticket.resolved", current, emailAddress, firstName);
    var r = new RESTMessage('RB5 Messaging', 'post');
    r.setStringParameter('subject', 'Your Service Ticket ' + current.number + ' has been resolved');
    r.setStringParameter('to', current.u_caller.u_consumer_id);
    r.setXMLParameter('messageHtml', resolveComments);
    //r.setStringParameter('from', 'redbrickhealthdev@service-now.com');
    r.setStringParameter('appID', '1016');
    r.setStringParameter('replyTo', 'redbrickhealth@service-now.com');

    var response = r.execute();
    if (response.getStatusCode() == 202) {
        gl.log("-->> service ticket outbound Call Successful. Under Resolved Ticket");
        gs.addInfoMessage('service ticket outbound email sucessful. Under Resolved Ticket');
    } else {

        gl.logErr("Response Code : " + response.getStatusCode() + "  received from server: Under resolved ");
        gl.logErr("Response Body : " +response.getBody());
        gl.logErr("TEXT message: " + resolveComments);
        gs.addInfoMessage('ERROR: Service ticket outbound email failed on Resolved. Contact your Admin' + resolveComments);
    }

}

#941561 /u_service_tickets.do


pp128141.iad111.service-now.com:redbrickhealth011

7E61E09EDBD48B005D95F3261D961996


