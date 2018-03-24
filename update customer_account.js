/**
 * Created by ttjornhom on 12/12/17.
 */


var hsr = new GlideRecord('customer_account');
hsr.addQuery('u_status','=','customer');
hsr.query();
while(hsr.next()){
    hsr.u_account_health_status = 100;
    hsr.u_account_health_status = 100 - hsr.u_risk_totals;
    hsr.name;
    hsr.update();
}


var hsr = new GlideRecord('customer_account');
hsr.addQuery('customer', false);
hsr.query();
if(hsr.next()){
    hsr.u_account_health_status = 100;
    hsr.u_account_health_status = 100 - hsr.u_risk_totals;
    gs.print(hsr.name);
    hsr.update();
}






active=true^u_status=customer