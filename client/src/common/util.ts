// Copyright (C) 2016  Patrick Maué
// 
// This file is part of vscode-journal.
// 
// vscode-journal is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// vscode-journal is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with vscode-journal.  If not, see <http://www.gnu.org/licenses/>.
//
'use strict';

import * as Q from 'q';
import * as journal from './';
import * as Path from 'path';
import * as fs from 'fs';

/**
 * Utility Methods for the vscode-journal extension
 */


/**
*  Check if config dir exists, otherwise copy defaults from extension directory
*  We can't Q's nfcall, since those nodejs operations don't have (err,data) responses
* 
*  fs.exists does only return "true", see https://github.com/petkaantonov/bluebird/issues/418
*  @param path 
*/
export function checkIfFileIsAccessible(path: string): Q.Promise<void> {
    let deferred: Q.Deferred<void> = Q.defer();
    fs.access(path, (err) => {
        if (err == null) deferred.resolve(null);
        else deferred.reject(err.message);
    });
    return deferred.promise;
}


/**
 * Return day of week for given string. W
 */
export function getDayOfWeekForString(day: string): number {
    day = day.toLowerCase();
    if (day.match(/monday|mon|montag/)) return 1;
    if (day.match(/tuesday|tue|dienstag/)) return 2;
    if (day.match(/wednesday|wed|mittwoch/)) return 3;
    if (day.match(/thursday|thu|donnerstag/)) return 4;
    if (day.match(/friday|fri|freitag/)) return 5;
    if (day.match(/saturday|sat|samstag/)) return 6;
    if (day.match(/sunday|sun|sonntag/)) return 7;
    return -1;
}


/**
* Formats a given Date in long format (for Header in journal pages)
*/
export function formatDate(date: Date): string {
    let dateFormatOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    return date.toLocaleDateString(this.config.getLocale(), dateFormatOptions);
}


/**
* Returns target  for notes as string; 
*/
export function getFilePathInDateFolder(date: Date, filename: string): Q.Promise<string> {
    let deferred: Q.Deferred<string> = Q.defer<string>();
    let path = Path.resolve(this.getPathOfMonth(date), this.getDayAsString(date), filename + "." + this.config.getFileExtension());
    deferred.resolve(path);
    return deferred.promise;
}


/**
 * Returns the filename of a given URI. 
 * Example: "21" of uri "file://some/path/to/21.md""
 * @param uri 
 */
export function getFileInURI(uri: string, withExtension?: boolean): string {
    let p: string = uri.substr(uri.lastIndexOf("/") + 1, uri.length);
    if (withExtension == null || !withExtension) {
        return p.split(".")[0];
    } else {
        return p;
    }
}

export function getNextLine(content: string): string[] {

    let res: string[] = ["", ""];

    let pos: number = content.indexOf('\n');
    if (pos > 0) {
        res[0] = content.slice(0, pos);
        res[1] = content.slice(pos + 1, content.length);
    } else {
        res[0] = content;
    }
    return res;
}

/**
* Returns the path for a given date as string
*/
export function getEntryPathForDate(date: Date): Q.Promise<string> {
    var deferred: Q.Deferred<string> = Q.defer<string>();
    let path = Path.join(this.getPathOfMonth(date), this.getDayAsString(date) + "." + this.config.getFileExtension());
    deferred.resolve(path);
    return deferred.promise;
}



/**
 * Returns path to month folder. 
 */
export function getPathOfMonth(date: Date): string {
    let year = date.getFullYear().toString();
    let month = this.prefixZero(date.getMonth() + 1);
    return Path.resolve(this.config.getBasePath(), year, month);
}


export function getDayAsString(date: Date): string {
    return this.prefixZero(date.getDate());
}

/**
* Takes a number and a leading 0 if it is only one digit, e.g. 9 -> "09"
*/
export function prefixZero(nr: number): string {
    let current = nr.toString();
    if (current.length == 1) current = '0' + current;
    return current;
}


/**
 * Returns a normalized filename for given string. Special characters will be replaced. 
 * @param input 
 */
export function normalizeFilename(input: string): Q.Promise<string> {
    var deferred: Q.Deferred<string> = Q.defer<string>();
    Q.fcall(() => {
        input = input.replace(/\s/g, '_');
        input = input.replace(/\\|\/|\<|\>|\:|\n|\||\?|\*/g, '-');
        input = encodeURIComponent(input);

        deferred.resolve(input);
    });

    return deferred.promise;
}

export function denormalizeFilename(input: string): string {
    let type: string = input.substring(input.lastIndexOf(".") + 1, input.length);
    input = input.substring(0, input.lastIndexOf("."));
    input = input.replace(/_/g, " ");

    if (type != this.config.getFileExtension()) {
        input = "(" + type + ") " + input;
    }
    return input;
}