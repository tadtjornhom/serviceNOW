/**
 * Created by ttjornhom on 12/15/17.
 */



var hsr = new GlideRecord('u_customer_product_model');
hsr.addQuery('customer', false);
hsr.query();
if(hsr.next()){
    hsr.cmdb_model_category = 'RedBrick Customer Products';
    hsr.edition = '5.3';
    gs.print(hsr.display_name);
    hsr.update();
}


var hsr = new GlideRecord('u_customer_product_model');
hsr.addQuery('cmdb_model_category','DOES NOT CONTAIN', 'RedBrick');
hsr.query();
while(hsr.next()){
    hsr.cmdb_model_category = 'RedBrick Customer Products';
    hsr.edition = '5.3';
    gs.print(hsr.display_name);
    hsr.update();
}
