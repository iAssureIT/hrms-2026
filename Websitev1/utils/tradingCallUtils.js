// src/utils/tradingCallUtils.js
import moment from "moment";
import validator from "validator";
import S3FileUpload from "react-s3";

export const formatDate = (date) => {
    return moment(date).format("DDMMMYYYY").toUpperCase();
};

export const formatWithCommas = (value) => {
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
    }
    let [integerPart, decimalPart] = value.split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
};

export const validateField = (fieldName, value, entry, target1, stopLoss, setError, setAction) => {
    if (validator.isEmpty(String(value ?? ""))) {
        setError((prev) => ({ ...prev, [fieldName]: "Enter some value here" }));
    }

    let clean = (val) => parseFloat(String(val).replace(/,/g, ""));
    if (!validator.isEmpty(String(entry ?? "")) &&
        !validator.isEmpty(String(target1 ?? "")) &&
        !validator.isEmpty(String(stopLoss ?? ""))) {
        const e = clean(entry);
        const t = clean(target1);
        const s = clean(stopLoss);

        if (!isNaN(e) && !isNaN(t) && !isNaN(s)) {
            if (e < t && e > s) {
                setAction("BUY");
                setError((prev) => ({
                    ...prev,
                    entry: "",
                    target1: "",
                    stopLoss: ""
                }));
            } else if (e > t && e < s) {
                setAction("SELL");
                setError((prev) => ({
                    ...prev,
                    entry: "",
                    target1: "",
                    stopLoss: ""
                }));
            } else {
                setAction(null);
                setError((prev) => ({
                    ...prev,
                    entry: "Verify this value",
                    target1: "Verify this value",
                    stopLoss: "Verify this value"
                }));
            }
        } else {
            setAction(null);
            setError((prev) => ({
                ...prev,
                entry: "Verify this value",
                target1: "Verify this value",
                stopLoss: "Verify this value"
            }));
        }
    } else {
        setAction(null);
        setError((prev) => ({
            ...prev,
            entry: "Verify this value",
            target1: "Verify this value",
            stopLoss: "Verify this value"
        }));
    }
};

export const generateDescription = (
    scriptNameSelected,
    disclaimerSelected,
    subCallType,
    action,
    scriptName,
    symbol,
    expDate,
    strikePrice,
    selectedOptionType,
    entry,
    target1,
    target2,
    stopLoss,
    exchange,
    currMarketPrice,
    instrumentType) => {

    let description = [];
    if (scriptNameSelected) {
        description.push(`${scriptNameSelected + ":"}`);
    }
    if (subCallType) {
        description.push(subCallType ? `${subCallType}:` : "");
        description.push(action ? action : "");
        description.push(symbol);
        if (expDate) {
            description.push(formatDate(expDate));
        }
        const instrument = instrumentType?.toUpperCase();
        const exchangeUpper = exchange?.toUpperCase();
        if (
            strikePrice &&
            strikePrice !== "-" &&
            strikePrice !== "0" &&
            !(
                (exchangeUpper === "MCX" && instrument === "FUTCOM") ||
                (exchangeUpper === "NSE F&O" && (instrument === "FUTSTK" || instrument === "FUTIDX"))
            )
        ) {
            const cleanedStrike = strikePrice.toString().replace(/,/g, "");
            const formattedStrike = Number(cleanedStrike).toFixed(2);
            description.push(formattedStrike);
        }
        if (
            selectedOptionType &&
            selectedOptionType !== "-" &&
            selectedOptionType !== "0" &&
            !(
                (exchangeUpper === "MCX" && instrument === "FUTCOM") ||
                (exchangeUpper === "NSE F&O" && (instrument === "FUTSTK" || instrument === "FUTIDX"))
            )
        ) {
            description.push(selectedOptionType);
        }
        if (action === "BUY") {
            description.push("ABV");
        } else if (action) {
            description.push("BELOW");
        }
        if (entry !== undefined && entry !== null && entry !== "") {
            const cleanedEntry = entry.toString().replace(/,/g, "");
            const numberEntry = Number(cleanedEntry);
            if (!isNaN(numberEntry)) {
                description.push(numberEntry.toFixed(2));
            }
        }
        if (target1) {
            const cleanedTarget1 = target1.toString().replace(/,/g, "");
            const formattedTarget1 = Number(cleanedTarget1).toFixed(2);
            description.push(`TGT ${formattedTarget1}`);
        }
        if (stopLoss) {
            const cleanedStopLoss = stopLoss.toString().replace(/,/g, "");
            const formattedStopLoss = Number(cleanedStopLoss).toFixed(2);
            description.push(
                action === "BUY"
                    ? `SL BELOW ${formattedStopLoss}`
                    : `SL ABV ${formattedStopLoss}`
            );
        }
        if (currMarketPrice) {
            const cleanedCMP = currMarketPrice.toString().replace(/,/g, "");
            const formattedCMP = Number(cleanedCMP).toFixed(2);
            description.push(`CMP: ${formattedCMP}.`);
        }
        if (exchange) {
            description.push(exchange);
        }
    }
    if (disclaimerSelected) {
        description.push(`(${disclaimerSelected + ": https://bit.ly/2ziDavw"})`);
    }
    return description.join(" ");
};

