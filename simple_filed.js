/**
 * Created by ttjornhom on 2/12/18.
 */


//role.nameSTARTSWITHRBH_^role=512bf5976f24d200a1af77f16a3ee494


var c = 0;
var notes = '';
var usr = new GlideRecord('sys_user');
usr.addNotNullQuery('last_login_time');
usr.query();

while(usr.next()){
    var user1 = usr.sys_id;
    var user1disp = usr.name;

    if(usr.last_login_time <= gs.daysAgo(90)){

        var role = new GlideRecord('sys_user_has_role');
        role.addQuery('user', usr.sys_id);
        //role.addQuery('role', '512bf5976f24d200a1af77f16a3ee494');  // ITIL User sys_id
        role.addQuery('role', 'dc4ec6866fe5c600a1af77f16a3ee4ed');  // ITIL User sys_id
        role.addEncodedQuery('roles=case^ORroles=case_admin^ORroles=case_ce^ORroles=case_partner^ORroles=case_rbh^active=true')

        role.query();
        if(role.next()){
            c++;
            gs.print('RBH_User ' + usr.name + " last login " + usr.last_login_time + ' should be less ' + gs.daysAgo(90) + " count[" + c + "]");


        }


    }

}

https://redbrickhealth.service-now.com/sys_user_list.do?sysparm_query=roles%3Dcase%5EORroles%3Dcase_admin%5EORroles%3Dcase_ce%5EORroles%3Dcase_convergys%5EORroles%3Dcase_convergys_manager%5EORroles%3Dcase_partner%5EORroles%3Dcase_rbh%5Eactive%3Dtrue%5Elast_login_time%3E%3Djavascript%3Ags.beginningOfLast3Months()

var c = 0;
var notes = '';
var usr = new GlideRecord('sys_user');
usr.addNotNullQuery('last_login_time');
usr.query();

while(usr.next()){
    var user1 = usr.sys_id;
    var user1disp = usr.name;

    if(usr.last_login_time <= gs.daysAgo(90)){

        var role = new GlideRecord('sys_user_has_role');
        //role.addQuery('user', usr.sys_id);
        //role.addQuery('role', '512bf5976f24d200a1af77f16a3ee494');  // ITIL User sys_id
        // role.addQuery('role', 'dc4ec6866fe5c600a1af77f16a3ee4ed');  // ITIL User sys_id
        var query1 = 'roles=case^ORroles=case_admin^ORroles=case_ce^ORroles=case_partner^ORroles=case_rbh^active=true^user=' + usr.sys_id
        role.addEncodedQuery(query1)
        role.query();
        if(role.next()){
            c++;
            gs.print('RBH_User ' + usr.name + " last login " + usr.last_login_time + ' should be less ' + gs.daysAgo(90) + " count[" + c + "]");


        }


    }

}

