/**
 * Created by ttjornhom on 12/14/17.
 */


ProcurementUtils

_createAsset: function(po, pol, status, rsl, reserve) {
    //Respect "Don't create assets" option
    if (pol.model.asset_tracking_strategy == "do_not_track") {
        return;
    }

    //Avoid creating asset if there's no category
    if (!pol.model.cmdb_model_category){
        var message = gs.getMessage("No Assets for \"{0}\" were created because the Product Model does not have a Model Category", pol.model.display_name);
        gs.addInfoMessage(message);
        return;
    }

    var asset = new GlideRecord('alm_hardware');
    asset.initialize();
    asset.model = pol.model;
    asset.install_status = status;
    if(JSUtil.nil(reserve)) {
        asset.reserved_for = po.requested_by;
    }
    asset.purchase_line = pol.sys_id;
    asset.request_line = pol.request_line;
    asset.model_category = pol.model.cmdb_model_category.split(',')[0];
    asset.vendor = po.vendor;
    asset.acquisition_method = 'purchase';
    if (rsl) {
        if (JSUtil.nil(reserve)) {
            asset.reserved_for = rsl.requested_for;
        }
        if (reserve === true) {
            asset.substatus = 'reserved';
            if (!JSUtil.nil(rsl.requested_for)) {
                asset.reserved_for = rsl.requested_for;
            }
        }
        asset.receiving_line = rsl.sys_id;
        asset.cost = rsl.cost;
        asset.stockroom = rsl.receiving_slip.stockroom;
        asset.work_notes = gs.getMessage('Received through Purchase Order {0} by {1}', [ (this.getHref(po, po.number)), (gs.getUser().getFullName()) ]);
    }

    asset.insert();
},

alm_asset

sc_request



_createCustomerAsset: function(po, pol, status, rsl) {

    var asset = new GlideRecord('u_alm_redbrick_products');
    asset.initialize();
    asset.model = pol.model;
    asset.install_status = status;
    asset.reserved_for = po.requested_by;
    asset.account = po.account
   // asset.purchase_line = pol.sys_id;
    asset.invoice_number = po.Number

    asset.request_line = pol.request_line;
    //asset.vendor = po.vendor;
    asset.acquisition_method = 'request';
    // below is added for customer prodoucts
    asset.order_date = po.created;
    asset.comments = pol.comments_and_work_notes;




    asset.insert();
},

