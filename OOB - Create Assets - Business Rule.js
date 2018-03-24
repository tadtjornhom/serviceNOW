/**
 * Created by ttjornhom on 12/14/17.
 */


// On Receiving shiplines


var type = (new AssetUtils()).getAssetOrConsumable(current.purchase_line.model);

if (type == 'consumable')
    (new ProcurementUtils()).createRecSlipLineConsumables(current.purchase_line, current, current.quantity);
else if(type == 'software') {
    /* Create single software asset with rights equals to purchase order line quantity. Rights will get updated as part of
     * Slip line creation*/
    (new ProcurementUtils()).createRecSlipLineAssets(current.purchase_line, current, 1);
} else
    (new ProcurementUtils()).createRecSlipLineAssets(current.purchase_line, current, current.quantity);

