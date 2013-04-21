/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.YearsTape = {
	_isInYear: 0,
	_windowHeight: 0,
	_yearTops: {},
	
	/*** Initializer ***/

	init: function() 
	{
		jQuery( "#years_tape div.year-label" ).click( Sarpaque.YearsTape.clickHandler );
		/* Remove the location hash if any */
		location.hash = "banner";
	},
	
	/*** Sarpaque events ***/
	
	pageResized: function( windowHeight, windowWidth )
	{
		this._windowHeight = windowHeight;
		/* Set years tape in the middle */
		var ytWidth = jQuery( "#years_tape" ).outerWidth( true );
		var ycWidth = jQuery( "#years_content div.inner" ).width();
		jQuery( "#years_tape" ).css( "right", ( ( windowWidth - ycWidth ) / 2 ) - ytWidth );		
	},
	
	scroll: function( scrollTop )
	{
		var year = Sarpaque.YearsTape._getVisibleYear( scrollTop );
		if( year != Sarpaque.YearsTape._isInYear ) {
			/* Set years tape */
			Sarpaque.YearsTape._setYearsTape( year );		
			/* Load new years */
			Sarpaque.YearsTape._loadYears( year );
			Sarpaque.YearsTape._isInYear = year;
		}		
	},
	
	yearLoaded: function( year )
	{
		var y;
		for( var i = 0; i < SarpaqueConfig.timelineData.years.length; i++ ) {
			y = SarpaqueConfig.timelineData.years[i];
			if( y < year ) continue;
			this._yearTops[y] = jQuery( "#year_" + y ).offset().top;
		}
	},

	/*** DOM Events handlers ***/

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
		if( i < SarpaqueConfig.timelineData.years.length - 1 ) yToLoad.push( SarpaqueConfig.timelineData.years[i+1] );

		/* Create request */
		Sarpaque.YearsTape._pendingRequest = {
			"yearsToLoad": yToLoad,
			"yearsToLoadLength": yToLoad.length,
			"scrollTo": y
		};

		/* Activate loader */
		Sarpaque.Loader.show();

		/* Load the years */
		for( i = 0; i < yToLoad.length; i++ ) {
			Sarpaque.TimeLine.loadYear( yToLoad[i], Sarpaque.YearsTape.yearIsLoaded );
		}		
	},
	
	/*** Public methods ***/
	
	getCurrentYear: function()
	{
		return this._isInYear;
	},
	
	/*** Private event handlers ***/

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
			/* Scroll */
			Sarpaque.YearsTape._scrollToYear( Sarpaque.YearsTape._pendingRequest.scrollTo );
			delete Sarpaque.YearsTape._pendingRequest;			
			/* Hide loader */
			Sarpaque.Loader.hide();
		}
	},
		
	/*** Private methods ***/	

	_scrollToYear: function( year, callBack )
	{
		if( Sarpaque.TimeLine.loadedYears[year] == undefined ) return false;
		location.hash = "year_" + year;
		this._setYearsTape( year );
		if( callBack != undefined ) callBack( year );
		return true;
	},	
	
	_getVisibleYear: function( scrollTop )
	{
		var scrollMiddle = scrollTop + ( this._windowHeight / 2 );
		var y;
		for( var i = SarpaqueConfig.timelineData.years.length - 1; i > 0; i-- ) {
			y = SarpaqueConfig.timelineData.years[i];
			if( this._yearTops[y] == undefined ) continue;
			if( scrollMiddle > this._yearTops[y] ) return y;
		}
		return SarpaqueConfig.timelineData.years[0];
	},

	_setYearsTape: function( newYear )
	{
		jQuery( "#years_tape div.year-label.current" ).removeClass( "current" );
		jQuery( "#years_tape div.year-label#y_" + newYear ).addClass( "current" );
	},

	_loadYears: function( newYear )
	{
		/* Are any unloaded years? */
		if( SarpaqueConfig.timelineData.years.length == Sarpaque.numOfLoadedYears ) return;

		/* Decide years to load */
		var numOfYears = 2;		
		for( var yearIdx = 0; yearIdx < SarpaqueConfig.timelineData.years.length; yearIdx++ ) {
			if( SarpaqueConfig.timelineData.years[yearIdx] != newYear ) continue;
			break;
		}
		var yearsToLoad = [newYear];
		if( yearIdx > 0 ) yearsToLoad.push( SarpaqueConfig.timelineData.years[yearIdx - 1] );
		if( yearIdx < SarpaqueConfig.timelineData.years.length - 1 ) 
			yearsToLoad.push( SarpaqueConfig.timelineData.years[yearIdx + 1] );

		/* Start loading this years */
		if( yearsToLoad.length == 0 ) return;
		for( var i = 0; i < yearsToLoad.length; i++ ) {
			Sarpaque.TimeLine.loadYear( yearsToLoad[i] );	
		}
	}
};
