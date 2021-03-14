import * as d3 from "d3";
import data from './datasets/owid-covid-data.csv';
import data2 from './datasets/country_vaccinations.csv';
import data3 from './datasets/countries_codes_and_coordinates.csv';
export var pack = {};

var fs = require('browserify-fs');
export function getData_for_country(dpack, iso) {

    var output = dpack
    output.data = output.data.filter(function (data) {

        return data.iso === iso;
    });

    return output

}

export async function getData( _callback) {
    Promise.all([
        d3.csv(data),
        d3.csv(data2),
        d3.csv(data3)
    ]).then(([csv1, csv2, csvgeo]) => {

        var data = csv1.map(row => {
            return {
                iso: row['iso_code'],
                date: Date.parse(row['date']),
                total_cases: Number(row['total_cases']),
                total_deaths: Number(row['total_deaths']),
                new_cases: Number(row['new_cases']),
                new_deaths: Number(row['new_deaths']),
                population: Number(row['population'])

            }
        })
        var data2 = csv2.map(row => {
            return {
                iso: row['iso_code'],
                date: Date.parse(row['date']),
                people_vaccinated: Number(row['people_vaccinated']),
                people_fully_vaccinated: Number(row['people_fully_vaccinated'])
            }
        })
        var datag = csvgeo.map(row => {
            return {
                name: row['Country'],
                iso: row['Alpha-3 code'].substring(2, 5),
                lat: Number(row['Latitude (average)'].substring(2, row['Latitude (average)'].length - 1)),
                lng: Number(row['Longitude (average)'].substring(2, row['Longitude (average)'].length - 1))
            }
        })

        data2.forEach(function (rv) {
            var result = data.filter(function (rc) {
                return rc
                    .iso === rv.iso && rc.date === rv.date;
            });

            rv.total_cases = (result[0] !== undefined) ? result[0].total_cases : null;
            rv.total_deaths = (result[0] !== undefined) ? result[0].total_deaths : null;
            rv.new_cases = (result[0] !== undefined) ? result[0].new_cases : null;
            rv.new_deaths = (result[0] !== undefined) ? result[0].new_deaths : null;
            rv.population = (result[0] !== undefined) ? result[0].population : null;

            var result = datag.filter(function (rc) {
                return rc.iso === rv.iso;
            });
            rv.name = (result[0] !== undefined) ? result[0].name : null;
            rv.lng = (result[0] !== undefined) ? result[0].long : null;
            rv.lat = (result[0] !== undefined) ? result[0].lng : null;
        });

        //console.log(data2);
        // console.log(data)
        /**
         var filtered = data.filter(function (el) {
                    return (el.gname != "Unknown");
                });
         */

        var holderV = {};
        var holderC = {};

        data2.forEach(function (d) {
            if (holderV.hasOwnProperty(d.iso)) {
                holderV[d.iso] = holderV[d.iso] + d.people_vaccinated;
            } else {
                holderV[d.iso] = d.people_vaccinated;
            }
            if (holderC.hasOwnProperty(d.iso)) {
                holderC[d.iso] = holderC[d.iso] + d.new_cases;
            } else {
                holderC[d.iso] = d.new_cases;
            }
        });
        // console.log(datag)


        var filteredC = [];

        datag.forEach(function (d) {
            filteredC.push({
                name: d.name,
                iso: d.iso,
                population:(data.find(x => x.iso === d.iso) !== undefined) ? data.find(x => x.iso === d.iso).population : 0,
                total_deaths:(data.find(x => x.iso === d.iso) !== undefined) ? data.reverse().find(x => x.iso === d.iso).total_deaths : 0,
                total_case: holderC[d.iso],
                total_vac: holderV[d.iso],
                lat: d.lat,
                lng: d.lng
            });
        })
        filteredC = filteredC.filter(function (rc) {
            return rc.total_case !== undefined;
        });
        //console.log(filteredC)
        filteredC.forEach(function (d) {
            var l = []

            filteredC.forEach(function (d1) {

                l.push({iso: d1.iso, dis: Math.sqrt(Math.pow(d1.lat - d.lat, 2) + Math.pow(d1.lng - d.lng, 2))})
            })
            l = l.sort(function (a, b) {
                return a.dis - b.dis
            }).slice(1, 6)
            //console.log(l)
            d.close = l
        })

        //console.log(filteredC);

        //data = filtered2
        console.log("good");

        data2 = data2.filter(function (data) {
            return data.date !== null;
        });
        /**
        var c = datag[Math.floor(Math.random() * Math.floor(datag.length))].iso
        while (filteredC.find(x => x.iso === c) === undefined || filteredC.find(x => x.iso === c).total_case === 0) {
            c = datag[Math.floor(Math.random() * Math.floor(datag.length))].iso;
        }

        var c = get_iso

        data = data2.filter(function (data) {

            return data.iso === c;
        });
         */
        data = data2

        //console.log(data)
        data.sort((a, b) => (a.date > b.date) ? 1 : -1)
        pack = {data: data, CList: filteredC}
        console.log(pack);
        let out = JSON.stringify(pack);

        fs.writeFile("./data.json", out, (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been created");
        });
        _callback();
    })

}
