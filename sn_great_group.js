/**
 * Created by ttjornhom on 3/13/18.
 */

var gr = new GlideRecord('sys_user_group');
gr.initialize();
gr.name = 'first to do item';
gr.description = 'learn about GlideRecord';
gr.source = 'Profile Group create by '
gr.insert();



var getKB = new GlideRecord('sys_user_group');
getKB.addQuery('title', tempKB);
getKB.query();
if(getKB.next()){
    var genKB = new GlideRecord('kb_knowledge_base');
    genKB.initialize();
    genKB.title = companyName;
    genKB.workflow = getKB.workflow;
    genKB.retire_workflow = getKB.workflow;
    genKB.description = companyName + ' KB';
    genKB.template = getKB.template;
    genKB.u_company = company;
    genKB.workflow = getKB.workflow;
    genKB.retire_workflow = getKB.retire_workflow;
    genKB.disable_commenting = getKB.disable_commenting;
    genKB.disable_suggesting = getKB.disable_suggesting;
    genKB.disable_category_editing = getKB.disable_category_editing;
    genKB.insert();
    newRec = genKB.sys_id;
}