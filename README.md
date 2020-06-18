# TypeSheetDB

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

TypeSheetDB is a helpful layer of TypeScript goodness that turns a good ol' Google Sheet into a reliable and consistent database management system and API. By providing an opinionated framework for how applications can interact with your data, you can make fields required, ensure type consistency, and enforce unique primary keys.

It's primary goal is to offer more consitency than other Sheet-as-a-Database services or libraries by assuming that you are using TypeSheetDB to create an application as the primary means of working with data. You can still do some amount of data management via the spreadsheet interface, but API operations give you the most consistency. 

You can still go off the rails and use most of the features pretty much zero config, but clearly lose some of the benefits.

But TypeSheetDB does a few other things for you as well:

## User-friendly GUI

We use the Google Sheets interface to create some helpful menus to work with your data. You can get all of the benefit on having an API for your app while not needing to use it yourself to manage data.

## Client-side JavaScript SDK

If you don't want to connect to your TypeSheetDB from another backend service, you can use our client-side JavaScript SDK to easily connect to and work with your dataset.

## Data Pipes

As you create your data model in Google Sheets, you can specify different data pipelines to run when certain records are created, modified, or deleted: create a PDF from every new record and email that to someone, geocode a Lat/Lng to an address using Google Maps, or write your own function using Google Apps Script.

## Getting Started

