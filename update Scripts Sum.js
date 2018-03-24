(function executeRule(current, previous /*null when async*/) {

    //
    // get total Active Risks from all events
    var sum;
    var count = new GlideAggregate('x_rebhr_acct_mgmt_account_risk');
    count.addAggregate('COUNT', 'active');
    count.setGroup(false);
    count.query();
    while (count.next()) {
        sum = count.getAggregate('COUNT', 'active');
    }
    var hsr = new GlideRecord('Company');
    hsr.addQuery('sys_id', current.company);
    hsr.query();
    if(hsr.next()){
        hsr.u_risk_totals = sum;
        hsr.update();
    }

})(current, previous);