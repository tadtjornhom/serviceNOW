setValue(String, Object)(function executeRule(current, previous /*null when async*/) {


    var childinc = new GlideRecord('x_rebhr_acct_mgmt_account_risk');
    childinc.addQuery('company', current.company);
    childinc.addQuery('active', '=', "True");
    childinc.query();




    if (childinc.getRowCount()>0) {
        gs.addInfoMessage("in HAS Counts");
        var parentinc = new GlideRecord("core_company");
        parentinc.get(current.company);

//	gs.addInfoMessage(parentinc.getUniqueValue());

        //gs.addInfoMessage(current.company);

        parentinc.setValue("u_account_at_risk","False");
//	parentinc.setValue("u_risk_status_calculated","2");
        parentinc.update();

    }
    else {
        gs.addInfoMessage("in DOESNT HAVE Counts");
        var parentinc2 = new GlideRecord("core_company");
        parentinc2.get(current.company);
        // parentinc2.company.u_account_at_risk = "True";
        parentinc2.setValue(u_account_at_risk,"False");
        parentinc2.setValue(u_risk_status_calculated,"2");
        parentinc2.updateWithReferences();
    }



})(current, previous);/**
 * Created by ttjornhom on 7/26/17.
 */
