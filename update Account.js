/**
 * Created by ttjornhom on 7/25/17.
 */


var childinc = new GlideRecord('x_rebhr_acct_mgmt_account_risk');
childinc.addQuery('company', current.company);
childinc.addQuery('active', '=', "True");
childinc.query();

if (childinc.getRowCount()>0) {
    var parentinc = new GlideRecord("core_company");
    parentinc.get(current.company);
    parentinc.u_account_at_risk = "False";
    parentinc.update();

}
else {
    var parentinc2 = new GlideRecord("core_company");
    parentinc2.get(current.company);
    parentinc2.company.u_account_at_risk = "True";
    parentinc2.update();
}
