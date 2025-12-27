sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"booksorelistview/test/integration/pages/BooksList",
	"booksorelistview/test/integration/pages/BooksObjectPage"
], function (JourneyRunner, BooksList, BooksObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('booksorelistview') + '/test/flpSandbox.html#booksorelistview-tile',
        pages: {
			onTheBooksList: BooksList,
			onTheBooksObjectPage: BooksObjectPage
        },
        async: true
    });

    return runner;
});

