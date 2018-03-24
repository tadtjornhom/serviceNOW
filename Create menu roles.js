/**
 * Created by ttjornhom on 2/20/18.
 */

var menuprefix = 'rbh_menu_'
var role_descrption = 'Custom menu role created to help limit menu items from Out of the box';
var testFLAG = true

// Categories =  Administrator noe Intration and Now Maint  these Categories do not have ITIL roles
var queryString = "active=true^category!=647e6524c0a80a080010856a87e15ce2^category!=af726f910a0a0b24008b69fe9c311123^ORcategory=NULL^category!=64a57d54c0a80a0800df287577026003^ORcategory=NULL";  // Give me all menus execpt for Adminstrator
var gr = new GlideRecord('sys_app_application');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {

    // clean up menu name and check roles
    var newmenuName = gr.title;
    newmenuName = newmenuName.replace(/\s/g, "_");
    newmenuName = menuprefix + newmenuName;
    // Search string to see if Menu has an RBH menu assoicated
    var str = gr.roles;
    var n = str.search("newmenuName");

    // IF Menu role exists then Continue on
    if (n =! -1) { continue; }

    // If you are here Create Role and update Menu item
    gs.addInfoMessage(newmenuName);


    // call create sys roles function
    if (testFLAG = false) {
        var role_sysID = create_sys_roles(newmenuName);
    }

    var new_description = gr.description + '\n =========== SN Standard Roles for ' + gr.title +' ============= \n ' + gr.roles + '\n ====================== \n '  ;
    gs.addInfoMessage(new_description);
    gs.addInfoMessage(gr.title);

    // update Menu item with new decription and add roles.
    gr.description = new_description

}


/*  Assoicate Menu items with Roles Section
1. Find all the ITIL roles and assoicate with itil security group
2. Find all the CSM roles and associate with CSM security Groups

*/


roles=itil

var queryString = "roles=itil";  // Give me all menus execpt for Adminstrator
var gr = new GlideRecord('sys_app_application');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {
    gs.addInfoMessage(gr.title);


}

///  csm Standard OOB apps

var nameCSMAPPS = ['service_level_management','reports','prodcat','change_management','sn_communities_community','work','incident_management','km','knowledge_product_entitlements','problem_management']
var titleCSMAPPS = ['Customer Service','Routing and Assignment','service_catalog','Service Portal','Special Handling Notes']



var i;
for (i = 0; i < nameCSMAPPS.length; i++) {

    gs.addInfoMessage(nameCSMAPPS[i]);
}

/// csm RBH setups


/* function Create sys Roles
    1. take in Role name
    2. return Role sys ID
 */
function create_sys_roles(role_name) {

    var gr = new GlideRecord('sys_user_role');
    gr.initialize();
    role_name = 'rb_menu_' + role_name
    gr.name =  role_name ;
    gr.description = role_descrption;
    gr.can_delegate = false;
    gr.elevated_privilege = false;
    gr.grantable = false;
    gr.insert();

    return gr.sys_id

}

sys_user_group

var gr = new GlideRecord('sys_user_role');
gr.initialize();
gr.name = 'rb_menu_role_test';
gr.description = 'Testing making a role';
gr.can_delegate = false;
gr.elevated_privilege = false;
gr.grantable = false;
gr.insert();



