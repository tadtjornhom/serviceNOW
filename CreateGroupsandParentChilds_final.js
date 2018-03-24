// Create all the Security Groups   name!=ITIL


// Create groups out of user set -- License groups

var childGroups

var queryString = "name!=ITIL";  // Give me all menus execpt for Adminstrator
var gr = new GlideRecord('sys_user_set');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {
    gs.print(gr.name);
    gs.print(gr.groups);
    childGroups =  gr.groups;

    //check if user group exists

    var count = new GlideAggregate('sys_user_group');
    count.addQuery('name', '=', gr.name);
    count.addAggregate('count');
    count.query();
    var result = 0;
    if (count.next())
        result = count.getAggregate('COUNT');
    gs.print(  gr.name + ' Result: ' + result);

    // if group count or exists then create a new group otherwise skip
    if (result == 0) {

        gs.print('creating User Group: ' + gr.name);
        var gruser = new GlideRecord('sys_user_group');
        gruser.initialize();
        gruser.name = gr.name;
        gruser.description = 'Security User Group based off of User Sets. This is used to keep track of Menu Items';
        gruser.type = 'Security';
        //gruser.groups = gr.groups;
        var parentGroupid = gruser.insert();

// loop thru security Groups and assign Roles and Groups
        childGroups = [gr.groups];

        // update child Groups

        var grchild = new GlideRecord('sys_user_group');
        grchild.addQuery('sys_id', 'IN', childGroups);
        grchild.query();
        while (grchild.next()) {
            gs.print(grchild.name);
            grchild.parent = parentGroupid;
            grchild.update();
        }
    } // end of if group exists

}


// Applications that need specific Groups

var groupPrefix = 'Platform Runtime - Fulfiller: ';
var queryString = "name=u_case management^ORname=Redbrick Health Security^ORtitleLIKEAccount Man^ORtitleLIKEHealth Screenings^ORtitleLIKEProduct Con";  // Give me all menus execpt for Adminstrator
var gr = new GlideRecord('sys_app_application');
gr.addEncodedQuery(queryString);
gr.query();
while (gr.next()) {

    // clean up menu name and check roles
    gs.print(gr.title);
    var count = new GlideAggregate('sys_user_group');
    count.addQuery('name', 'CONTAINS', groupPrefix + gr.title);
    count.addAggregate('count');
    count.query();
    var result = 0;
    if (count.next())
        result = count.getAggregate('COUNT');
    gs.print(gr.title + ' Result: ' + result);

    // if group count or exists then create a new group otherwise skip
    if (result == 0) {
        gs.print('creating User Group: ' + gr.title);
        var gruser = new GlideRecord('sys_user_group');
        gruser.initialize();
        gruser.name = groupPrefix + gr.title;
        gruser.description = 'Security User Group based off of Platform Runtime - Applications. This is used to keep track of Menu Items and other roles assoicated.';
        gruser.type = 'Security';
        //gruser.groups = gr.groups;
        var parentGroupid = gruser.insert();

    }

}