export const extractExpiryDate = (dataString, symbol) => {
    const cleanedString = dataString.replace(symbol, "");
    const match = cleanedString.match(/\d{2}[A-Z]{3}\d{2,4}/);
    if (!match) return "";
    const rawDate = match[0];
    const day = rawDate.substring(0, 2);
    const monthStr = rawDate.substring(2, 5);
    const yearPart = rawDate.substring(5);
    const year = yearPart.length === 2 ? "20" + yearPart : yearPart;
    const monthMap = {
        JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
        JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
    };
    const month = monthMap[monthStr.toUpperCase()] || "01";
    return `${year}-${month}-${day}`;
};

export const checkActionValues = (entry, target1, stopLoss, action) => {
    if (!entry || !target1 || !stopLoss) return "<p> Please Double Check Entry Price, Target & Stop Loss Values </p>";
    const entryValue = parseFloat(entry.replace(/,/g, ""));
    const target1Value = parseFloat(target1.replace(/,/g, ""));
    const stopLossValue = parseFloat(stopLoss.replace(/,/g, ""));
    if (isNaN(entryValue) || isNaN(target1Value) || isNaN(stopLossValue)) return "<p> Please Double Check Entry Price, Target & Stop Loss Values </p>";
    if (action === "BUY") {
        if (target1Value <= entryValue || stopLossValue >= entryValue) {
            return `<p><strong>BUY Condition</strong><br/>Target must be > ${entryValue} and StopLoss must be < ${entryValue}.</p>`;
        } else {
            return "";
        }
    } else if (action === "SELL") {
        if (target1Value >= entryValue || stopLossValue <= entryValue) {
            return `<p><strong>SELL Condition</strong><br/> Target must be < ${entryValue} and StopLoss must be > ${entryValue}</p>`;
        } else {
            return "";
        }
    } else {
        return "<p> Please Double Check Entry Price, Target & Stop Loss Values </p>";
    }
};

export const validation = (subCallType, exchange, scriptName, action, currMarketPrice, entry, target1, stopLoss) => {
    let validate = true;
    let errorMsg = {};
    if (validator.isEmpty(subCallType)) {
        validate = false;
        errorMsg.subCallType = "This field is Mandatory.";
    }
    if (validator.isEmpty(exchange)) {
        validate = false;
        errorMsg.exchange = "This field is Mandatory.";
    }
    if (validator.isEmpty(scriptName)) {
        validate = false;
        errorMsg.scriptName = "This field is Mandatory.";
    }
    if (validator.isEmpty(action)) {
        validate = false;
        errorMsg.action = "This field is Mandatory.";
    }
    if (validator.isEmpty(currMarketPrice)) {
        validate = false;
        errorMsg.currMarketPrice = "This field is Mandatory.";
    }
    if (validator.isEmpty(entry)) {
        validate = false;
        errorMsg.entry = "This field is Mandatory.";
    }
    if (validator.isEmpty(target1)) {
        validate = false;
        errorMsg.target1 = "This field is Mandatory.";
    }
    if (validator.isEmpty(stopLoss)) {
        validate = false;
        errorMsg.stopLoss = "This field is Mandatory.";
    }
    return { validate, errorMsg };
};

export const s3upload = (fileInfo, config) => {
    return new Promise((resolve, reject) => {
        S3FileUpload.uploadFile(fileInfo, config)
            .then((Data) => resolve(Data.location))
            .catch(reject);
    });
};

export const getDefaultMonth = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0 = Jan
    const currentYear = currentDate.getFullYear();
    const shortCurrentYear = currentYear.toString().slice(-2); // "25"

    const monthBase = [
        { name: "January", short: "JAN" },
        { name: "February", short: "FEB" },
        { name: "March", short: "MAR" },
        { name: "April", short: "APR" },
        { name: "May", short: "MAY" },
        { name: "June", short: "JUN" },
        { name: "July", short: "JUL" },
        { name: "August", short: "AUG" },
        { name: "September", short: "SEP" },
        { name: "October", short: "OCT" },
        { name: "November", short: "NOV" },
        { name: "December", short: "DEC" },
    ];
    return `${monthBase[currentMonthIndex].short}${shortCurrentYear}`;
};

export const getMonthOptions = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const shortCurrentYear = currentYear.toString().slice(-2);
    const shortNextYear = (currentYear + 1).toString().slice(-2);
    const monthBase = [
        { name: "January", short: "JAN" },
        { name: "February", short: "FEB" },
        { name: "March", short: "MAR" },
        { name: "April", short: "APR" },
        { name: "May", short: "MAY" },
        { name: "June", short: "JUN" },
        { name: "July", short: "JUL" },
        { name: "August", short: "AUG" },
        { name: "September", short: "SEP" },
        { name: "October", short: "OCT" },
        { name: "November", short: "NOV" },
        { name: "December", short: "DEC" },
    ];
    return monthBase.map((month, index) => {
        const isNextYear = index < currentMonthIndex;
        const yearSuffix = isNextYear ? shortNextYear : shortCurrentYear;
        return {
            label: `${month.name} ${yearSuffix}`,
            value: `${month.short}${yearSuffix}`,
        };
    });
};