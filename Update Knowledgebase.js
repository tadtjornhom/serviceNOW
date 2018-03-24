var kbKnowledge = new GlideRecord("kb_knowledge");
kbKnowledge.query();
while (kbKnowledge.next()){
        kbKnowledge.setValue("disable_commenting", "True");
        kbKnowledge.setValue("disable_suggesting", "False");
    kbKnowledge.update();



}


var kbKnowledge = new GlideRecord("kb_knowledge");
kbKnowledge.query();
while (kbKnowledge.next()){
    kbKnowledge.setValue("disable_commenting", "False");
    kbKnowledge.setValue("disable_suggesting", "False");
    kbKnowledge.update();
}

///

/// Get Company ID from current Risk Record


/// Summarize all All Risks to a variable


/// Update Company Based on Risk
var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
kbKnowledgeBase.get(current.sys_id);



/// Update Count
var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
//kbKnowledge.addQuery("kb_knowledge_base", current.sys_id);
kbKnowledge.query();
while (kbKnowledge.next()){

  print   kbKnowledgeBase.sys_id
}





//////// Example Code:


var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
kbKnowledgeBase.get(current.sys_id);
if ((current.disable_commenting != kbKnowledgeBase.disable_commenting) || (current.disable_suggest != kbKnowledgeBase.disable_suggest)){
    var kbKnowledge = new GlideRecord("kb_knowledge");
    kbKnowledge.addQuery("kb_knowledge_base", current.sys_id);
    kbKnowledge.query();
    while (kbKnowledge.next()){
        if (current.disable_commenting != kbKnowledgeBase.disable_commenting)
            kbKnowledge.setValue("disable_commenting", current.disable_commenting);
        if (current.disable_suggesting != kbKnowledgeBase.disable_suggesting)
            kbKnowledge.setValue("disable_suggesting", current.disable_suggesting);
        kbKnowledge.update();
    }
}
action.setRedirectURL(current);
current.update();



////////////////// Example Code
var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
kbKnowledge.addQuery("disable_suggesting", 'True');
kbKnowledge.query();
while (kbKnowledgeBase.next()){
    if (current.disable_commenting != kbKnowledgeBase.disable_commenting)
        kbKnowledge.setValue("disable_commenting", current.disable_commenting);
    if (current.disable_suggesting != kbKnowledgeBase.disable_suggesting)
        kbKnowledge.setValue("disable_suggesting", current.disable_suggesting);
    kbKnowledge.update();

    gs.addInfoMessage(kbKnowledgeBase.short_description);
}

///




(function executeRule(current, previous /*null when async*/) {

// Get Account ID and set value
    var accID = current.company;



// Get Total Count of Active Risks base on Account ID
//Number of incidents varies depending on the current state
//of the incident table

    var count = new GlideAggregate('incident');
    count.addQuery('active', '=','true');
    count.addAggregate('COUNT', 'category');
    count.query();
    while (count.next()) {
        var category = count.category;
        var categoryCount = count.getAggregate('COUNT', 'category');
        gs.info("There are currently " + categoryCount + " incidents with a category of " + category);
    }


// Update Account Risks Total


    // Example update Table use to update Company ID
    var gr = new GlideRecord('incident')
    gr.get('99ebb4156fa831005be8883e6b3ee4b9');
    gr.short_description='Update the short description';
    gr.update();
    gs.info(gr.getElement('short_description'));




})(current, previous);

/////////////////

var count =new GlideAggregate('incident');
count.addQuery('active','true');
count.addAggregate('COUNT');
count.query();var incidents =0;if(count.next())
    incidents = count.getAggregate('COUNT');



//////// worked in DEV update script

var queryString = "active=true^disable_commenting=true^ORdisable_suggesting=true";
var gr = new GlideRecord('kb_knowledge_base');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {
    gs.addInfoMessage(gr.number);
}



var queryString = "active=true^disable_commenting=true^ORdisable_suggesting=true";
var gr = new GlideRecord('kb_knowledge_base');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {
    var kb_base_id =   gs.addInfoMessage(gr.sys_id);

// get article updates

    var queryString = "active=true^disable_commenting=true^ORdisable_suggesting=true";
    var gr = new GlideRecord('kb_knowledge_base');
    gr.addQuery('sys_id', );
    gr.query();

    while (gr.next()) {
        gs.addInfoMessage(gr.sys_id);






    }


