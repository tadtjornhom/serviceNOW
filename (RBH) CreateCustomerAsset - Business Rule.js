/**
 * Created by ttjornhom on 12/14/17.
 */


//var type = (new AssetUtils()).getAssetOrConsumable(current.purchase_line.model);

// create asset



createRecSlipLineAssets: function(pol, rsl, qty,  assetSysIds, reserve) {


  // Get Contract

    var contract = new GlideRecord('ast_contract');





    var po = new GlideRecord('proc_po');
    po.get(pol.purchase_order);

    var type = (new AssetUtils()).getAssetOrConsumable(pol.model);
    var asset = new GlideRecord('alm_asset');
    asset.addQuery('purchase_line', pol.sys_id);
    asset.addQuery('receiving_line', '');
    asset.addQuery('install_status', STATUS_ON_ORDER);
    /* Incase of asset are precreated and */
    if (!gs.nil(assetSysIds) && assetSysIds.length>0) {
        asset.addQuery('sys_id','IN',assetSysIds.join(','));
    }
    asset.query();

    while (qty > 0) {
        if (asset.next()) {
            if (type == 'software') {
                asset.install_status = STATUS_IN_USE;
            } else {
                asset.install_status = STATUS_IN_STOCK;
                asset.substatus = 'available';
            }
            asset.receiving_line = rsl.sys_id;
            asset.stockroom = rsl.receiving_slip.stockroom;
            if (JSUtil.nil(reserve)) {
                asset.reserved_for = rsl.requested_for;
            }
            asset.cost = rsl.cost;
            asset.work_notes = gs.getMessage('Received through Purchase Order {0} by {1}', [ (this.getHref(po, po.number)), (gs.getUser().getFullName()) ]);
            asset.update();
            qty--;
        } else {
            if (type == 'software') {
                this._createSoftware(po, pol, STATUS_IN_USE, rsl);
                qty--;
            } else if (type == 'hardware' || type =='asset') {
                this._createAsset(po, pol, STATUS_IN_STOCK, rsl, reserve);
                qty--;
            }
        }
    }
}








if (type == 'consumable')
    (new ProcurementUtils()).createRecSlipLineConsumables(current.purchase_line, current, current.quantity);
else if(type == 'software') {
    /* Create single software asset with rights equals to purchase order line quantity. Rights will get updated as part of
     * Slip line creation*/
    (new ProcurementUtils()).createRecSlipLineAssets(current.purchase_line, current, 1);
} else
    (new ProcurementUtils()).createRecSlipLineAssets(current.purchase_line, current, current.quantity);






// Check if Customer Product needs to be an Asset



// Doest the product go on a contract?


// If product does go on the contract / chech if product is already contracted?




// if NOT then add as Contracted Product




