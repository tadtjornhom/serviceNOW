/**
 * Created by ttjornhom on 7/27/17.
 */


// XLT
// Leadership Team


function onBefore(current, previous){
    var watchList = current.watch_list.getDisplayValue(); //Get current users in the watchlist
    var array = watchList.split(","); //Split the watchlist into an array
    var user = new GlideRecord('sys_user'); //get glide record of user to add to the watchlist

    try{
        user.addQuery('email', "abel.tuter@example.com");
        user.query();
        if(user.next()){
            var caller = user.getDisplayValue(); //get the value of user to add to the watchlist
            var searchResult = watchList.search(caller); //check if the user is already on the watchlist
            if(searchResult == -1){ //returns -1 if no search is found( Here to check if caller is already there in the watchlist)
                array.push(caller); //add caller to the watchlist
                current.watch_list = array.join(','); //update watchlist
            }
        }
    }
    catch(err){
        gs.log("BR - Add user to VIP Incidents - " + err);
    }
}

============

function GrpMem(group_name){
    //This arrary will hold the user id of the group members
    var arrUsers = [];

    //Need to lookup user id later
    var usr = new GlideRecord('sys_user');

    //Need to get sys_id of the group
    var grpSysId = cmGetSysID(group_name,'sys_user_group');

    //Need to look up the Group Members
    gr = new GlideRecord('sys_user_grmember');
    gr.addQuery('group',grpSysId);
    gr.query();
    while (gr.next()){
        usr.initialize(); //Utilise the 'sys_user' table
        usr.addQuery('sys_id',gr.user);
        usr.query();
        while (usr.next()) {
            //gs.log("++CM: " + usr.user_name);
            arrUsers.push(usr.user_name + "");
        }

    }

    return arrUsers;

}

function cmGetSysID(itemName,tableName,fieldName){

    var defaultField = 'name';
    var fldName = (typeof fieldName === 'undefined')?defaultField:fieldName;

    var gdRec = new GlideRecord(tableName);
    gdRec.addQuery(fldName, '=', itemName);
    gdRec.query();
    //gs.log("CM:itemName: " + itemName + " tableName: " + tableName + " fieldName: " + fieldName + " fldName: " + fldName);
    if(gdRec.next()){
        return gdRec.sys_id;


    }else{
        return false;
    }
}

//Call in Report as: javascript:GrpMem('Service Desk')
//Example Filter: "created by, is, javascript:GrpMem('Service Desk')"


