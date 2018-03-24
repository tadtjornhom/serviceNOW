/**
 * Created by ttjornhom on 12/14/17.
 */

/**
 *
 *
 * @type Utilities to handle PO/POL and asset creation
 */



var ProcurementUtils = Class.create();

ProcurementUtils.prototype = {
    initialize: function() {
        this.isSAMPActive = GlidePluginManager.isActive('com.snc.samp');
    },

    createPO: function(request, vendor, destination) {
        var po = new GlideRecord('proc_po');
        po.due_by = request.due_date;
        po.init_request = request.sys_id;
        po.requested_by = request.opened_by;
        po.requested_for = request.requested_for;
        po.location = request.location;
        po.vendor = vendor;
        po.ship_to = destination;
        po.insert();
        return po;
    },

    createPOLine: function(po, item, qty, vendor, consolidate, destination, vendorPrice, listPrice, metricGroup, licenseMetric) {
        if (po == '') {
            po = this._findPO(item, vendor, consolidate, destination);
        }

        var pol = new GlideRecord('proc_po_item');
        pol.purchase_order = po.sys_id;
        pol.model = item.cat_item.model;
        pol.product_catalog = item.cat_item;
        if (vendor == '') {
            pol.vendor = item.cat_item.vendor;
        }
        else {
            pol.vendor = vendor;
        }

        qty = (qty == '' || qty == 0)? item.quantity : qty;
        pol.ordered_quantity = qty;
        pol.received_quantity = 0;
        pol.remaining_quantity = qty;

        pol.cost = (vendorPrice == null || vendorPrice == undefined)? '' : vendorPrice;
        pol.list_price = (listPrice == null || listPrice == undefined || listPrice == 0)? pol.cost : listPrice;
        pol.short_description = item.cat_item.short_description;
        pol.part_number = item.cat_item.product_id;
        pol.request_line = item.sys_id;
        pol.requested_for = item.request.requested_for; //PRB633017 - requested_for should be the requested_for of the Request not the purchase order

        if (this.isSAMPActive && item.cat_item.model.sys_class_name == 'cmdb_software_product_model') {
            if (metricGroup && licenseMetric) {
                pol.metric_group = metricGroup;
                pol.license_metric = licenseMetric;
            } else {
                gs.info('[ProcurementUtils] License Metric and Group not provided or invalid (' + metricGroup + ', ' + licenseMetric + ')');
            }
        }

        return pol.insert();
    },

    createAsset: function(po) {
        var pol = new GlideRecord('proc_po_item');
        pol.addQuery('purchase_order', po.sys_id);
        pol.query();
        while (pol.next()) {
            this.createPOLineAssets(pol);
        }
    },

    createPOLineAssets: function(pol) {
        if (pol.status == 'canceled' || pol.status == 'received' || pol.status == 'pending') {
            return;
        }

        var qty = pol.remaining_quantity;
        var type = (new AssetUtils()).getAssetOrConsumable(pol.model);

        if (type == 'consumable') {
            this._createConsumable(pol.purchase_order, pol, qty, 2);
        } else if (type == 'software') {
            for (var x = 0; x < qty; x++) {
                this._createSoftware(pol.purchase_order, pol, 2);
            }
        } else if (type == 'hardware' || type =='asset') {
            for (var x = 0; x < qty; x++) {
                this._createAsset(pol.purchase_order, pol, 2);
            }
        }
    },

    hasHardwarePO: function(po){
        var pol = new GlideRecord('proc_po_item');
        pol.addQuery('purchase_order', po.sys_id);
        pol.query();
        while (pol.next()){
            if(this.hasHardwarePOLineItem(pol)) {
                return true;
            }
        }
        return false;
    },

    hasHardwarePOLineItem: function(pol){
        if (pol.status != 'canceled' && pol.status != 'received' && pol.status != 'pending') {
            var qty = pol.remaining_quantity;
            var type = (new AssetUtils()).getAssetOrConsumable(pol.model);
            if (type == 'hardware' || type =='asset') {
                return true;
            }
        }
        return false;
    },

    createHardwareAssetsPriorToDelivery: function(po){
        var pol = new GlideRecord('proc_po_item');
        pol.addQuery('purchase_order', po.sys_id);
        pol.query();
        while (pol.next()) {
            this.createPOLineHardwareAssetsPriorToDelivery(pol);
        }
    },

    createPOLineHardwareAssetsPriorToDelivery: function(pol){
        if (this.hasHardwarePOLineItem(pol)) {
            var qty = pol.remaining_quantity;
            for (var x = 0; x < qty; x++) {
                this._createAsset(pol.purchase_order, pol, 2);
            }
        }
    },

    poHasPurchaseOrderLineItems: function(po) {
        var pol = new GlideRecord('proc_po_item');
        pol.addQuery('purchase_order', po.sys_id);
        pol.query();

        return pol.hasNext();
    },

    poHasReceivingSlip: function(po) {
        var rsl = new GlideRecord('proc_rec_slip');
        rsl.addQuery('purchase_order', po.sys_id);
        rsl.query();

        return rsl.hasNext();
    },

    polHasReceivingSlipLine: function(po1) {
        var rs = new GlideRecord('proc_rec_slip_item');
        rs.addQuery('purchase_line', po1.sys_id);
        rs.query();

        return rs.hasNext();
    },

    getPOStatusFromPOL: function(polRecord) {
        var gr = new GlideRecord('proc_po');
        if (gr.get(polRecord.purchase_order)) {
            return gr.status;
        }

        return undefined;
    },

    updatePurchaseOrderQuantities: function(rsl) {
        var pol = new GlideRecord('proc_po_item');
        pol.get(rsl.purchase_line);

        var relatedRSL = new GlideRecord('proc_rec_slip_item');
        relatedRSL.addQuery('purchase_line', pol.sys_id);
        relatedRSL.query();

        pol.received_quantity = 0;
        while (relatedRSL.next()) {
            pol.received_quantity += relatedRSL.quantity;
        }

        pol.remaining_quantity = pol.ordered_quantity-pol.received_quantity;
        if (pol.remaining_quantity < 0) {
            pol.remaining_quantity = 0;
        }

        if (pol.remaining_quantity == 0) {
            pol.status = "received";
        }

        pol.update();
    },

    createReceiptSlip: function(po, stockroom) {
        var rs = new GlideRecord('proc_rec_slip');
        rs.initialize();
        rs.received = gs.nowDateTime();
        rs.purchase_order = po.sys_id;
        rs.stockroom = stockroom;
        rs.insert();

        return rs;
    },

    /* Same as Create Asset BR on Receiving Line */

    _selectOrCreateAsset: function(rsl, assetSysIds, swAssetCount, reserve) {
        if (!rsl.purchase_line.nil() &&
            rsl.quantity > 0 &&
            rsl.purchase_line.model.asset_tracking_strategy != 'do_not_track') {
            var type = (new AssetUtils()).getAssetOrConsumable(rsl.purchase_line.model);
            if (type == 'consumable') {
                this.createRecSlipLineConsumables(rsl.purchase_line, rsl, rsl.quantity);
            }
            else if(type == 'software') {
                /* Create software assets with same no of asset details with rights provided with asset details.
                 * Rights will get updated as part of Slip line creation */
                this.createRecSlipLineAssets(rsl.purchase_line, rsl, swAssetCount, assetSysIds);
            } else {
                this.createRecSlipLineAssets(rsl.purchase_line, rsl, rsl.quantity, assetSysIds, reserve);
            }
        }
    },

    /* same as Update Purchase Order Line BR on Receiving Line */
    _updatePOLine: function(rsl) {
        if(!rsl.purchase_order.nil()) {
            this.updatePurchaseOrderQuantities(rsl);
        }
    },

    createReceiptSlipLineWithAssetDetails: function(rec_slip, pol, qty, costWithCurrency, requestedFor, assetDetails, reserve, isSoftwareItem) {
        var assetTable = 'alm_asset';
        var hasAssetPregenerated =  false;
        /* By default create single software asset with rights equals to quantity requested.
         * But user can split the license asset while define asset details, so consider it.*/
        var swAssetCount = 1;
        if (!gs.nil(assetDetails) && assetDetails.length > 1) {
            swAssetCount = assetDetails.length;
        }

        if (isSoftwareItem) {
            assetTable = 'alm_license';
        }

        /* Get sys_ids of details for specific sys_ids, if case of pre-created assets */
        var assetSysids = [];
        for (var i = 0; i < assetDetails.length; i++) {
            if (!gs.nil(assetDetails[i]['sys_id'])) {
                assetSysids.push(assetDetails[i]['sys_id']);
            }
        }
        if (assetSysids.length > 0) {
            hasAssetPregenerated = true;
        }

        var rsl = new GlideRecord('proc_rec_slip_item');
        rsl.initialize();
        rsl.purchase_line = pol.sys_id;
        rsl.requested_for = requestedFor;
        rsl.received = gs.nowDateTime();
        rsl.received_by = gs.getUserID();
        rsl.receiving_slip = rec_slip.sys_id;
        rsl.quantity = qty;
        rsl.setDisplayValue('cost', costWithCurrency);
        rsl.setWorkflow(false); /* Avoid BR getting trigger in case of assets are pre-created */
        var rslId = rsl.insert();

        rsl = new GlideRecord('proc_rec_slip_item');
        rsl.get(rslId);

        /* Handle BRs work */
        this._selectOrCreateAsset(rsl, assetSysids, swAssetCount, reserve);

        this._updatePOLine(rsl);

        /* Handle asset tags, asset serials, and asset reservation */
        var assetGR = new GlideRecord(assetTable);
        assetGR.addQuery('receiving_line', rslId);
        /*  In case of pre-generated asset selection, restrict query to selcted assets only */
        if (!gs.nil(assetSysids) && assetSysids.length > 0) {
            assetGR.addQuery('sys_id', 'IN', assetSysids);
        }
        assetGR.query();

        /* For every asset matching the receiving line (created assets for the POL) update details */
        while (assetGR.next()) {
            var details;
            /* If assets are pre-generated then select asset as per user selection only */
            if (hasAssetPregenerated) {
                details = findAssetDetails(assetGR.sys_id);
            } else { /* else select randomly */
                details = assetDetails.splice(0,1);
            }

            if (!gs.nil(details) && !gs.nil(details[0])) {
                updateAsset(assetGR, details[0], reserve, hasAssetPregenerated, requestedFor);
            }
        }

        function updateAsset(assetGR, details, reserve, hasAssetPregenerated, requestedFor) {
            /* Do not update Asset details if the assets are pre-generated, because the user is not allowed to
             * provide any details. It is to avoid unncessary activity logs for respective Asset */
            if (!hasAssetPregenerated) {
                // Asset Tag and Serial Number
                if (details.asset_tag) {
                    assetGR.setValue('asset_tag', details.asset_tag);
                }
                if (details.serial_number) {
                    assetGR.setValue('serial_number', details.serial_number);
                }

                if (isSoftwareItem) {
                    // Software fields: license_key, rights
                    if (details.license_key) {
                        assetGR.setValue('license_key', details.license_key);
                    }
                    if (details.rights) {
                        assetGR.setValue('rights', details.rights);
                    }

                    assetGR.cost = assetGR.receiving_line.cost.getReferenceCurrencyCode() + ';' + String( parseFloat(assetGR.receiving_line.cost.getReferenceValue()) * assetGR.rights );
                }

                if (!gs.nil(details.reserved_for) && !gs.nil(details.reserved_for.value)) {
                    assetGR.setValue('reserved_for', details.reserved_for.value);
                    if (!isSoftwareItem) {
                        assetGR.setValue('substatus', "reserved");
                    }
                }
                else if (reserve) {
                    // If reserve toggle in Receive screen is turned on, mark the asset as Reserved
                    assetGR.setValue('reserved_for', requestedFor);
                }
            }

            if (reserve) {
                assetGR.setValue('substatus', "reserved");
            }

            assetGR.salvage_value = pol.model.salvage_value;
            assetGR.depreciation = pol.model.depreciation;
            assetGR.update();
        }

        function findAssetDetails(sysId) {
            var asset;
            /* Find details of specific asset by sys_id */
            for (var i = 0; i < assetDetails.length; i++) {
                if (sysId == assetDetails[i].sys_id) {
                    asset = assetDetails.splice(i, 1);
                    break;
                }
            }
            return asset;
        }
    },

    createReceiptSlipLine: function(rec_slip, pol, qty, costWithCurrency, requestedFor, tags, serials, reserve, isSoftwareItem, rights, licenseKeys) {
        var assetTable = 'alm_asset';
        if (isSoftwareItem) {
            assetTable = 'alm_license';
        }

        var rslGr = new GlideRecord('proc_rec_slip_item');
        rslGr.initialize();
        rslGr.purchase_line = pol.sys_id;
        rslGr.requested_for = requestedFor;
        rslGr.received = gs.nowDateTime();
        rslGr.received_by = gs.getUserID();
        rslGr.receiving_slip = rec_slip.sys_id;
        rslGr.quantity = qty;
        rslGr.setDisplayValue('cost', costWithCurrency);

        var rslId = rslGr.insert();
        // Handle asset tags, asset serials, and asset reservation
        var asset = new GlideRecord(assetTable);
        asset.addQuery('receiving_line', rslId);
        asset.query();
        for (var x = 0; x < qty; x++) {
            var tag = '';
            var serial = '';
            var licenseKey = '';
            if (tags && x < tags.length && tags[x]) {
                tag = tags[x];
            }
            if (serials && x < serials.length && serials[x]) {
                serial = serials[x];
            }
            if (licenseKeys && x < licenseKeys.length && licenseKeys[x]) {
                licenseKey = licenseKeys[x];
            }
            if (asset.next()) {
                if (licenseKey)  { asset.license_key = licenseKey; }
                if (reserve)     { asset.substatus = "reserved"; }
                if (serial)      { asset.serial_number = serial; }
                if (rights)      { asset.rights = rights; }
                if (tag)         { asset.asset_tag = tag; }

                asset.salvage_value = pol.model.salvage_value;
                asset.depreciation = pol.model.depreciation;

                asset.update();
            }
        }
    },

    createReceiptSlipLineForSAMP: function(rec_slip, polGr, pol) {
        var rslGr = new GlideRecord('proc_rec_slip_item');
        rslGr.initialize();
        rslGr.purchase_line = polGr.sys_id;
        rslGr.requested_for = pol.requested_for.sys_id;
        rslGr.received = gs.nowDateTime();
        rslGr.received_by = gs.getUserID();
        rslGr.receiving_slip = rec_slip.sys_id;
        rslGr.quantity = pol.receiving_quantity;
        rslGr.setDisplayValue('cost', pol.cost_with_currency);
        var rslId = rslGr.insert(); // Inserting the Receiving Slip Line will call createRecSlipLineAssets() from a BR

        // Handle asset tag, serial number
        var licGr = new GlideRecord('alm_license');
        licGr.addQuery('receiving_line', rslId);
        licGr.query();
        if (licGr.next()) {
            licGr.asset_tag = pol.asset_tag || "";
            licGr.serial_number = pol.serial_number || "";
            licGr.update();
            // Create license keys defined in the PO receive page
            if (pol.licenseKeys && pol.licenseKeys.length) {
                var lkGr;
                for (var lk = 0; lk < pol.licenseKeys.length; lk++) {
                    lkGr = new GlideRecord('samp_sw_license_key');
                    lkGr.initialize();
                    lkGr.software_entitlement = licGr.sys_id + '';
                    lkGr.license_key = pol.licenseKeys[lk].license_key;
                    lkGr.insert();
                }
            }
        }
    },

    createRecSlipLineConsumables: function(pol, rsl, qty) {

        var po = new GlideRecord('proc_po');
        po.get(pol.purchase_order);

        var rs =  new GlideRecord('proc_rec_slip');
        rs.get(rsl.receiving_slip);

        var asset = new GlideRecord('alm_asset');

        asset.addQuery('model', pol.model);
        asset.addQuery('install_status', 2);
        asset.addQuery('purchase_line', pol.sys_id);
        asset.query();

        while (qty > 0) {
            if (asset.next()) {
                if (qty >= asset.quantity) {
                    asset.install_status = 6;
                    asset.substatus = 'available';
                    asset.purchase_line = '';
                    asset.cost = rsl.cost * asset.quantity;
                    asset.stockroom = rsl.receiving_slip.stockroom;
                    asset.update();
                    qty -= asset.quantity;
                } else {
                    this._createConsumable(po, pol, qty, 6, rs.stockroom, rsl);
                    asset.quantity -= qty;
                    asset.update();
                    qty = 0;
                }
            } else {
                this._createConsumable(po, pol, qty, 6, rs.stockroom, rsl);
                qty = 0;
            }
        }
    },

    createRecSlipLineAssets: function(pol, rsl, qty,  assetSysIds, reserve) {
        var STATUS_IN_STOCK = 6;
        var STATUS_ON_ORDER = 2;
        var STATUS_IN_USE = 1;
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
    },

    cancelProcurementOrders: function(scRequest) {
        if (scRequest.sourceable) {
            var requestedItem = new GlideRecord('sc_req_item');
            requestedItem.addQuery('request', scRequest.getUniqueValue());
            requestedItem.query();
            while (requestedItem.next()) {
                var requestedItemId = requestedItem.getUniqueValue();
                this._cancelPurchaseOrderLines(requestedItemId);
                this._cancelTransferOrderLines(requestedItemId);
            }
        }
    },

    _cancelPurchaseOrderLines: function(requestedItemId) {
        var purchaseOrderLine = new GlideRecord('proc_po_item');
        purchaseOrderLine.addQuery('request_line', requestedItemId);
        purchaseOrderLine.query();
        while (purchaseOrderLine.next()) {
            if (purchaseOrderLine.getValue('status') != 'received') {
                purchaseOrderLine.setValue('status', 'canceled');
                purchaseOrderLine.update();
            }
        }
    },

    _cancelTransferOrderLines: function(requestedItemId) {
        var transferOrderLine = new GlideRecord('alm_transfer_order_line');
        transferOrderLine.addQuery('request_line', requestedItemId);
        transferOrderLine.query();
        while (transferOrderLine.next()) {
            var stage = transferOrderLine.getValue('stage');
            if (stage != 'received' && stage != 'delivered' && stage != 'in_transit') {
                transferOrderLine.setValue('stage', 'cancelled');
                transferOrderLine.update();
            }
        }
    },

    _createConsumable: function(po, pol, qty, status, stockroom, rsl) {
        var asset = new GlideRecord('alm_consumable');
        asset.quantity = qty;
        asset.model = pol.model;
        //model category is consumable
        asset.model_category = '218323293743100044e0bfc8bcbe5d61';
        asset.install_status = status;

        if (status == 2) {
            asset.purchase_line = pol.sys_id;
        }
        if (stockroom) {
            asset.stockroom = stockroom;
        }
        if (rsl) {
            asset.cost = rsl.cost * qty;
        }

        asset.insert();
    },

    _createAsset: function(po, pol, status, rsl, reserve) {
        //Respect "Don't create assets" option
        if (pol.model.asset_tracking_strategy == "do_not_track") {
            return;
        }

        //Avoid creating asset if there's no category
        if (!pol.model.cmdb_model_category){
            var message = gs.getMessage("No Assets for \"{0}\" were created because the Product Model does not have a Model Category",
                pol.model.display_name);
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

    _createSoftware: function(po, pol, status, rsl) {

        var asset = new GlideRecord('alm_license');
        asset.initialize();
        asset.model = pol.model;
        asset.install_status = status;
        asset.reserved_for = po.requested_by;
        asset.purchase_line = pol.sys_id;
        asset.request_line = pol.request_line;
        asset.vendor = po.vendor;
        asset.acquisition_method = 'purchase';
        if (rsl) {
            asset.receiving_line = rsl.sys_id;
            asset.reserved_for = rsl.requested_for;
            asset.cost = rsl.cost.getReferenceCurrencyCode() + ';' + String( parseFloat(rsl.cost.getReferenceValue()) * rsl.quantity );
            asset.stockroom = rsl.receiving_slip.stockroom;
            /* By default Receiving line quantity is the S/W asset rights unless the user split the license further. */
            if (this.isSAMPActive) {
                asset.purchased_rights = rsl.quantity;
                asset.metric_group = pol.metric_group;
                asset.license_metric = pol.license_metric;
                asset.salvage_value = pol.model.salvage_value || "";
                asset.depreciation = pol.model.depreciation || "";
            } else {
                asset.rights = rsl.quantity;
            }

            asset.work_notes = gs.getMessage('Received through Purchase Order {0} by {1}', [ (this.getHref(po, po.number)), (gs.getUser().getFullName()) ]);
        }

        asset.insert();
    },

    _findPO: function(item, vendor, consolidate, destination) {
        var request = new GlideRecord('sc_request');
        request.get(item.request);

        var po = new GlideRecord('proc_po');
        po.addQuery('vendor', vendor);
        po.addQuery('ship_to', destination);
        po.addQuery('status', 'requested');
        if (consolidate == false) {
            po.addQuery('init_request', request.sys_id);
        }
        po.query();
        if (po.next()) {
            return po;
        }
        else {
            return this.createPO(request, vendor, destination);
        }
    },

    getHref: function(record, text) {
        return '[code]<a href=' + record.getLink(true) + '>' + String(text) + '</a>[/code]';
    },

    type: 'ProcurementUtils'
};