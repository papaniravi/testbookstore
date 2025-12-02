sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"bookstorelistview/test/integration/pages/BooksList",
	"bookstorelistview/test/integration/pages/BooksObjectPage"
], function (JourneyRunner, BooksList, BooksObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('bookstorelistview') + '/test/flpSandbox.html#bookstorelistview-tile',
        pages: {
			onTheBooksList: BooksList,
			onTheBooksObjectPage: BooksObjectPage
        },
        async: true
    });

    return runner;
});

