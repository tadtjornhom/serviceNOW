getDupes(u_customers,u_consumer_id);

function getDupes(tableName,
                  dupeField) {
    var q = new GlideAggregate(tableName);
    //q.addQuery('active', '=', 'true'); //returns only active records
    q.addAggregate('COUNT', dupeField); //aggregate to count values in whatever field is passed as dupeField
    q.addHaving('COUNT', dupeField, '>', '1'); //returns only records having more than one active instance of dupeField (duplicates)
    q.query();
    var listOfDupes = new Array(); //build array to push the results into
    while (q.next()) {
        listOfDupes.push(q.getValue(dupeField)); //Push the value of the dupe field to the array
    }
    return listOfDupes;
}


function getDupes(tableName, dupeField) {
    var q = new GlideAggregate(tableName);
    //q.addQuery('active', '=', 'true'); //returns only active records
    q.addAggregate('COUNT', dupeField); //aggregate to count values in whatever field is passed as dupeField
    q.addHaving('COUNT', dupeField, '>', '1'); //returns only records having more than one active instance of dupeField (duplicates)
    q.query();
    var listOfDupes = new Array(); //build array to push the results into
    while (q.next()) {
        listOfDupes.push(q.getValue(dupeField)); //Push the value of the dupe field to the array
    }
    return listOfDupes;
};

