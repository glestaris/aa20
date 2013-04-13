/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.ScrollSpy = {
	_isInYear: 0,
	_windowHeight: 0,

	scrollToYear: function( year, callBack )
	{
		if( Sarpaque.TimeLine.loadedYears[year] == undefined ) return false;

		// jQuery( window ).scrollTop( Sarpaque.TimeLine.loadedYears[year].top );
		location.hash = "year_" + year;
		this._setYearsTape( year );

		if( callBack != undefined ) callBack( year );
		return true;
	},

	scrollEventHandler: function()
	{
		var year = Sarpaque.ScrollSpy._getVisibleYear();
		if( year != Sarpaque.ScrollSpy._isInYear ) {
			console.log( "New year " + year );
			/* Set years tape */
			Sarpaque.ScrollSpy._setYearsTape( year );		
			/* Load new years */
			Sarpaque.ScrollSpy._loadYears( year );
			Sarpaque.ScrollSpy._isInYear = year;
		}
	},

	_getVisibleYear: function()
	{
		var scrollTop = jQuery( window ).scrollTop();
		var scrollMiddle = scrollTop + ( this._windowHeight / 2 );
		var y;
		for( var i = SarpaqueConfig.timelineData.years.length - 1; i > 0; i-- ) {
			y = SarpaqueConfig.timelineData.years[i];
			if( Sarpaque.TimeLine.loadedYears[y] == undefined ) continue;
			if( scrollMiddle > Sarpaque.TimeLine.loadedYears[y].top ) return y;
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
		console.log( yearsToLoad );

		/* Start loading this years */
		if( yearsToLoad.length == 0 ) return;
		for( var i = 0; i < yearsToLoad.length; i++ ) {
			Sarpaque.TimeLine.loadYear( yearsToLoad[i] );	
		}
	},

	init: function()
	{		
		jQuery( window ).resize( function() { Sarpaque.ScrollSpy._windowHeight = jQuery( window ).height() } );
		this._windowHeight = jQuery( window ).height();

		jQuery( window ).scroll( Sarpaque.ScrollSpy.scrollEventHandler );
		this.scrollEventHandler();
	}
};
