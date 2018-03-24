/**
 * Created by ttjornhom on 12/15/17.
 */


var cat_id = gel('sc_category').value;


if (cancel_or_submit == "submit") {
    if (catalog == 'hardware')
        catalog = 'pc_hardware_cat_item';
    else if (catalog == 'software')
        catalog = 'pc_software_cat_item';
    else if (catalog == 'customer')
        catalog = 'u_customer_product_catalog';
    else
        catalog = 'pc_product_cat_item';

    if (type == 'vendor')
        var gr = new GlideRecord('pc_vendor_cat_item');
    else
        var gr = new GlideRecord('cmdb_model');
    gr.get(item);
    gr.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(gr, sc_category, type, catalog);
    gr.update();
    response.sendRedirect(catalog + ".do?sys_id=" + gr.product_catalog_item);
} else {
    var urlOnStack = GlideSession.get().getStack().bottom();
    response.sendRedirect(urlOnStack);
}




var gr = new GlideRecord('cmdb_model');
gr.get(item);
gr.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(gr, sc_category, type, u_customer_product_catalog);
gr.update();
