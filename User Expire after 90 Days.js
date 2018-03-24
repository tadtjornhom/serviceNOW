/**
 * Created by ttjornhom on 3/24/18.
 */


Scheduled Job
Name: User Expire after 90 Days
Table: sys_user
Active: True
When: after



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
        role.addQuery('role', '282bf1fac6112285017366cb5f867469');  // ITIL User sys_id
        role.query();
        if(role.next()){
            c++;
            //gs.log('ITIL User ' + usr.name + " last login " + usr.last_login_time + ' should be less ' + gs.daysAgo(90) + " count[" + c + "]");
            notes = '\nITIL User ' + usr.name + ' has not logged in within 90 days, setting user to Self Service only.\n';
            notes = notes + 'Removing group membership(s): \n';
            var grp1 = new GlideRecord('sys_user_grmember');
            grp1.addQuery('user',user1);
            grp1.query();

            while(grp1.next()){

                if(grp1.group.getDisplayValue() != 'SYSTEM-LEADERSHIP-TEAM'){  //process group that does not have roles
                    notes = notes + grp1.group.getDisplayValue() + '\n';

                    grp1.deleteRecord();
                }
            }
            usr.u_notes = usr.u_notes + notes + '---\n';
            usr.update();

        }


    }

}
