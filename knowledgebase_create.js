/**
 * Created by ttjornhom on 1/31/18.
 */
var generateCompanyKB = Class.create();
generateCompanyKB.prototype = {

    initialize: function() {
    },

    generateKB: function() {

        var logSource = 'generateCompanyKB';
        try{
            var usr = gs.getUser().getID();
            var newRec;
            var companyName = current.name;
            var company = current.sys_id;
            var tempKB = gs.getProperty('rbh.template.kb');
            var getKB = new GlideRecord('kb_knowledge_base');
            getKB.addQuery('title', tempKB);
            getKB.query();
            if(getKB.next()){
                var genKB = new GlideRecord('kb_knowledge_base');
                genKB.initialize();
                genKB.title = companyName;
                genKB.workflow = getKB.workflow;
                genKB.retire_workflow = getKB.workflow;
                genKB.description = companyName + ' KB';
                genKB.template = getKB.template;
                genKB.u_company = company;
                genKB.workflow = getKB.workflow;
                genKB.retire_workflow = getKB.retire_workflow;
                genKB.disable_commenting = getKB.disable_commenting;
                genKB.disable_suggesting = getKB.disable_suggesting;
                genKB.disable_category_editing = getKB.disable_category_editing;
                genKB.insert();
                newRec = genKB.sys_id;
            }

            //now that we have the KB we need to get Categories
            var getCat;
            var copyCat;
            var getSubCat;
            var copySubCat;
            getCat = new GlideRecord('kb_category');
            getCat.addQuery('parent_id', getKB.sys_id);
            getCat.query();
            while(getCat.next()){
                copyCat = new GlideRecord('kb_category');
                copyCat.initialize();
                copyCat.label = getCat.label;
                copyCat.value = getCat.value;
                copyCat.active = 'true';
                copyCat.u_knowledge_base = newRec;
                if(getCat.parent_table == 'kb_knowledge_base'){
                    copyCat.parent_table = getCat.parent_table;
                    copyCat.parent_id = newRec;
                    copyCat.insert();
                    getSubCat = new GlideRecord('kb_category');
                    getSubCat.addQuery('parent_id', getCat.sys_id);
                    getSubCat.query();
                    while (getSubCat.next()){
                        copySubCat = new GlideRecord ('kb_category');
                        copySubCat.initialize();
                        copySubCat.parent_id = copyCat.sys_id;
                        copySubCat.parent_table = 'kb_category';
                        copySubCat.label = getSubCat.label;
                        copySubCat.value = getSubCat.value;
                        copySubCat.active = 'true';
                        copySubCat.u_knowledge_base = newRec;
                        copySubCat.insert();

                    }

                }
            }
            //create new UC record for this company
            var userCrit;
            var newUC = new GlideRecord('user_criteria');
            newUC.initialize();
            newUC.company = company;
            newUC.name = 'Contact from Company: ' + companyName;
            userCrit = newUC.insert();

            var newUCR;
            newUCR = new GlideRecord('kb_uc_can_read_mtom');
            newUCR.initialize();
            newUCR.kb_knowledge_base = newRec;
            newUCR.user_criteria = userCrit;
            newUCR.insert();

            //	now that we have the KB we need to get User criteria
            var getUCR; //can read
            var copyUCR; //can read
            var getUCC; //can contribute
            var copyUCC; //can contribute
            var getUCNR; //cannot read
            var copyUCNR; //cannot read
            var getUCNC; //cannot contrib
            var copyUCNC; //cannot contrib

            // can read
            getUCR = new GlideRecord('kb_uc_can_read_mtom');
            getUCR.addQuery('kb_knowledge_base', getKB.sys_id);
            getUCR.query();
            while(getUCR.next()){
                copyUCR = new GlideRecord('kb_uc_can_read_mtom');
                copyUCR.initialize();
                copyUCR.kb_knowledge_base = newRec;
                copyUCR.user_criteria = getUCR.user_criteria;
                copyUCR.insert();
            }
            //can contribute
            getUCC = new GlideRecord('kb_uc_can_contribute_mtom');
            getUCC.addQuery('kb_knowledge_base', getKB.sys_id);
            getUCC.query();
            while(getUCC.next()){
                copyUCC = new GlideRecord('kb_uc_can_contribute_mtom');
                copyUCC.initialize();
                copyUCC.kb_knowledge_base = newRec;
                copyUCC.user_criteria = getUCC.user_criteria;
                copyUCC.insert();
            }

            //kb_uc_cannot_read_mtom
            getUCNR = new GlideRecord('kb_uc_cannot_read_mtom');
            getUCNR.addQuery('kb_knowledge_base', getKB.sys_id);
            getUCNR.query();
            while(getUCNR.next()){
                copyUCNR = new GlideRecord('kb_uc_cannot_read_mtom');
                copyUCNR.initialize();
                copyUCNR.kb_knowledge_base = newRec;
                copyUCNR.user_criteria = getUCNR.user_criteria;
                copyUCNR.insert();
            }
            //kb_uc_cannot_contribute_mtom
            getUCNC = new GlideRecord('kb_uc_cannot_contribute_mtom');
            getUCNC.addQuery('kb_knowledge_base', getKB.sys_id);
            getUCNC.query();
            while(getUCNC.next()){
                copyUCNC = new GlideRecord('kb_uc_cannot_contribute_mtom');
                copyUCNC.initialize();
                copyUCNC.kb_knowledge_base = newRec;
                copyUCNC.user_criteria = getUCNC.user_criteria;
                copyUCNC.insert();
            }

            //now that we have the new KB and Categories we can copy the articles over
            var getArt;
            var copyArt;
            getArt = new GlideRecord ('kb_knowledge');

            // added query to limit articles to Active and Published

            kbarticlequery = 'kb_knowledge_base=' + getKB.sys_id + '^active=true^workflow_state=published'
            getArt.addEncodedQuery(kbarticlequery);
           // getArt.addQuery('kb_knowledge_base', getKB.sys_id);

            getArt.query();
            while(getArt.next()){
                var catDV = getArt.kb_category.full_category;
                copyArt = new GlideRecord('kb_knowledge');
                copyArt.initialize();
                copyArt.author = usr;
                copyArt.kb_knowledge_base = newRec;

                var catLU = new GlideRecord('kb_category');
                catLU.addQuery('u_knowledge_base', newRec);
                catLU.addQuery('value', getArt.kb_category.value);
                catLU.query();
                if(catLU.next()){
                    copyArt.kb_category = catLU.sys_id;
                }

                copyArt.short_description = getArt.short_description;
                copyArt.meta = getArt.meta;
                copyArt.text = getArt.text;
                copyArt.company = newRec.u_company;
                copyArt.article_type = getArt.article_type;
                var newArt = copyArt.insert();

                var getAtt = new GlideRecord('sys_attachment');
                getAtt.addQuery('table_sys_id', getArt.sys_id);
                getAtt.query();
                while(getAtt.next()){
                    var genAtt = new GlideRecord('sys_attachment');
                    genAtt.initialize();
                    genAtt.table_sys_id = newArt;
                    genAtt.table_name = 'kb_knowledge';
                    genAtt.file_name = getAtt.file_name;
                    genAtt.content_type = getAtt.content_type;
                    genAtt.insert();
                }
            }


            return newRec;


        }

        catch(err){
            var msg = 'Script Include ERROR: ' + err;
            gs.log(msg, logSource);
            return msg;
        }

    },
    type: 'generateCompanyKB'
};