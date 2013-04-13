/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.YearsTape = {
	pageResized: function( windowHeight, windowWidth )
	{
		/* Set years tape in the middle */
		var ytWidth = jQuery( "#years_tape" ).outerWidth( true );
		var ycWidth = jQuery( "#years_content div.inner" ).width();
		jQuery( "#years_tape" ).css( "right", ( ( windowWidth - ycWidth ) / 2 ) - ytWidth );		
	},

	clickHandler: function()
	{
		if( Sarpaque.YearsTape._pendingRequest != undefined ) return;
		var y = jQuery( this ).data( "for-year" );		
		
		/* Set years to load */
		var yToLoad = [];
		for( var i = 0; i < SarpaqueConfig.timelineData.years.length; i++ ) {
			if( SarpaqueConfig.timelineData.years[i] == y ) break;
		}
		yToLoad.push( SarpaqueConfig.timelineData.years[i] );
		if( i > 0 ) yToLoad.push( SarpaqueConfig.timelineData.years[i-1] );
		// if( i > 0 ) {
		// 	for( var j = i - 1; j >= 0; j-- ) { yToLoad.push( SarpaqueConfig.timelineData.years[j] ); }			
		// }
		if( i < SarpaqueConfig.timelineData.years.length - 1 ) yToLoad.push( SarpaqueConfig.timelineData.years[i+1] );

		/* Create request */
		Sarpaque.YearsTape._pendingRequest = {
			"yearsToLoad": yToLoad,
			"yearsToLoadLength": yToLoad.length,
			"scrollTo": y
		};

		/* Load the years */
		for( i = 0; i < yToLoad.length; i++ ) {
			Sarpaque.TimeLine.loadYear( yToLoad[i], Sarpaque.YearsTape.yearIsLoaded );
		}		

		if( Sarpaque.inDebug ) console.log( "Received request to move to year " + y );
	},

	yearIsLoaded: function( year )
	{
		if( Sarpaque.YearsTape._pendingRequest == undefined ) return;

		/* Remove year from list */
		for( i = 0; i < Sarpaque.YearsTape._pendingRequest.yearsToLoad.length; i++ ) {
			if( Sarpaque.YearsTape._pendingRequest.yearsToLoad[i] == year ) {
				delete Sarpaque.YearsTape._pendingRequest.yearsToLoad[i];
				Sarpaque.YearsTape._pendingRequest.yearsToLoadLength--;
				break;
			}
		}

		/* Move to specific section */
		if( Sarpaque.YearsTape._pendingRequest.yearsToLoadLength == 0 ) {
			if( Sarpaque.inDebug ) console.log( "Moving to year " + Sarpaque.YearsTape._pendingRequest.scrollTo );
			/* Scroll */
			Sarpaque.ScrollSpy.scrollToYear( Sarpaque.YearsTape._pendingRequest.scrollTo );
			delete Sarpaque.YearsTape._pendingRequest;
		}
	},

	init: function() 
	{
		jQuery( "#years_tape div.year-label" ).click( Sarpaque.YearsTape.clickHandler );
	}
};
