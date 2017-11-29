d3.csv('./aircraft_incidents.csv',
    function(d) {
        return {
    		accident_number: d['Accident_Number'],
            data: d['Event_Date'],
    		make: d['Make'],
    		model: d['Model'],
    		airline: d['Air_Carrier'],
    		phase: d['Broad_Phase_of_Flight'],
            severity: d['Injury_Severity'],
            damage: d['Aircraft_Damage'],
            fatal_injuries: +d['Total_Fatal_Injuries'],
            serious_injuries: +d['Total_Serious_Injuries'],
            uninjured: +d['Total_Uninjured']
        };
    }, function(error, dataset) {
        if (error) {
            console.error('Error while loading ./aircraft_incidents.csv dataset.');
            console.error(error);
            return;
        }

        incidents = dataset;

        console.log(incidents);
    });
