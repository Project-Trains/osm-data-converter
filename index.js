/**
 * Copyright (C) 2020 kalucky0 & Rakso260
 * This file is part of Project Trains OSM Data Converter.
 *
 * OSM Data Converter is free software: you can redistribute it and/or modify
 * it under the terms of the Creative Commons Attribution 4.0 International License.
 */

const shp = require("shp");
const fs = require("fs");

function shpToJson(input, chunks = true) {
    let j = 0;
    console.log("Parsing file...");
    const json = JSON.parse(JSON.stringify(shp.readFileSync(input)))["features"];
    console.log("Length: ", json.length);
    let all = [];
    for (let i = 0; i < json.length; i += 1) {
        let properties = {};
        for (let key in json[i].properties) {
            properties[key] = parseInt(json[i].properties[key].replace(/^[ ]+|[ ]+$/g, ""));
            if (isNaN(properties[key])) {
                properties[key] = json[i].properties[key].replace(/^[ ]+|[ ]+$/g, "")
            }
            if (properties[key] === "") {
                properties[key] = null
            }
        }
        for (let j = 0; j < json[i].geometry; j += 1) {
            for (let k = 0; k < json[i].geometry[j]; k += 1) {
                // Poland geometric center - [52.114339, 19.423672]
                properties.geometry[j][k][0] = calculateDistance(0, 19.42, 0, properties.geometry[j][k][0]);
                properties.geometry[j][k][1] = calculateDistance(52.11, 0, properties.geometry[j][k][1], 0);
            }
        }
        all.push(properties);
        if (chunks) {
            if (i % 10000 === 0 && i > 1) {
                j += 1;
                fs.writeFileSync("output/json/data" + j + ".json", JSON.stringify(all));
                console.log("File: ", j);
                all = []
            }
        }
    }
    j += 1;
    fs.writeFileSync("output/json/data" + j + ".json", JSON.stringify(all));
    all = []
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6378.137;
    const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000;
}

function validateLength(input) {
    const data = JSON.parse(fs.readFileSync(input)).length;
    console.log(data)
}

function jsonToCsv(input) {
    const data = JSON.parse(fs.readFileSync(input));
    let j = 0;
    for (let i = 0; i < data.length; i += 1) {
        if (i % 4000 === 0) {
            j += 1
        }
        fs.appendFileSync("output/csv/data" + j + ".csv", `"${i + 1}","${JSON.stringify(data[i].geometry.coordinates)}","${data[i].properties.fclass}",${data[i].properties.name == "" ? "NULL" : `${JSON.stringify(data[i].properties.name.replace(/\"/gi, ""))}`},"${data[i].properties.bridge == "T" ? 1 : 0}","${data[i].properties.tunnel == "T" ? 1 : 0}"\r\n`)
    }
}