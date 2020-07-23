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
    const json = JSON.parse(JSON.stringify(shp.readFileSync(input)))[
        "features"
    ];
    console.log("Length: ", json.length);
    let all = [];
    for (let i = 0; i < json.length; i++) {
        let properties = {};
        for (let key in json[i].properties) {
            properties[key] = parseInt(
                json[i].properties[key].replace(/^[ ]+|[ ]+$/g, "")
            );
            if (isNaN(properties[key]))
                properties[key] = json[i].properties[key].replace(
                    /^[ ]+|[ ]+$/g,
                    ""
                );
            if (properties[key] === "") properties[key] = null;
        }
        properties.geometry = json[i].geometry;
        all.push(properties);
        if (chunks) {
            if (i % 10000 === 0 && i > 1) {
                j++;
                fs.writeFileSync(
                    "output/json/data" + j + ".json",
                    JSON.stringify(all)
                );
                console.log("File: ", j);
                all = [];
            }
        }
    }
    j++;
    fs.writeFileSync("output/json/data" + j + ".json", JSON.stringify(all));
    all = [];
}

function validateLength(input) {
    const data = JSON.parse(fs.readFileSync(input)).length;
    console.log(data);
}

function jsonToCsv(input) {
    //Doesn't work yet
    const data = JSON.parse(fs.readFileSync(input));

    let j = 0;
    for (let i = 0; i < data.length; i++) {
        if (i % 4000 === 0) j++;
        fs.appendFileSync(
            "output/csv/data" + j + ".csv",
            `"${i + 1}","${JSON.stringify(data[i].geometry.coordinates)}","${
                data[i].properties.fclass
            }",${
                data[i].properties.name == ""
                    ? "NULL"
                    : `${JSON.stringify(
                          data[i].properties.name.replace(/\"/gi, "")
                      )}`
            },"${data[i].properties.bridge == "T" ? 1 : 0}","${
                data[i].properties.tunnel == "T" ? 1 : 0
            }"\r\n`
        );
    }
}
