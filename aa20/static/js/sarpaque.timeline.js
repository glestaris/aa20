/**
 * This file is part of ALICE Anniversary 2013 website
 * Author: George Lestaris (george.lestaris@cern.ch)
 */

Sarpaque.TimeLine = {
	/** 
	 * Timeline status:
	 *		{
	 *				<year>: {
	 *					media: {
	 *						<Media URL>: <Object>
	 *					},
	 *					top: <Top offset of the year>
	 *				}, ...
	 * 		}
	 */
	loadedYears: {},

	/**
	 * Pending loader requests:
	 * 		{
	 * 			<year>: {
	 *				year: <Year>,
	 *				pendingMedia: {
	 *					<URL>: <Object>,
	 *					...
	 *				},
	 *				loaedMedia:  {
	 *					<URL>: <Object>,
	 *					...
	 *				},
	 *				failedMedia: {
	 *					<URL>: <Object>,
	 *					...
	 *				}
	 * 			}, ...
	 * 		}
	*/
	_pendingRequests: {},

	loadYear: function( year, callBack ) {
		/* Is year shown? */
		if( this.loadedYears[year] != undefined ) {
			if( callBack != undefined ) callBack( year );
			return true;
		}
		/* Pending request exists? */
		if( this._pendingRequests[year] != undefined ) return true;
		/* Find year */
		var y = SarpaqueConfig.timelineData.media[year];
		if( y == undefined ) return false;
		
		/* Create request */
		this._pendingRequests[year] = {
			"year": year,
			"pendingMedia": {},
			"loadedMedia": {},
			"failedMedia": {},
			"callback": callBack
		}
		if( y.background != undefined && SarpaqueConfig["loadBackgrounds"] )
			this._pendingRequests[year].pendingMedia[y.background] = this._createMediaObject( y.background, year, "image" );
		for( var key in y.boxes ) {				
			this._pendingRequests[year].pendingMedia[y.boxes[key]] = this._createMediaObject( y.boxes[key], year, "image" );
		}
		if( SarpaqueConfig["loadForegrounds"] ) {
			for( var key in y.foregrounds ) {				
				this._pendingRequests[year].pendingMedia[y.foregrounds[key]] = this._createMediaObject( y.foregrounds[key], year, "image" );
			}
		}

		if( Sarpaque.inDebug ) console.log( "Started loading year: " + year );
		return true;				
	},	

	_showYear: function( year ) {
		if( this.loadedYears[year] != undefined ) return false;
		if( ! this._yearIsDone( year ) ) return false;
		if( SarpaqueConfig.timelineData.media[year] == undefined ) return false;

		/* Set media */
		var y = SarpaqueConfig.timelineData.media[year];
		if( y.background != undefined && SarpaqueConfig["loadBackgrounds"] )
			jQuery( "#year_" + year ).css( "background-image", "url(" + y.background + ")" );
		for( var boxID in y.boxes ) {
			jQuery( "#box_" + boxID ).append( "<img src=\"" + y.boxes[boxID] + "\" />" );			
		}
		if( SarpaqueConfig["loadForegrounds"] ) {
			for( var fgID in y.foregrounds ) {
				jQuery( "#foreground_" + fgID ).append( "<img src=\"" + y.foregrounds[fgID] + "\" />" );
			}
			jQuery( "#year_" + year + " div.foreground" ).removeClass( "hidden" );
		}
		jQuery( "#year_" + year + " div.box" ).removeClass( "hidden" );
		jQuery( "#year_" + year + " div.loader-box" ).hide();		

		/* Remove request */
		this.loadedYears[year] = {
			"media": this._pendingRequests[year].loadedMedia
		};
		var cb = this._pendingRequests[year].callback;
		delete this._pendingRequests[year];

		/* Update loaded years */
		this._updateLoadedYears();

		/* Update page */
		Sarpaque.pageResized();

		/* Call callback */
		if( Sarpaque.inDebug ) console.log( "Year " + year + " loaded!" );
		if( cb != undefined ) cb( year );

		return true;
	},

	_updateLoadedYears: function()
	{
		for( y in this.loadedYears ) {
			this.loadedYears[y].top = jQuery( "#year_" + y ).offset().top;
		}
	},

	_createMediaObject: function( url, year, type )
	{
		if( type != "image" ) return undefined;
		var ob = new Image();	        
        var that = this;
        ob.onload = function() { that._imgLoadedCallback( url, year ) }
        ob.onerror = function() { that._imgFailedCallback( url, year ) }
        ob.src = url;
        return ob;
	},

	_yearIsDone: function( year )
	{
		if( this._pendingRequests[year] == undefined ) return false;
		for( key in this._pendingRequests[year].pendingMedia ) {
			return false;
		}
		return true;
	},

	_imgLoadedCallback: function( url, year )
	{
		if( this._pendingRequests[year].pendingMedia[url] == undefined ) return;

		this._pendingRequests[year].loadedMedia[url] = this._pendingRequests[year].pendingMedia[url];
		delete this._pendingRequests[year].pendingMedia[url];

		/* Are images pending? */
		if( this._yearIsDone( year ) ) this._showYear( year );
	},

	_imgFailedCallback: function( url, year )
	{
		if( this._pendingRequests[year].pendingMedia[url] == undefined ) return;

		this._pendingRequests[year].failedMedia[url] = this._pendingRequests[year].pendingMedia[url];
		delete this._pendingRequests[year].pendingMedia[url];
		
		/* Are images pending? */
		if( this._yearIsDone( year ) ) this._showYear( year );
	}	
}
